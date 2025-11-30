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

  async serveConfigFiles(res: Response): Promise<void> {
    const possiblePaths = [
      '/Users/mohamedkhounti/Documents/dom-server-side/configfiles.zip',
      '/root/configfiles.zip',
      path.join(process.cwd(), '..', 'configfiles.zip'),
    ];

    let filePath: string;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      res.status(404).json({
        statusCode: 404,
        message: `configfiles.zip not found. Tried: ${possiblePaths.join(', ')}`,
        error: 'Not Found',
      });
      return;
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="configfiles.zip"',
    );

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (err) => {
      console.error('Error streaming configfiles.zip:', err);
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Error streaming file',
          error: 'Internal Server Error',
        });
      }
    });

    fileStream.pipe(res);
  }

  async serveInstallScript(res: Response): Promise<void> {
    const possiblePaths = [
      '/Users/mohamedkhounti/Documents/dom-server-side/install.ps1',
      '/root/install.ps1',
      path.join(process.cwd(), '..', 'install.ps1'),
    ];

    let filePath: string;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      res.status(404).json({
        statusCode: 404,
        message: `install.ps1 not found. Tried: ${possiblePaths.join(', ')}`,
        error: 'Not Found',
      });
      return;
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="install.ps1"',
    );

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (err) => {
      console.error('Error streaming install.ps1:', err);
      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Error streaming file',
          error: 'Internal Server Error',
        });
      }
    });

    fileStream.pipe(res);
  }
}
