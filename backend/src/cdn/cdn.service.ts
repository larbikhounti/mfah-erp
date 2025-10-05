import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as archiver from 'archiver';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CdnService {
  async serveDomeClientSide(res: Response): Promise<void> {
    // From backend/dist -> ../../dom-client-side
    const sourcePath = path.join(__dirname, '../../../dom-client-side');

    if (!fs.existsSync(sourcePath)) {
      throw new Error('dom-client-side directory not found');
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
