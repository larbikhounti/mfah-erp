import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import {
  DRIVER_UPLOAD_MAX_BYTES,
  DRIVER_UPLOAD_MIME_TYPES,
} from '../driver-portal.constants';

/**
 * Validates a file uploaded from the driver portal (PDF or photo, size cap).
 * `required: false` lets optional uploads (the fuel receipt) pass through
 * as undefined.
 */
@Injectable()
export class DriverUploadPipe
  implements PipeTransform<Express.Multer.File | undefined>
{
  constructor(private readonly options: { required: boolean }) {}

  transform(file: Express.Multer.File | undefined) {
    if (!file) {
      if (this.options.required) {
        throw new BadRequestException('No file provided');
      }
      return undefined;
    }
    if (!DRIVER_UPLOAD_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPG, PNG or HEIC files');
    }
    if (file.size > DRIVER_UPLOAD_MAX_BYTES) {
      throw new BadRequestException('File is larger than 5 MB');
    }
    return file;
  }
}

/** Multer options shared by every driver upload route. */
export const driverUploadMulterOptions = {
  limits: { fileSize: DRIVER_UPLOAD_MAX_BYTES },
};
