Yes — for the admin side, I would design it like a **mobile-first booking control room**.

Not like a complicated CRM.

The admin should open the dashboard and instantly understand:

```text
What needs my attention?
What jobs are today?
Which bookings need approval?
Is the deposit paid?
Is the address inside my service zone?
Will this booking clash with anything?
What do I press next?
```

The admin UI should feel:

```text
Minimal.
Premium.
Calm.
Card-based.
Very clear.
Beginner-friendly.
Powerful underneath.
```

---

# AUTO VALET Admin UI Direction

## Core Idea

The admin dashboard should be built around one main principle:

```text
Bookings are handled like an inbox.
The admin reviews each request, checks the important details, then approves, declines, or reschedules.
```

So instead of showing the admin a huge complicated calendar first, the admin should see:

```text
Today
Pending Requests
This Week
Quick Actions
```

The calendar is still there, but the default view should be simple.

---

# 1. Admin Visual Style

The admin panel should match the premium public website, but with slightly more practical contrast.

## Look

```text
Dark charcoal background
Soft white text
Champagne/gold accent
Rounded cards
Clear status badges
Large tap targets
Bottom mobile navigation
Smooth slide-up panels
Minimal icons
No clutter
```

## Feeling

The public website feels cinematic.

The admin dashboard should feel like:

```text
A luxury operations app.
A clean booking command centre.
A simple mobile business dashboard.
```

---

# 2. Admin Colour System

Use the same brand palette, with extra status colours.

```css
:root {
  --admin-bg: #070707;
  --admin-bg-soft: #101010;
  --admin-card: #151515;
  --admin-card-raised: #1b1b1b;

  --admin-text: #f5f2ec;
  --admin-muted: #a9a9a9;
  --admin-soft: #d7d2c8;

  --admin-accent: #c8a96a;
  --admin-accent-soft: rgba(200, 169, 106, 0.16);

  --admin-border: rgba(255, 255, 255, 0.11);
  --admin-border-strong: rgba(255, 255, 255, 0.18);

  --status-pending: #d6a84f;
  --status-approved: #8ccf9f;
  --status-declined: #ef8b8b;
  --status-paid: #8fb7ff;
  --status-warning: #f0c56a;

  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 28px;

  --shadow-card: 0 20px 60px rgba(0, 0, 0, 0.35);
  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Important: use status colours only for small badges and indicators, not large backgrounds.

---

# 3. Admin App Navigation

For mobile, use a bottom navigation bar.

## Main Tabs

```text
Today
Requests
Calendar
Customers
More
```

On mobile, this is easier than a sidebar.

```text
┌─────────────────────────┐
│ AUTO VALET              │
│ Good morning            │
│                         │
│ Main content            │
│                         │
│                         │
├─────────────────────────┤
│ Today Requests Calendar │
└─────────────────────────┘
```

## Desktop Version

On tablet/desktop, switch to a left sidebar:

```text
Dashboard
Requests
Calendar
Availability
Service Zones
Services
Customers
Gallery
Settings
```

---

# 4. Admin Home Screen

This should be the first thing the admin sees.

## Purpose

The admin should immediately know:

```text
How many jobs today?
How many pending requests?
How much deposit money has come in?
What needs approval?
```

## Mobile Layout

```text
AUTO VALET
Today, 6 May

[ Pending Requests ]
3 need review

[ Today’s Jobs ]
2 approved jobs

[ Deposits ]
£80 collected this week

[ Next Job Card ]
09:00
Maintenance — Medium
Customer Name
Address
[Open]

[ Pending Requests ]
14:30
Deep Clean — Large / 4x4
Deposit paid
[Review]
```

---

## Dashboard Wireframe

```text
┌─────────────────────────────┐
│ AUTO VALET                  │
│ Today                       │
│ Wednesday, 6 May            │
├─────────────────────────────┤
│ ┌─────────┐ ┌─────────────┐ │
│ │ Pending │ │ Today Jobs  │ │
│ │   3     │ │     2       │ │
│ └─────────┘ └─────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Deposits this week      │ │
│ │ £80                     │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Next job                    │
│ ┌─────────────────────────┐ │
│ │ 09:00 Approved          │ │
│ │ Maintenance — Medium    │ │
│ │ BMW 3 Series            │ │
│ │ Croydon                 │ │
│ │ [Open job]              │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Needs review                │
│ ┌─────────────────────────┐ │
│ │ 14:30 Pending           │ │
│ │ Deep Clean — Large      │ │
│ │ Deposit paid            │ │
│ │ [Review request]        │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

# 5. Admin Dashboard Code Reference

## React Structure

```jsx
export default function AdminDashboard() {
  return (
    <main className="admin-shell">
      <AdminHeader />

      <section className="admin-summary-grid">
        <SummaryCard label="Pending" value="3" note="Need review" />
        <SummaryCard label="Today" value="2" note="Approved jobs" />
        <SummaryCard label="Deposits" value="£80" note="This week" />
      </section>

      <section className="admin-section">
        <SectionTitle eyebrow="Today" title="Next job" />
        <BookingCard
          status="approved"
          time="09:00"
          service="Maintenance — Medium"
          customer="Amir Khan"
          vehicle="BMW 3 Series"
          location="Croydon"
          deposit="Paid"
        />
      </section>

      <section className="admin-section">
        <SectionTitle eyebrow="Requests" title="Needs review" />
        <BookingCard
          status="pending"
          time="14:30"
          service="Deep Clean — Large / 4x4"
          customer="Sarah Wilson"
          vehicle="Range Rover"
          location="Outside-zone request"
          deposit="Paid"
          urgent
        />
      </section>

      <AdminBottomNav />
    </main>
  );
}
```

---

## Admin Layout CSS

```css
.admin-shell {
  min-height: 100svh;
  padding: 20px 16px 96px;
  background:
    radial-gradient(circle at top right, rgba(200,169,106,0.08), transparent 34%),
    var(--admin-bg);
  color: var(--admin-text);
}

.admin-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-header h1 {
  margin: 0;
  font-size: 1.45rem;
  letter-spacing: -0.04em;
}

.admin-header p {
  margin: 6px 0 0;
  color: var(--admin-muted);
  font-size: 0.9rem;
}

.admin-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 28px;
}

.admin-summary-grid > :last-child {
  grid-column: 1 / -1;
}

.summary-card {
  padding: 18px;
  border-radius: var(--radius-md);
  background:
    linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025));
  border: 1px solid var(--admin-border);
  box-shadow: var(--shadow-card);
}

.summary-card span {
  color: var(--admin-muted);
  font-size: 0.78rem;
}

.summary-card strong {
  display: block;
  margin-top: 8px;
  font-size: 2rem;
  line-height: 1;
  letter-spacing: -0.06em;
}

.summary-card p {
  margin: 8px 0 0;
  color: var(--admin-soft);
  font-size: 0.85rem;
}

.admin-section {
  margin-top: 30px;
}

.section-title {
  margin-bottom: 14px;
}

.section-title span {
  color: var(--admin-accent);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.section-title h2 {
  margin: 6px 0 0;
  font-size: 1.4rem;
  letter-spacing: -0.04em;
}
```

---

# 6. Booking Request Card

This is the most important admin component.

Every booking should appear as a clean card.

## Beginner-Friendly Version

Instead of showing raw technical fields, the card should show:

```text
Time
Status
Service
Customer
Vehicle
Location
Deposit status
Main warning if any
Primary action
```

## Example Card

```text
Pending Request

14:30
Deep Clean — Large / 4x4

Sarah Wilson
Range Rover Evoque

Outside-zone request
4 vehicles at same address

Deposit paid
Estimated total: £250

[Review Request]
```

---

## Booking Card Code

```jsx
function BookingCard({
  status,
  time,
  service,
  customer,
  vehicle,
  location,
  deposit,
  urgent,
}) {
  return (
    <article className={`booking-card booking-card--${status}`}>
      <div className="booking-card__top">
        <div>
          <span className="booking-card__time">{time}</span>
          <StatusBadge status={status} />
        </div>

        {urgent && <span className="warning-dot">!</span>}
      </div>

      <h3>{service}</h3>

      <div className="booking-card__meta">
        <p>{customer}</p>
        <p>{vehicle}</p>
        <p>{location}</p>
      </div>

      <div className="booking-card__footer">
        <span className="payment-pill">{deposit}</span>
        <button className="ghost-button">Review</button>
      </div>
    </article>
  );
}
```

---

## Booking Card CSS

```css
.booking-card {
  position: relative;
  padding: 20px;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025));
  border: 1px solid var(--admin-border);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.booking-card + .booking-card {
  margin-top: 14px;
}

.booking-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--admin-accent);
}

.booking-card--approved::before {
  background: var(--status-approved);
}

.booking-card--pending::before {
  background: var(--status-pending);
}

.booking-card--declined::before {
  background: var(--status-declined);
}

.booking-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.booking-card__time {
  display: block;
  margin-bottom: 8px;
  color: var(--admin-text);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.06em;
}

.booking-card h3 {
  margin: 18px 0 14px;
  font-size: 1.28rem;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.booking-card__meta {
  display: grid;
  gap: 6px;
  color: var(--admin-muted);
  font-size: 0.92rem;
}

.booking-card__meta p {
  margin: 0;
}

.booking-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.payment-pill {
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba(143, 183, 255, 0.12);
  color: var(--status-paid);
  font-size: 0.78rem;
  border: 1px solid rgba(143, 183, 255, 0.22);
}

.warning-dot {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  color: #111;
  background: var(--status-warning);
  font-weight: 800;
}

.ghost-button {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--admin-border-strong);
  background: rgba(255,255,255,0.04);
  color: var(--admin-text);
  font-weight: 700;
}
```

---

# 7. Status Badge System

The admin should never need to understand technical statuses like:

```text
pending_admin_review
payment_hold
outside_zone_volume_exception
```

Show human labels instead.

## Human-Friendly Statuses

| System Status                 | Admin Label          |
| ----------------------------- | -------------------- |
| payment_hold                  | Payment in progress  |
| pending_admin_review          | Needs review         |
| approved                      | Approved             |
| declined                      | Declined             |
| reschedule_requested          | Reschedule sent      |
| completed                     | Completed            |
| expired                       | Expired              |
| cancelled_by_customer         | Cancelled            |
| outside_zone_volume_exception | Outside-zone request |

---

## Status Badge Component

```jsx
function StatusBadge({ status }) {
  const labels = {
    pending: "Needs review",
    approved: "Approved",
    declined: "Declined",
    hold: "Payment hold",
    completed: "Completed",
    outside: "Outside-zone",
  };

  return (
    <span className={`status-badge status-badge--${status}`}>
      {labels[status]}
    </span>
  );
}
```

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  border: 1px solid var(--admin-border);
  background: rgba(255,255,255,0.045);
}

.status-badge--pending {
  color: var(--status-pending);
  background: rgba(214, 168, 79, 0.12);
  border-color: rgba(214, 168, 79, 0.22);
}

.status-badge--approved {
  color: var(--status-approved);
  background: rgba(140, 207, 159, 0.12);
  border-color: rgba(140, 207, 159, 0.24);
}

.status-badge--declined {
  color: var(--status-declined);
  background: rgba(239, 139, 139, 0.12);
  border-color: rgba(239, 139, 139, 0.24);
}
```

---

# 8. Booking Request Detail Screen

When the admin taps “Review”, open a full-screen mobile detail page or slide-up sheet.

This screen should be designed like a checklist.

## Purpose

The admin needs to answer:

```text
Is the customer real?
Is the deposit paid?
Is the location allowed?
Is the vehicle size correct?
Is the timing possible?
Is there anything unusual in the notes?
```

---

## Mobile Detail Layout

```text
┌─────────────────────────────┐
│ ← Booking Request           │
│ Needs review                │
├─────────────────────────────┤
│ 14:30                       │
│ Saturday, 18 May            │
│ Deep Clean — Large / 4x4    │
├─────────────────────────────┤
│ Approval checks             │
│ ✓ Deposit paid              │
│ ✓ No calendar clash         │
│ ✓ Inside service zone       │
│ ! Price may vary            │
├─────────────────────────────┤
│ Customer                    │
│ Sarah Wilson                │
│ 07...                       │
│ email@email.com             │
├─────────────────────────────┤
│ Vehicle                     │
│ Range Rover Evoque          │
│ Large / 4x4                 │
│ Add-ons: Pet hair, leather  │
├─────────────────────────────┤
│ Address                     │
│ Full address                │
│ Postcode                    │
├─────────────────────────────┤
│ Notes                       │
│ “Heavy pet hair in boot...” │
├─────────────────────────────┤
│ Price                       │
│ Estimated total: £250       │
│ Deposit paid: £30           │
│ Balance: £220               │
├─────────────────────────────┤
│ [Decline] [Approve Booking] │
└─────────────────────────────┘
```

---

# 9. Approval Checklist

This is what makes the app beginner-friendly.

Instead of asking the admin to inspect everything manually, show an automatic checklist.

## Approval Check Items

| Check                     | Meaning                                            |
| ------------------------- | -------------------------------------------------- |
| Deposit paid              | Payment webhook confirmed                          |
| No calendar clash         | Slot still available                               |
| Zone accepted             | Postcode matches approved zone or volume exception |
| Duration calculated       | System has calculated service + buffer             |
| Customer details complete | Name, phone, email present                         |
| Vehicle details complete  | Make, model, size present                          |
| Outside-zone warning      | Shows only when relevant                           |
| Price warning             | Final price may vary depending on condition        |

---

## Checklist UI Example

```jsx
function ApprovalChecklist({ booking }) {
  const checks = [
    {
      label: "Deposit paid",
      state: booking.depositPaid ? "success" : "danger",
    },
    {
      label: "No calendar clash",
      state: booking.hasConflict ? "danger" : "success",
    },
    {
      label: booking.zoneStatus === "outside"
        ? "Outside-zone volume request"
        : "Inside service zone",
      state: booking.zoneStatus === "outside" ? "warning" : "success",
    },
    {
      label: "Customer details complete",
      state: booking.customerComplete ? "success" : "danger",
    },
  ];

  return (
    <section className="checklist-card">
      <h2>Approval checks</h2>

      <div className="checklist">
        {checks.map((check) => (
          <div className={`check-row check-row--${check.state}`} key={check.label}>
            <span className="check-icon" />
            <p>{check.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## Checklist CSS

```css
.checklist-card {
  padding: 20px;
  border-radius: var(--radius-lg);
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
}

.checklist-card h2 {
  margin: 0 0 16px;
  font-size: 1.1rem;
}

.checklist {
  display: grid;
  gap: 10px;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
}

.check-row p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--admin-soft);
}

.check-icon {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--admin-muted);
}

.check-row--success .check-icon {
  background: var(--status-approved);
}

.check-row--warning .check-icon {
  background: var(--status-warning);
}

.check-row--danger .check-icon {
  background: var(--status-declined);
}
```

---

# 10. Booking Detail Action Bar

On mobile, the approve and decline buttons should be sticky at the bottom.

This is very important.

The admin should not scroll all the way down to approve.

```text
[Decline] [Approve Booking]
```

## Button Behaviour

```text
Approve Booking
- Primary button
- Disabled if deposit unpaid or conflict detected
- Opens confirmation sheet before final approval

Decline
- Secondary danger button
- Requires reason
- Gives refund/transfer option
```

---

## Sticky Action Bar CSS

```css
.booking-action-bar {
  position: sticky;
  bottom: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 10px;
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
  margin: 0 -16px;
  background:
    linear-gradient(to top, rgba(7,7,7,0.96), rgba(7,7,7,0.78), transparent);
  backdrop-filter: blur(18px);
}

.admin-button {
  min-height: 52px;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  font-size: 0.95rem;
}

.admin-button--primary {
  background: var(--admin-text);
  color: #070707;
}

.admin-button--secondary {
  background: rgba(255,255,255,0.06);
  color: var(--admin-text);
  border: 1px solid var(--admin-border-strong);
}

.admin-button--danger {
  color: var(--status-declined);
}
```

---

# 11. Approve Confirmation Sheet

Approving should not happen accidentally.

When the admin taps “Approve Booking”, show a slide-up confirmation sheet.

## Sheet Content

```text
Approve this booking?

Saturday, 18 May
14:30 - 16:00
Travel buffer until 16:45

Deep Clean — Large / 4x4
Deposit paid: £30
Balance due: £220

This will send a confirmation to the customer.

[Approve & Send Confirmation]
[Cancel]
```

---

## Confirmation Sheet Feel

```text
Slides up from bottom
Rounded top corners
Backdrop blur
Large clear primary action
```

```jsx
function ApproveSheet({ booking, onApprove, onClose }) {
  return (
    <div className="sheet-backdrop">
      <motion.div
        className="approval-sheet"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="sheet-handle" />

        <h2>Approve this booking?</h2>

        <div className="approval-summary">
          <p>{booking.date}</p>
          <strong>{booking.timeRange}</strong>
          <span>Travel buffer until {booking.blockedUntil}</span>
        </div>

        <button className="admin-button admin-button--primary" onClick={onApprove}>
          Approve & Send Confirmation
        </button>

        <button className="admin-button admin-button--secondary" onClick={onClose}>
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
```

---

# 12. Decline Flow

Declining should be simple but controlled.

## Decline Sheet

```text
Decline request

Reason
[ Outside service area ]
[ Slot no longer suitable ]
[ Vehicle/service not suitable ]
[ Customer requested cancellation ]
[ Other ]

Deposit action
[ Refund deposit ]
[ Transfer to new date ]
[ Keep according to policy ]

[Decline Request]
```

For beginner-friendliness, do not show complex options first. Use simple chips.

---

# 13. Calendar UI

The admin calendar should not start as a month grid on mobile.

Month grids are too cramped.

Use this instead:

```text
Mobile default: Day timeline
Secondary view: Week strip
Optional desktop: Month calendar
```

---

## Mobile Calendar Layout

```text
Calendar

Mon Tue Wed Thu Fri Sat Sun
 4   5   6   7   8   9   10

Wednesday, 6 May

09:00 Approved
Maintenance — Medium
09:00 - 10:15
Travel buffer: 10:15 - 11:00

11:00 Pending
Deep Clean — Large
11:00 - 12:30
Travel buffer: 12:30 - 13:15

13:15 Available
```

---

## Timeline Design

Each booking appears as a vertical timeline item.

```text
09:00 ┃ Approved booking
10:15 ┃ Travel buffer
11:00 ┃ Pending booking
12:30 ┃ Travel buffer
13:15 ┃ Available
```

---

## Calendar Timeline Component

```jsx
function DayTimeline({ items }) {
  return (
    <section className="day-timeline">
      {items.map((item) => (
        <TimelineItem key={item.id} item={item} />
      ))}
    </section>
  );
}

function TimelineItem({ item }) {
  return (
    <article className={`timeline-item timeline-item--${item.type}`}>
      <div className="timeline-item__time">
        <strong>{item.start}</strong>
        <span>{item.end}</span>
      </div>

      <div className="timeline-item__content">
        <StatusBadge status={item.status} />
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>

        {item.buffer && (
          <span className="buffer-note">
            Buffer until {item.bufferUntil}
          </span>
        )}
      </div>
    </article>
  );
}
```

---

## Timeline CSS

```css
.day-timeline {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 14px;
  position: relative;
}

.timeline-item::before {
  content: "";
  position: absolute;
  left: 68px;
  top: 0;
  bottom: -14px;
  width: 1px;
  background: var(--admin-border);
}

.timeline-item__time {
  padding-top: 14px;
}

.timeline-item__time strong {
  display: block;
  font-size: 0.95rem;
}

.timeline-item__time span {
  display: block;
  margin-top: 4px;
  color: var(--admin-muted);
  font-size: 0.75rem;
}

.timeline-item__content {
  position: relative;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
}

.timeline-item__content::before {
  content: "";
  position: absolute;
  left: -20px;
  top: 22px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--admin-accent);
  box-shadow: 0 0 0 6px var(--admin-bg);
}

.timeline-item h3 {
  margin: 12px 0 6px;
  font-size: 1rem;
}

.timeline-item p {
  margin: 0;
  color: var(--admin-muted);
  font-size: 0.88rem;
}

.buffer-note {
  display: inline-flex;
  margin-top: 12px;
  padding: 7px 10px;
  border-radius: 999px;
  color: var(--admin-muted);
  background: rgba(255,255,255,0.04);
  font-size: 0.75rem;
}
```

---

# 14. Week Strip

Use a simple horizontal date selector.

```jsx
function WeekStrip({ days, selectedDay, onSelect }) {
  return (
    <div className="week-strip">
      {days.map((day) => (
        <button
          key={day.date}
          className={day.date === selectedDay ? "is-active" : ""}
          onClick={() => onSelect(day.date)}
        >
          <span>{day.label}</span>
          <strong>{day.number}</strong>
          {day.hasPending && <i />}
        </button>
      ))}
    </div>
  );
}
```

```css
.week-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 18px;
  scrollbar-width: none;
}

.week-strip button {
  position: relative;
  flex: 0 0 auto;
  min-width: 58px;
  min-height: 72px;
  border-radius: 20px;
  border: 1px solid var(--admin-border);
  background: rgba(255,255,255,0.04);
  color: var(--admin-text);
}

.week-strip button span {
  display: block;
  color: var(--admin-muted);
  font-size: 0.72rem;
}

.week-strip button strong {
  display: block;
  margin-top: 8px;
  font-size: 1.25rem;
}

.week-strip button.is-active {
  background: var(--admin-text);
  color: #070707;
}

.week-strip button.is-active span {
  color: rgba(0,0,0,0.6);
}

.week-strip button i {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--status-pending);
}
```

---

# 15. Requests Inbox

This is where all pending requests live.

## Filters

Keep filters beginner-friendly:

```text
All
Needs review
Outside-zone
Deposit paid
Today
This week
```

Do not show too many advanced filters upfront.

---

## Requests Screen

```text
Requests

[Needs review 3] [Approved] [Outside-zone] [All]

Today
14:30 Deep Clean — Pending
16:15 Maintenance — Payment hold

Tomorrow
09:00 Maintenance — Pending
```

---

## Power Features Hidden Behind Simple UI

The admin can tap filters or search, but the default stays clean.

Power features:

```text
Search by customer name
Search by postcode
Filter by booking status
Filter by service type
Filter by outside-zone request
Filter by deposit status
Filter by date range
```

The beginner sees cards.

The advanced user can still find anything.

---

# 16. Booking Detail Information Architecture

Use collapsible sections so the screen does not feel overwhelming.

## Booking Detail Sections

```text
1. Booking Summary
2. Approval Checks
3. Customer
4. Vehicle
5. Service & Add-ons
6. Address
7. Notes
8. Payment
9. Internal Admin Notes
10. Activity Log
```

Default open sections:

```text
Booking Summary
Approval Checks
Customer
Vehicle
Payment
```

Collapsed by default:

```text
Activity Log
Admin Notes
Technical Details
```

---

# 17. Admin Booking Detail Example

```text
Booking Request

Needs review
Saturday, 18 May
14:30 - 16:00
Buffer until 16:45

Deep Clean
Large / 4x4
Estimated total £250

Approval checks
✓ Deposit paid
✓ No clash
✓ Customer details complete
! Outside-zone volume request

Customer
Sarah Wilson
Call
Text
Email

Vehicle
Range Rover Evoque
Large / 4x4

Add-ons
Leather deep clean
Pet hair removal
Engine bay clean

Location
Full address
Postcode
Zone: Outside-zone
Vehicles at address: 4

Payment
Deposit paid: £30
Remaining balance: £220

Notes
“Dog hair in boot and rear seats.”

Admin notes
[Add private note]

[Decline] [Approve Booking]
```

---

# 18. Customer Contact Actions

On mobile, make contact buttons extremely easy.

```text
[Call]
[Text]
[Email]
```

These buttons should be inside the customer section.

```jsx
<div className="contact-actions">
  <a href={`tel:${phone}`}>Call</a>
  <a href={`sms:${phone}`}>Text</a>
  <a href={`mailto:${email}`}>Email</a>
</div>
```

```css
.contact-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
}

.contact-actions a {
  display: grid;
  place-items: center;
  min-height: 42px;
  border-radius: 999px;
  color: var(--admin-text);
  text-decoration: none;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--admin-border);
  font-weight: 700;
  font-size: 0.86rem;
}
```

---

# 19. Availability Management UI

This needs to be very simple.

The admin should not need to understand technical rules.

## Availability Screen

```text
Availability

Working hours

Monday
[09:00] to [17:00]  Active

Tuesday
[09:00] to [17:00]  Active

Wednesday
[09:00] to [17:00]  Active

Days off
[Add day off]

Blocked time
[Block time]
```

---

## Beginner-Friendly Controls

Use simple actions:

```text
Set working hours
Block full day
Block a few hours
Reopen day
```

Avoid making the admin edit raw availability rules.

---

## Availability Card

```text
Monday
09:00 - 17:00
[Edit]

Tuesday
09:00 - 17:00
[Edit]

Sunday
Closed
[Edit]
```

---

# 20. Block Time Flow

This is important for real-life use.

The admin may need to block:

```text
Lunch
Personal appointment
Holiday
Van maintenance
Weather issue
Fully booked day
```

## Flow

```text
Tap “Block Time”
Choose date
Choose full day or time range
Add reason
Save
```

## Block Time Sheet

```text
Block availability

Date
[18 May 2026]

Block type
[Full day] [Time range]

Time
[12:00] to [14:00]

Reason
[Van maintenance]

[Save Block]
```

---

# 21. Service Zones Management UI

This should be simple because the admin may not be technical.

## Screen

```text
Service Zones

Approved areas
SW1
SW2
CR0
BR1
Croydon
Bromley

[Add Zone]
```

When adding:

```text
Zone type
[Postcode district] [Postcode area] [Region name]

Value
[CR0]

[Add Zone]
```

Show examples:

```text
Examples: CR0, BR1, Croydon
```

---

## Outside-Zone Setting

Add a simple setting:

```text
Outside-zone minimum vehicles
[3 vehicles]
```

Explanation:

```text
Customers outside your normal areas can only request a booking if they have this many vehicles at the same address.
```

---

# 22. Services & Pricing Admin UI

Keep this manageable.

## Screen

```text
Services & Pricing

Maintenance
Small — £55 — 60 mins
Medium — £65 — 75 mins
Large / 4x4 — £75 — 90 mins

Deep Clean
Small — £160
Medium — £165
Large / 4x4 — £170

Add-ons
Engine bay clean — £30
Windscreen repellent — £30
...
```

Each row has:

```text
Edit
Enable/disable
```

Do not make pricing edits look like a spreadsheet on mobile.

Use cards.

---

# 23. Deposit Settings UI

This needs to be clear because it affects money.

## Deposit Screen

```text
Deposit settings

Deposit type
[Fixed] [Percentage] [Per vehicle]

Amount
[£30]

Policy text
[Deposit required to submit booking request...]

[Save]
```

Also show a preview:

```text
Example:
Booking total £150
Deposit due £30
Remaining balance £120
```

This helps the admin understand the effect before saving.

---

# 24. Payment Management UI

For each booking, show payment status simply.

## Payment Card

```text
Payment

Deposit paid
£30 via Stripe
Paid 6 May, 14:22

Remaining balance
£120 due on completion

[Refund deposit]
[Mark balance paid]
```

Refund should require confirmation.

```text
Refund this deposit?
This will return £30 to the customer.

[Refund]
[Cancel]
```

---

# 25. Gallery Manager UI

Since images are coming later, prepare this admin area.

## Gallery Screen

```text
Gallery

Featured work
[Before / After card]
[Interior detail card]
[Exterior finish card]

[Add Gallery Item]
```

## Add Gallery Item Flow

```text
Title
Vehicle type
Service type
Before image
After image
Finished image
Feature on homepage?
[Save]
```

The public homepage can then pull featured gallery items into the vertical image story.

---

# 26. Admin Bottom Navigation

Mobile bottom navigation should be persistent.

```jsx
function AdminBottomNav() {
  return (
    <nav className="admin-bottom-nav">
      <a href="/admin" className="is-active">Today</a>
      <a href="/admin/requests">Requests</a>
      <a href="/admin/calendar">Calendar</a>
      <a href="/admin/customers">Customers</a>
      <a href="/admin/more">More</a>
    </nav>
  );
}
```

```css
.admin-bottom-nav {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 100;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(18,18,18,0.86);
  border: 1px solid var(--admin-border);
  backdrop-filter: blur(22px);
  box-shadow: 0 18px 50px rgba(0,0,0,0.45);
}

.admin-bottom-nav a {
  display: grid;
  place-items: center;
  min-height: 44px;
  border-radius: 999px;
  color: var(--admin-muted);
  text-decoration: none;
  font-size: 0.72rem;
  font-weight: 700;
}

.admin-bottom-nav a.is-active {
  color: #070707;
  background: var(--admin-text);
}
```

This gives a premium app feel while staying very simple.

---

# 27. Admin Motion & Transitions

Admin animations should be smoother and more functional than the public homepage.

Use animations to help the admin understand changes.

## Recommended Motion

| Interaction          | Animation                             |
| -------------------- | ------------------------------------- |
| Open booking request | Card expands or detail page slides in |
| Approve booking      | Confirmation sheet slides up          |
| Decline booking      | Decline sheet slides up               |
| Status update        | Badge softly changes                  |
| Filter change        | Cards fade/slide slightly             |
| Calendar day change  | Timeline slides horizontally          |
| Bottom nav           | Active pill glides                    |
| Error/conflict       | Small shake or warning pulse          |

Avoid heavy cinematic scrolling inside the admin dashboard.

This is a work tool, so motion should be fast.

```js
const adminMotion = {
  ease: [0.16, 1, 0.3, 1],
  page: 0.38,
  sheet: 0.45,
  card: 0.28,
  micro: 0.16,
};
```

---

# 28. Framer Motion Page Transition

```jsx
import { motion } from "framer-motion";

export function AdminPageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
      transition={{
        duration: 0.38,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
```

---

# 29. Slide-Up Sheet CSS

Use this for approve, decline, reschedule, block time, add zone, edit service.

```css
.sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
}

.admin-sheet {
  width: 100%;
  max-height: 86svh;
  overflow-y: auto;
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom));
  border-radius: 30px 30px 0 0;
  background: var(--admin-bg-soft);
  border-top: 1px solid var(--admin-border);
  box-shadow: 0 -24px 80px rgba(0,0,0,0.55);
}

.sheet-handle {
  display: block;
  width: 44px;
  height: 5px;
  margin: 0 auto 20px;
  border-radius: 999px;
  background: rgba(255,255,255,0.24);
}

.admin-sheet h2 {
  margin: 0 0 18px;
  font-size: 1.45rem;
  letter-spacing: -0.04em;
}
```

---

# 30. Reschedule UI

Rescheduling should not be complicated.

## Reschedule Flow

```text
Tap Reschedule
Choose date
System shows available times
Select new time
Send suggestion to customer
```

## Reschedule Sheet

```text
Suggest new time

Current request
Sat 18 May, 14:30

Choose new date
[Date picker]

Available times
[09:00] [11:45] [14:15]

Message to customer
“Your requested slot is unavailable. We can offer this time instead.”

[Send suggestion]
```

---

# 31. Conflict Warning UI

If the admin tries to approve a booking but another booking conflicts, show a clear warning.

```text
This slot is no longer available.

Another booking or blocked time overlaps with this request.

[View conflict]
[Suggest new time]
```

Do not show technical overlap logic to the admin.

---

# 32. Beginner-Friendly Language

Use simple labels.

## Use This

```text
Needs review
Approved
Declined
Deposit paid
Outside-zone request
Travel buffer
Block time
Day off
Suggest new time
```

## Avoid This

```text
pending_admin_review
transaction captured
availability override
distance validation failed
calendar resource collision
```

The backend can keep technical language. The admin UI should not.

---

# 33. Microcopy Examples

## Pending Request

```text
This customer has paid a deposit and is waiting for approval.
```

## Outside-Zone Request

```text
This address is outside your usual service area, but the customer has enough vehicles for review.
```

## Payment Hold

```text
The customer has started payment. This slot is temporarily held.
```

## Travel Buffer

```text
Travel buffer protects time between mobile jobs.
```

## Decline

```text
Declining releases the slot and notifies the customer.
```

## Approve

```text
Approving confirms the booking and sends the customer a confirmation message.
```

---

# 34. Admin UI Component System

Build the admin using reusable components.

## Components

```text
AdminShell
AdminHeader
BottomNav
SummaryCard
SectionTitle
BookingCard
StatusBadge
PaymentPill
WeekStrip
DayTimeline
TimelineItem
ApprovalChecklist
InfoCard
ContactActions
ActionBar
SlideUpSheet
ConfirmSheet
FilterChips
EmptyState
WarningCard
```

This keeps the UI consistent and easy to build.

---

# 35. Info Card Component

For booking detail sections:

```jsx
function InfoCard({ title, children, action }) {
  return (
    <section className="info-card">
      <div className="info-card__header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
```

```css
.info-card {
  margin-top: 14px;
  padding: 18px;
  border-radius: var(--radius-lg);
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
}

.info-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.info-card h2 {
  margin: 0;
  font-size: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row span {
  color: var(--admin-muted);
  font-size: 0.86rem;
}

.info-row strong {
  color: var(--admin-text);
  font-size: 0.9rem;
  text-align: right;
}
```

---

# 36. Empty States

Empty states matter because the admin should not feel lost.

## No Pending Requests

```text
No requests waiting.

New paid booking requests will appear here.
```

Button:

```text
View calendar
```

## No Jobs Today

```text
No jobs today.

Your day is clear. You can still add blocked time or check upcoming requests.
```

## No Service Zones

```text
No service zones yet.

Add postcode areas or region names to control where customers can book.
```

---

# 37. Admin Notification Design

Inside the admin app, important alerts should appear as small cards.

## Examples

```text
New booking request
Sarah Wilson paid a deposit and is waiting for review.

Outside-zone request
4 vehicles at one address.

Payment hold expiring
Customer has 4 minutes left to complete payment.
```

Do not use intrusive popups unless it is critical.

---

# 38. Mobile-First Admin Screen Map

The admin app should have this structure:

```text
/admin
    Today dashboard

/admin/requests
    Booking request inbox

/admin/requests/:id
    Booking request detail

/admin/calendar
    Day timeline calendar

/admin/customers
    Customer list and customer profiles

/admin/more
    Availability
    Service zones
    Services & pricing
    Deposit settings
    Gallery
    Account settings
```

This keeps the bottom navigation clean.

---

# 39. Recommended Admin Journey

## Daily Journey

```text
Admin opens dashboard
↓
Sees today’s jobs
↓
Sees pending requests
↓
Taps request
↓
Reviews approval checklist
↓
Checks customer, vehicle, address, payment
↓
Taps approve
↓
Confirmation sheet appears
↓
Admin approves
↓
Customer gets confirmation
↓
Booking moves to approved calendar
```

---

# 40. Booking Request Journey

```text
New booking request arrives
↓
Card appears in Requests inbox
↓
Admin sees “Deposit paid”
↓
Admin sees “Inside service zone” or “Outside-zone request”
↓
Admin opens detail
↓
Approval checks are shown first
↓
Admin approves, declines, or suggests new time
```

This is the main admin workflow.

It should be the smoothest part of the whole backend.

---

# 41. Best Mobile Detail Screen Layout

This is the screen I would prioritise the most.

```jsx
function BookingDetailPage({ booking }) {
  return (
    <main className="admin-shell booking-detail">
      <DetailHeader booking={booking} />

      <BookingHeroCard booking={booking} />

      <ApprovalChecklist booking={booking} />

      <InfoCard title="Customer">
        <InfoRow label="Name" value={booking.customer.name} />
        <InfoRow label="Phone" value={booking.customer.phone} />
        <InfoRow label="Email" value={booking.customer.email} />
        <ContactActions
          phone={booking.customer.phone}
          email={booking.customer.email}
        />
      </InfoCard>

      <InfoCard title="Vehicle">
        <InfoRow label="Make" value={booking.vehicle.make} />
        <InfoRow label="Model" value={booking.vehicle.model} />
        <InfoRow label="Size" value={booking.vehicle.size} />
      </InfoCard>

      <InfoCard title="Service">
        <InfoRow label="Package" value={booking.service.name} />
        <InfoRow label="Duration" value={`${booking.duration} mins`} />
        <InfoRow label="Buffer" value="45 mins" />
        <InfoRow label="Add-ons" value={booking.addons.join(", ")} />
      </InfoCard>

      <InfoCard title="Location">
        <InfoRow label="Address" value={booking.address.full} />
        <InfoRow label="Postcode" value={booking.address.postcode} />
        <InfoRow label="Zone" value={booking.zoneLabel} />
      </InfoCard>

      <InfoCard title="Payment">
        <InfoRow label="Estimated total" value={`£${booking.total}`} />
        <InfoRow label="Deposit paid" value={`£${booking.deposit}`} />
        <InfoRow label="Balance" value={`£${booking.balance}`} />
      </InfoCard>

      <InfoCard title="Notes">
        <p className="notes-text">{booking.notes || "No extra notes."}</p>
      </InfoCard>

      <BookingActionBar booking={booking} />
    </main>
  );
}
```

---

# 42. Booking Hero Card

The top of the booking detail should be bold and clear.

```jsx
function BookingHeroCard({ booking }) {
  return (
    <section className="booking-hero-card">
      <div className="booking-hero-card__status">
        <StatusBadge status={booking.status} />
        <span>{booking.depositPaid ? "Deposit paid" : "Deposit unpaid"}</span>
      </div>

      <h1>{booking.service.name}</h1>

      <div className="booking-hero-card__time">
        <strong>{booking.date}</strong>
        <span>{booking.timeRange}</span>
        <small>Buffer until {booking.blockedUntil}</small>
      </div>
    </section>
  );
}
```

```css
.booking-hero-card {
  padding: 24px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(200,169,106,0.14), transparent 34%),
    linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025));
  border: 1px solid var(--admin-border);
  box-shadow: var(--shadow-card);
}

.booking-hero-card__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.booking-hero-card__status span {
  color: var(--admin-muted);
  font-size: 0.8rem;
}

.booking-hero-card h1 {
  margin: 24px 0;
  font-size: 2.2rem;
  line-height: 0.95;
  letter-spacing: -0.07em;
}

.booking-hero-card__time {
  display: grid;
  gap: 6px;
}

.booking-hero-card__time strong {
  font-size: 1rem;
}

.booking-hero-card__time span {
  color: var(--admin-soft);
}

.booking-hero-card__time small {
  color: var(--admin-muted);
}
```

---

# 43. More Menu

The “More” tab should hold everything the admin does not need every minute.

```text
More

Business setup
- Availability
- Service zones
- Services & pricing
- Deposit settings

Content
- Gallery
- Reviews

Account
- Admin profile
- Notification settings
- Security
```

Use cards, not a long plain list.

---

# 44. Admin Design Rules

Use these rules throughout.

## Rule 1: One Primary Action Per Screen

For a pending booking:

```text
Primary action: Approve Booking
Secondary actions: Decline, Suggest new time
```

For availability:

```text
Primary action: Add blocked time
```

For service zones:

```text
Primary action: Add zone
```

---

## Rule 2: Show Warnings Before Buttons

If something is wrong, show it before the action button.

Example:

```text
Cannot approve yet
Deposit has not been confirmed.
```

---

## Rule 3: Keep Technical Detail Hidden

Show:

```text
No calendar clash
```

Not:

```text
Overlap check passed for blocked_until timestamp.
```

---

## Rule 4: Make Every Card Actionable

A card should either:

```text
Open detail
Approve/decline
Call customer
View calendar
```

Do not create dead cards.

---

# 45. Admin Accessibility

Important for mobile use outdoors or in a van.

```text
Large text
High contrast
44px minimum tap targets
Sticky action buttons
Readable in daylight
No tiny calendar cells
Clear status labels, not colour alone
Support reduced motion
```

---

# 46. Final Admin Experience

The admin side should feel like this:

```text
Open app
↓
See today’s work
↓
See what needs approval
↓
Tap one request
↓
Read automatic checks
↓
Approve, decline, or reschedule
↓
Calendar updates instantly
↓
Customer gets notified
```

That is the whole purpose.

The best admin UI for AUTO VALET is not a complicated dashboard. It is a **clean booking operations app**.

---

# 47. Final Recommended Admin UI

Build it around these five core screens:

```text
1. Today Dashboard
Shows today’s jobs, pending requests, and deposit summary.

2. Requests Inbox
Shows every paid request waiting for admin review.

3. Booking Detail
Shows approval checklist, customer, vehicle, address, payment and action buttons.

4. Calendar Timeline
Shows approved jobs, pending requests and travel buffers in a mobile-friendly day view.

5. More / Settings
Availability, service zones, services, pricing, deposit settings and gallery.
```

The most important part is the **Booking Detail screen**. That screen should make admin approval feel safe, fast and beginner-friendly.

The admin should never feel like they are managing a complicated system.

They should feel like:

```text
“I know what needs doing. I know what is paid. I know whether it is safe to approve. I can run the business from my phone.”
```
