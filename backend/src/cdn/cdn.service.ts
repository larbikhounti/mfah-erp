import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CdnService {
  async serveDomeClientSide(res: Response): Promise<void> {
    const sourcePath = path.resolve(process.cwd(), '../dom-client-side');

    if (!fs.existsSync(sourcePath)) {
      throw new Error('dome-client-side directory not found');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="dome-client-side.zip"',
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
