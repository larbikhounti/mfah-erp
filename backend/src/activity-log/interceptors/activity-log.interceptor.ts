import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityLogService } from '../services/activity-log.service';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Maps a controller's route segment (its @Controller path) to the Prisma
// client delegate that backs it, plus the human-readable label shown on
// the Activity Log page. Every ERP entity module lives here; anything not
// listed is skipped (see IGNORED_MODULES / the mapping?.label fallback).
const MODULE_DELEGATES: Record<string, { delegate: string; label: string }> =
  {
    trucks: { delegate: 'truck', label: 'Trucks' },
    drivers: { delegate: 'driver', label: 'Drivers' },
    clients: { delegate: 'client', label: 'Clients' },
    subcontractors: { delegate: 'subcontractor', label: 'Subcontractors' },
    missions: { delegate: 'mission', label: 'Missions' },
    'client-invoices': { delegate: 'clientInvoice', label: 'Client Invoices' },
    'subcontractor-bills': {
      delegate: 'subcontractorBill',
      label: 'Subcontractor Bills',
    },
    users: { delegate: 'users', label: 'Users' },
    roles: { delegate: 'roles', label: 'Roles' },
    permissions: { delegate: 'permission', label: 'Permissions' },
  };

// Routes deliberately never written to the log: auth (login/refresh isn't
// a data mutation), attachments (logged implicitly through the owning
// entity's own admin/:id/attachments route), and the log's own endpoints
// (clearing it already logs itself explicitly, see ActivityLogService.clear).
const IGNORED_MODULES = new Set(['auth', 'attachments', 'activity-logs']);

const ACTION_KEYWORDS = [
  'create',
  'restore',
  'bulk',
  'bulk-restore',
  'status',
  'payment',
  'attachments',
  'generate-pdf',
  'roles',
];

type RouteInfo = {
  moduleSegment: string;
  moduleLabel: string;
  action: string;
  entityId?: string;
  delegate?: string;
};

function deriveAction(method: string, segments: string[]): string {
  const known = segments.find((s) => ACTION_KEYWORDS.includes(s));

  switch (known) {
    case 'create':
      return 'CREATE';
    case 'restore':
      return 'RESTORE';
    case 'bulk':
      return 'BULK_DELETE';
    case 'bulk-restore':
      return 'BULK_RESTORE';
    case 'status':
      return 'STATUS_CHANGE';
    case 'payment':
      return 'PAYMENT_UPDATE';
    case 'attachments':
      return method === 'DELETE' ? 'ATTACHMENT_DELETE' : 'ATTACHMENT_UPLOAD';
    case 'generate-pdf':
      return 'PDF_GENERATED';
    case 'roles':
      return 'PERMISSIONS_UPDATE';
  }

  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return method;
  }
}

// Reads the matched route + resolved params off the request — works for
// every module above with zero per-module wiring, since they all follow
// the same "admin/create", "admin/:id", "admin/:id/restore", "admin/bulk",
// "admin/bulk-restore" convention documented in CLAUDE.md.
function parseRoute(request: any): RouteInfo | null {
  const routePath: string | undefined = request.route?.path;
  const rawPath: string =
    routePath || request.originalUrl?.split('?')[0] || '';
  const segments = rawPath.split('/').filter(Boolean);

  while (
    segments.length &&
    (segments[0] === 'api' || /^v\d+$/.test(segments[0]))
  ) {
    segments.shift();
  }

  const moduleSegment = segments.shift();
  if (!moduleSegment || IGNORED_MODULES.has(moduleSegment)) {
    return null;
  }

  const mapping = MODULE_DELEGATES[moduleSegment];
  const moduleLabel = mapping?.label ?? moduleSegment;

  if (segments[0] === 'admin') {
    segments.shift();
  }

  const actionSegments = segments.filter((seg) => !seg.startsWith(':'));
  const params = request.params || {};

  let entityId: string | undefined;
  let delegate = mapping?.delegate;

  if (actionSegments[0] === 'attachments' && request.method === 'DELETE') {
    delegate = 'attachment';
    entityId = params.attachmentId;
  } else if (params.id) {
    entityId = params.id;
  } else if (params.roleId) {
    entityId = params.roleId;
  }

  return {
    moduleSegment,
    moduleLabel,
    action: deriveAction(request.method, actionSegments),
    entityId,
    delegate,
  };
}

// Best-effort snapshot: fetched before the handler runs (and thus before
// an update/delete mutates the row), but not inside the same transaction
// as the handler's own read+write — a concurrent second write to the same
// row in the same instant could in theory race it. Acceptable for an audit
// trail; never allowed to throw, since a lookup failure must never break
// the real request.
async function fetchBefore(
  prisma: PrismaService,
  routeInfo: RouteInfo,
): Promise<unknown> {
  if (!routeInfo.delegate || !routeInfo.entityId) {
    return undefined;
  }
  const id = Number(routeInfo.entityId);
  if (Number.isNaN(id)) {
    return undefined;
  }

  try {
    if (routeInfo.moduleSegment === 'permissions') {
      return await (prisma as any).permission.findMany({
        where: { roleId: id },
      });
    }
    return await (prisma as any)[routeInfo.delegate].findUnique({
      where: { id },
    });
  } catch {
    return undefined;
  }
}

// Registered globally (APP_INTERCEPTOR, see ActivityLogModule) so every
// current and future admin write route is captured automatically — no
// controller or service anywhere has to call a logging method itself.
@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private readonly activityLogService: ActivityLogService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;

    if (!MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    const user = request.user;
    const routeInfo = parseRoute(request);

    if (!user?.email || !routeInfo) {
      return next.handle();
    }

    const beforePromise = fetchBefore(this.prisma, routeInfo);

    return next.handle().pipe(
      tap((response) => {
        void beforePromise.then((before) => {
          this.activityLogService.log({
            actorEmail: user.email,
            actorId: user.sub,
            module: routeInfo.moduleLabel,
            action: routeInfo.action,
            entityId: routeInfo.entityId,
            before,
            after: response,
          });
        });
      }),
    );
  }
}
