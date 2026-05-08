# Admin Calendar Timeline

The AUTO VALET admin calendar is a mobile-first day timeline. It is designed for operational decisions: what is booked, what is pending, where the travel buffers are, and what time is unavailable.

## Why A Day Timeline

A month grid becomes cramped on mobile and hides the information the admin needs most. The default calendar view shows one selected day with stacked timeline cards by time. Month-style planning can be added later as a secondary desktop view.

## Data Model

Calendar domain data lives in `lib/admin/calendar.ts`.

```ts
export type AdminTimelineItemType =
  | "booking"
  | "buffer"
  | "blocked_time"
  | "available"
  | "closed";

export type AdminCalendarDay = {
  date: string;
  dateLabel: string;
  isClosed: boolean;
  summary: {
    approvedCount: number;
    pendingCount: number;
    holdCount: number;
  };
  items: AdminTimelineItem[];
};
```

The current implementation uses safe mock data with generic customer labels. Replace it with database-backed booking and availability queries once persistence is connected.

## Timeline Item Types

- Booking: approved jobs, pending requests, payment holds and active job-day statuses.
- Buffer: internal travel buffer after a booking.
- Blocked time: admin-managed unavailable time such as van maintenance or restock.
- Available: visible gap inside working hours after bookings, buffers and blocked time are considered.
- Closed: day has no working windows.

## Buffer Display Rule

Travel buffer must be visible. A booking card shows the service time, and a separate muted buffer card shows the internal blocked window after service completion.

The buffer is not customer service time. It protects travel and operational spacing.

## Week Strip Behavior

The week strip shows Monday to Sunday for the selected week:

- Weekday label.
- Day number.
- Approved job count.
- Small pending dot if the day has requests needing review or payment holds.

Links use `/admin/calendar?date=YYYY-MM-DD`, and the active day uses `aria-current="date"`.

## API Contract

```http
GET /api/admin/calendar?date=2026-05-18
```

The route requires `view_bookings`.

Current auth placeholder response:

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

After auth is connected, the route may return mock calendar data until database persistence is connected:

```json
{
  "success": true,
  "data": {
    "date": "2026-05-18",
    "dateLabel": "Monday 18 May 2026",
    "isClosed": false,
    "summary": {
      "approvedCount": 1,
      "pendingCount": 1,
      "holdCount": 1
    },
    "items": []
  },
  "message": "Calendar timeline data is placeholder until database persistence is connected."
}
```

## Empty And Closed States

If a day has no timeline items, the UI shows a calm empty state. If the day is closed, the domain returns a closed timeline item instead of pretending there are available slots.

## Future Database Integration

Replace mock data with queries for:

1. Calendar-blocking bookings on the selected business date.
2. Non-blocking historical bookings where useful for admin context.
3. Admin-managed availability overrides.
4. Blocked-time overrides.
5. Working-hour rules.

The conflict and slot generation docs define which statuses block the calendar.

## Accessibility Notes

- The week strip is a labelled nav.
- The active date uses `aria-current="date"`.
- The timeline has a text label and each card includes readable time ranges.
- Statuses use human labels from the booking status helper.
- Calendar cards are links only when there is a real destination.
