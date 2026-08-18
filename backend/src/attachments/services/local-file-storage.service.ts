import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { extname, join } from 'path';

export interface StoredFile {
  /** Path relative to the uploads root — this is what gets persisted in the DB. */
  filePath: string;
  fileName: string;
  mimeType?: string;
  fileSize: number;
}

/**
 * The only place in the codebase that touches the filesystem for uploaded
 * files. Swapping to S3 (or any other backend) later means writing a class
 * with the same `save`/`delete`/`resolveAbsolutePath` shape and rebinding
 * one provider — nothing else in the app should call `fs` directly.
 */
@Injectable()
export class LocalFileStorageService {
  private readonly rootDir: string;

  constructor(private readonly configService: ConfigService) {
    this.rootDir = this.configService.get<string>('UPLOADS_DIR') ?? './uploads';
  }

  async save(
    buffer: Buffer,
    subdir: string,
    originalName: string,
    mimeType?: string,
  ): Promise<StoredFile> {
    const dir = join(this.rootDir, subdir);
    await fs.mkdir(dir, { recursive: true });

    const uniqueName = `${randomUUID()}${extname(originalName)}`;
    const relativePath = join(subdir, uniqueName);

    await fs.writeFile(join(this.rootDir, relativePath), buffer);

    return {
      filePath: relativePath,
      fileName: originalName,
      mimeType,
      fileSize: buffer.length,
    };
  }

  async delete(relativePath: string): Promise<void> {
    await fs.rm(join(this.rootDir, relativePath), { force: true });
  }

  resolveAbsolutePath(relativePath: string): string {
    return join(this.rootDir, relativePath);
  }
}
