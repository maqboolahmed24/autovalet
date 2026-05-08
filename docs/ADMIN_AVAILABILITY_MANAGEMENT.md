# Admin Availability Management

The AUTO VALET availability screen lets admin manage the working-hour rules and blocked time that shape public requested slots.

## Page Purpose

Admin can:

1. View default weekly working hours.
2. Edit a weekday as active or closed.
3. Add full closed days.
4. Add blocked time ranges.
5. View upcoming blocked time and closed days.
6. Understand that paid requests and approved bookings still block the calendar separately.

The current screen uses default availability settings and safe mock overrides until database persistence is connected.

## Working Hours Controls

Weekly rules are based on `WorkingHoursRule`:

```ts
export type UpdateWorkingHoursInput = {
  weekday: Weekday;
  active: boolean;
  startTime?: string;
  endTime?: string;
};
```

Validation:

- `weekday` must be `0-6`.
- If active, `startTime` and `endTime` are required.
- End time must be after start time.
- If inactive, the day is treated as closed.

## Blocked Time Flow

Blocked time supports full-day closure or a time range.

```ts
export type AddBlockedTimeInput = {
  date: string;
  type: "closed_day" | "blocked_time";
  startTime?: string;
  endTime?: string;
  reason: string;
};
```

Validation:

- Date is required.
- Reason is required.
- Time-range blocks require start and end time.
- End time must be after start time.
- Closed-day blocks do not require start or end time.

## Closed Day Flow

A closed day maps to the availability override type `closed_day`. Slot generation should treat the date as unavailable and return no public requested times.

## API Contracts

### Get Availability

```http
GET /api/admin/availability
```

Requires `edit_availability`.

Current auth placeholder:

```json
{
  "success": false,
  "error": {
    "code": "ADMIN_AUTH_NOT_CONFIGURED",
    "message": "Admin authentication is not configured yet.",
    "details": {}
  }
}
```

### Add Blocked Time

```http
POST /api/admin/availability/blocked-time
```

Request:

```json
{
  "date": "2026-05-18",
  "type": "blocked_time",
  "startTime": "12:00",
  "endTime": "14:00",
  "reason": "Van maintenance"
}
```

Until persistence exists, successful validation returns a safe not-configured response instead of pretending the block was saved.

### Update Working Hours

```http
PATCH /api/admin/availability/working-hours
```

Request:

```json
{
  "weekday": 1,
  "active": true,
  "startTime": "09:00",
  "endTime": "17:00"
}
```

Until persistence exists, successful validation returns a safe not-configured response.

## Permission Requirement

Mutations require `edit_availability`.

The UI can preview default settings, but saving availability changes must not be allowed without:

1. Admin authentication.
2. `edit_availability` permission.
3. Database persistence.
4. Conflict checks where existing bookings may be affected.

## How Availability Affects Slot Generation

Public requested slots are generated from:

- Working hours.
- Closed-day overrides.
- Blocked-time overrides.
- Service duration.
- Travel buffer.
- Existing calendar-blocking bookings.

The service must finish inside working hours. Travel buffer may extend after closing.

## Future DB Persistence

Persist working hours to `availability_rules`.

Persist closed days and blocked time to `availability_overrides`.

Before saving dangerous changes, the admin API should check for affected approved jobs and paid requests.

## Edge Cases

1. Closed day with existing approved jobs: warn or block unless admin confirms a reschedule path.
2. Blocked time overlaps an approved booking: do not silently save.
3. Admin edits hours shorter than an existing booking: warn and require review.
4. Invalid time range: return validation error.
5. Removing blocked time: future route should require audit logging.
6. Weather closure: allow full-day block with clear reason.
7. Same-day blocking: check payment holds and pending requests before saving.
8. Timezone and DST: display Europe/London, persist UTC timestamps where timestamps exist.
