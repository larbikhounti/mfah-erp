/**
 * Domain events about drivers, published on the app-wide event bus
 * (@nestjs/event-emitter). Emitters don't know who listens, so modules like
 * driver-auth and notifications can react without DriversModule importing them.
 */
export const DriverEvents = {
  PHONE_CHANGED: 'driver.phone-changed',
  PORTAL_ACCESS_REVOKED: 'driver.portal-access-revoked',
} as const;

export class DriverPhoneChangedEvent {
  constructor(
    public readonly driverId: number,
    public readonly phone: string,
  ) {}
}

export class DriverPortalAccessRevokedEvent {
  constructor(public readonly driverId: number) {}
}
