/**
 * Domain events about missions, published on the app-wide event bus so
 * other modules (e.g. push notifications to drivers) can react without
 * MissionsModule knowing about them. Only emitted for IN_HOUSE missions,
 * since only those have a driver.
 */
export const MissionEvents = {
  /** A driver was put on a mission (new mission, or driver swapped in). */
  DRIVER_ASSIGNED: 'mission.driver-assigned',
  /** A driver was taken off a mission they had. */
  DRIVER_UNASSIGNED: 'mission.driver-unassigned',
  /** Something the driver cares about changed (route, dates, truck…). */
  DETAILS_CHANGED: 'mission.details-changed',
  CANCELLED: 'mission.cancelled',
} as const;

export class MissionDriverEvent {
  constructor(
    public readonly missionId: number,
    public readonly driverId: number,
  ) {}
}
