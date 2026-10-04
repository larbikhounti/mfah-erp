/** What the driver portal's service worker receives and displays. */
export interface PushMessage {
  title: string;
  body: string;
  /** Portal path opened when the notification is tapped. */
  url: string;
  /** Same tag = replaces the previous notification instead of stacking. */
  tag?: string;
}
