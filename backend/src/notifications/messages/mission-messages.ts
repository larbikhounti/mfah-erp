import { Mission } from '@prisma/client';
import { PushMessage } from '../types/push-message.type';

/** Drivers read times in Moroccan local time, whatever the server's zone. */
const DISPLAY_TIME_ZONE = 'Africa/Casablanca';

const dateTime = new Intl.DateTimeFormat('fr-FR', {
  timeZone: DISPLAY_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

type MissionSummary = Pick<
  Mission,
  'id' | 'reference' | 'loadingLocation' | 'deliveryLocation' | 'missionDate'
>;

const route = (m: MissionSummary) =>
  `${m.loadingLocation} → ${m.deliveryLocation}`;
const missionUrl = (m: MissionSummary) => `/driver/missions/${m.id}`;

/** The text of every push a driver can receive about a mission. */
export const MissionMessages = {
  assigned: (m: MissionSummary): PushMessage => ({
    title: `New mission ${m.reference}`,
    body: `${route(m)} · Loading ${dateTime.format(m.missionDate)}`,
    url: missionUrl(m),
    tag: `mission-${m.id}`,
  }),

  detailsChanged: (m: MissionSummary): PushMessage => ({
    title: `Mission ${m.reference} updated`,
    body: `${route(m)} · Loading ${dateTime.format(m.missionDate)}. Check the new details.`,
    url: missionUrl(m),
    tag: `mission-${m.id}`,
  }),

  cancelled: (m: MissionSummary): PushMessage => ({
    title: `Mission ${m.reference} cancelled`,
    body: route(m),
    url: '/driver',
    tag: `mission-${m.id}`,
  }),

  unassigned: (m: MissionSummary): PushMessage => ({
    title: `Mission ${m.reference} removed`,
    body: `${route(m)} is no longer assigned to you.`,
    url: '/driver',
    tag: `mission-${m.id}`,
  }),
};
