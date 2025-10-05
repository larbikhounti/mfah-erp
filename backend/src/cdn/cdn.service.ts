import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CdnService {
  async serveDomeClientSide(res: Response): Promise<void> {
    // Try multiple possible paths
    const possiblePaths = [
      '/root/dom-client-side', // absolute path on server
    ];

    let sourcePath: string;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        sourcePath = p;
        break;
      }
    }

    if (!sourcePath) {
      throw new Error(
        `dom-client-side directory not found. Tried: ${possiblePaths.join(', ')}`,
      );
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="dom-client-side.zip"',
    );

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);
    archive.directory(sourcePath, false);
    await archive.finalize();
  }
}
