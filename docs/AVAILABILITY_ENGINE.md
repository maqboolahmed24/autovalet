# AUTO VALET Availability Engine

This document defines the availability foundation for AUTO VALET. It does not generate customer slots yet. Slot generation will use these rules in the next availability prompt.

## Timezone Rules

- Business timezone: `Europe/London`.
- Persisted booking timestamps must be stored in UTC.
- Customer and admin display should use `Europe/London`.
- Local working-hour checks use `YYYY-MM-DD` dates and `HH:mm` strings.
- `HH:mm` calculations use minutes-from-midnight helpers rather than ad hoc date parsing.

## Default Working Hours

The current default rules are placeholders until admin-managed settings exist:

| Day | Hours |
|---|---|
| Monday | 09:00-17:00 |
| Tuesday | 09:00-17:00 |
| Wednesday | 09:00-17:00 |
| Thursday | 09:00-17:00 |
| Friday | 09:00-17:00 |
| Saturday | 09:00-16:00 |
| Sunday | Closed |

These defaults live in `lib/availability/default-availability.ts`.

## Override Types

Availability overrides are date-specific records.

### Closed Day

```ts
{
  id: "override-1",
  date: "2026-05-18",
  type: "closed_day",
  reason: "Holiday"
}
```

A closed-day override closes the whole date and ignores normal weekly hours.

### Custom Hours

```ts
{
  id: "override-2",
  date: "2026-05-19",
  type: "custom_hours",
  startTime: "10:00",
  endTime: "15:00"
}
```

Custom hours replace normal weekly hours for that date.

### Blocked Time

```ts
{
  id: "override-3",
  date: "2026-05-20",
  type: "blocked_time",
  startTime: "12:00",
  endTime: "14:00",
  reason: "Van maintenance"
}
```

Blocked time is returned with the day availability. Final slot generation will use it to remove customer-facing slots.

## Service Fit Rule

The service itself must finish inside working hours.

```text
doesServiceFitInsideWorkingHours("16:30", "17:30", mondayAvailability) -> false
```

Travel buffer may extend after closing by default. That means a service can end at `17:00` and still have the internal 45-minute travel buffer from `17:00` to `17:45`.

## Current Functions

- `getDefaultWorkingHoursRules()`
- `getWorkingHoursForDate(input)`
- `isTimeWithinWorkingHours(date, startTime, endTime, dayAvailability)`
- `doesServiceFitInsideWorkingHours(serviceStart, serviceEnd, dayAvailability)`
- `parseTimeToMinutes(time)`
- `formatMinutesToTime(minutes)`
- `addMinutesToTime(time, minutes)`

## Future Admin Integration

Later admin screens will manage:

- Weekly working hours
- Closed days
- Custom hours
- Blocked time

Those values should map to the database descriptors for `availability_rules` and `availability_overrides`.

## Not Implemented Yet

This foundation does not implement:

- Final slot generation
- Booking conflict checks
- Database reads
- Admin availability UI
- Public `/api/available-slots`

## Test Cases

Future unit tests should cover:

1. Monday returns `09:00-17:00`.
2. Sunday is closed.
3. Closed-day override closes the date.
4. Custom hours replace normal hours.
5. Blocked time is returned.
6. `09:00-10:00` fits in `09:00-17:00`.
7. `16:30-17:30` does not fit.
8. Service end must fit even if buffer can extend.
