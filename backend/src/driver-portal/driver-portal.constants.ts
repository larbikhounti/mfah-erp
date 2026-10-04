/** Largest file a driver can upload (CMR scan, receipt, odometer photo).
 *  The portal compresses photos on the phone first, so this is mostly hit
 *  by multi-page PDFs. */
export const DRIVER_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const DRIVER_UPLOAD_MIME_TYPES: ReadonlySet<string> = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

/** How many finished missions the home screen shows. */
export const HOME_RECENT_COMPLETED_LIMIT = 5;
