/** Every PIN is exactly this many digits. */
export const PIN_LENGTH = 6;

/** Wrong PINs allowed in a row before the account is temporarily locked. */
export const MAX_FAILED_PIN_ATTEMPTS = 5;

export const PIN_LOCKOUT_MINUTES = 15;

/** Drivers stay signed in on their phone for this long unless revoked. */
export const DEFAULT_DRIVER_TOKEN_TTL = '30d';
