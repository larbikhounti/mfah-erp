import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

// Keys whose values are never written to the log file, even nested inside
// a before/after snapshot — these are credentials, not business data.
const SENSITIVE_KEYS = new Set([
  'password',
  'jwttoken',
  'accesstoken',
  'token',
  'refreshtoken',
]);

const SEPARATOR = '='.repeat(80);

export type ActivityLogEntry = {
  actorEmail: string;
  actorId?: number;
  module: string;
  action: string;
  entityId?: string | number;
  before?: unknown;
  after?: unknown;
};

// Recursively redacts sensitive fields before anything touches disk. Only
// descends into plain object literals — a Date, a Prisma Decimal, or any
// other class instance is left untouched so JSON.stringify still uses its
// own toJSON() (a Date/Decimal has no own enumerable properties, so
// treating it like a plain object here would stringify it as "{}").
function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === 'object' && isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SENSITIVE_KEYS.has(key.toLowerCase())
        ? '[REDACTED]'
        : redact(val);
    }
    return out;
  }
  return value;
}

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function formatEntry(entry: ActivityLogEntry, date: Date): string {
  const lines = [
    SEPARATOR,
    `Date:    ${date.toISOString()}`,
    `Actor:   ${entry.actorEmail}${entry.actorId ? ` (user #${entry.actorId})` : ''}`,
    `Module:  ${entry.module}`,
    `Action:  ${entry.action}`,
  ];

  if (entry.entityId !== undefined) {
    lines.push(`Entity:  #${entry.entityId}`);
  }

  if (entry.before !== undefined) {
    lines.push('Before:');
    lines.push(indent(JSON.stringify(redact(entry.before), null, 2)));
  }

  if (entry.after !== undefined) {
    lines.push('After:');
    lines.push(indent(JSON.stringify(redact(entry.after), null, 2)));
  }

  return lines.join('\n') + '\n';
}

function indent(text: string): string {
  return text
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
}

// Backs the admin-only Activity Log page: every write is appended to a
// plain-text file (not a DB table — deliberately readable/greppable/
// erasable independently of the app's data), reads are served from that
// same file, and the whole thing lives outside the request/response cycle
// so a slow disk never delays the actual API response.
@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);
  private readonly filePath: string;

  // A single promise chain serializes writes onto the same file handle so
  // concurrent requests appending at once can never interleave partial
  // lines — each write waits for the previous one, but the caller (the
  // interceptor) never waits on this chain itself.
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly configService: ConfigService) {
    const configuredPath =
      this.configService.get<string>('ACTIVITY_LOG_PATH') ||
      './logs/activity.log';
    this.filePath = path.resolve(process.cwd(), configuredPath);
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '');
    }
  }

  getFilePath(): string {
    return this.filePath;
  }

  // Fire-and-forget: callers (the interceptor) must NOT await this — the
  // append happens asynchronously off the request/response path, so a
  // logged action never adds latency to the API call that triggered it.
  log(entry: ActivityLogEntry): void {
    const text = formatEntry(entry, new Date());
    this.writeQueue = this.writeQueue
      .then(() => fs.promises.appendFile(this.filePath, text))
      .catch((error) => {
        this.logger.error('Failed to write activity log entry', error);
      });
  }

  async getLatest(limit: number): Promise<{ raw: string; count: number }> {
    let content: string;
    try {
      content = await fs.promises.readFile(this.filePath, 'utf-8');
    } catch {
      return { raw: '', count: 0 };
    }

    const entries = splitEntries(content);
    const latest = entries.slice(-limit).reverse();

    return {
      raw: latest.join(`\n${SEPARATOR}\n`),
      count: entries.length,
    };
  }

  async clear(actorEmail: string, actorId?: number): Promise<void> {
    await this.writeQueue;
    await fs.promises.writeFile(this.filePath, '');
    this.log({
      actorEmail,
      actorId,
      module: 'Activity Log',
      action: 'CLEAR',
    });
    await this.writeQueue;
  }
}

function splitEntries(content: string): string[] {
  return content
    .split(new RegExp(`^${SEPARATOR}$`, 'm'))
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}
