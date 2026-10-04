# Driver Portal — Task Tracker

Mobile browser interface for truck drivers (served at `driver.domain.com`), sharing the same backend + database as the ERP.
Agreed decisions: phone number + PIN login · "Confirm loading" → `IN_PROGRESS` · "Complete mission" → `PENDING_REVIEW` (truck/driver released at that point, ops approve → `FINISHED`, no reject flow) · fuel typed by the driver, receipt photo optional · Web Push notifications on mission assigned / updated / cancelled.

## Backend

### Database
- [x] Migration: `Mission` new fields (goods, weightKg, clientReference, expectedDeliveryDate, loadingConfirmedAt, completedAt, completionComment, reviewedAt)
- [x] Migration: `PENDING_REVIEW` mission status
- [x] Migration: `DriverCredential` table (login phone, PIN hash, lockout, token version)
- [x] Migration: `FuelEntry` table
- [x] Migration: `Attachment` — `MISSION` / `FUEL_ENTRY` owners + `category` (CMR / ODOMETER / FUEL_RECEIPT)
- [x] Migration: `PushSubscription` table

### Auth separation
- [x] Global `AuthGuard`: driver tokens rejected on staff routes, staff tokens rejected on driver routes
- [x] `DriverSessionGuard` + `@CurrentDriver()` (revoked/deleted drivers lose access immediately)

### Modules
- [x] `driver-auth` module — phone + PIN login, lockout after failed attempts, `GET driver/auth/me`
- [x] `driver-auth` — admin: set / reset / revoke a driver's PIN (`drivers/admin/:id/portal-access`)
- [x] `missions` — new fields in DTOs + `MissionLifecycleService` (single place for status transitions & truck/driver side effects)
- [x] `missions` — admin approve review endpoint + mission attachments endpoints
- [x] `missions` — domain events (assigned / updated / cancelled / unassigned)
- [x] `fuel-entries` module — service + admin read endpoint
- [x] `driver-portal` module — summary, my missions, mission detail, confirm loading
- [x] `driver-portal` — fuel entries (add / list / delete, optional receipt photo)
- [x] `driver-portal` — delivery & closure (CMR upload required, odometer photo, comment, complete)
- [x] `driver-portal` — secure attachment download (driver can only download own files)
- [x] `notifications` module — Web Push (VAPID), subscribe/unsubscribe, listeners on mission events
- [x] Activity log + dashboard aware of the new status / routes
- [x] Unit + e2e tests for the new rules

## Frontend — Driver portal (`/driver`)
- [x] Subdomain routing (`driver.domain.com` → `/driver`) + PWA manifest + service worker
- [x] Driver API client + auth (separate from staff session)
- [x] Login: phone + PIN, then PIN-only on return visits
- [x] Mobile layout with bottom navigation
- [x] 1. Home — greeting, counters, my missions
- [x] 2. Mission details — info + timeline + confirm loading
- [x] 3. Add fuel — form, receipt photo, recent entries
- [x] 4. Delivery & Closure — CMR upload, odometer photo, comment, complete
- [x] 5. Mission completed — summary screen
- [x] Missions tab, Fuel tab, Profile tab (notifications toggle, logout)
- [x] Push notifications opt-in (+ iPhone "Add to Home Screen" hint)

## Frontend — Admin side
- [x] Drivers: "Portal access" dialog (set / reset / revoke PIN)
- [x] Missions: new fields in create / edit / view dialogs
- [x] Missions: `PENDING_REVIEW` status everywhere (badges, filters, dashboard)
- [x] Missions: review view — fuel entries, CMR / odometer files, driver comment, Approve button

## Deploy
- [x] Env vars documented (`VAPID_*`, `DRIVER_JWT_EXPIRATION_TIME`)
- [x] Update CLAUDE.md
