# AUTO VALET Global Design System

This document defines the visual foundation for the public website, booking flow, and admin dashboard.

## Source Files Checked

The user requested these `/mnt/data` files:

- `/mnt/data/look_and_feel.md`
- `/mnt/data/admin_tinbin.md`
- `/mnt/data/blueprint.md`
- `/mnt/data/AUTO_VALET_Blueprint_Completion_Addendum.md`
- `/mnt/data/AUTO_VALET_Master_Product_Specification.md`, if available

In this environment, `/mnt/data` does not exist. The matching repo files were used instead:

- `look_and_feel.md`
- `admin_tinbin.md`
- `blueprint.md`
- `AUTO_VALET_Blueprint_Completion_Addendum.md`
- `AUTO_VALET_Master_Implementation_Direction.md`

`AUTO_VALET_Master_Product_Specification.md` is not present in the repo at generation time.

No real external links were present in the source files. The only URL-like value found was a placeholder Stripe checkout URL in an API example.

## 1. Design-System Philosophy

Visual thesis:

```text
Quiet luxury detailing: dark gloss, soft typography, restrained champagne accents, and calm motion.
```

Content plan:

```text
Public site: brand first, service confidence second, image-led proof third, request CTA last.
Booking flow: one decision per screen, clear price/deposit summary, no instant-confirmation wording.
Admin app: work surface first, status and action second, hidden complexity last.
```

Interaction thesis:

```text
Public motion creates presence: hero image scale, section fade-up, image-story movement.
Booking motion reduces friction: smooth step transitions, tactile selectable cards.
Admin motion clarifies workflow: fast slide-up sheets, badge changes, timeline transitions.
```

The system must feel premium, minimal, dark, glossy, calm, confident, image-led, smooth, authentic, and mobile-first.

Avoid:

- Cheap car-wash styling
- Loud banners
- Sales-heavy copy
- Excessive icons
- Cluttered overlays
- Bright gradients
- Random stock photography
- Technical status labels in user-facing UI

## 2. CSS Files

The foundation lives in:

- `styles/tokens.css`
- `styles/globals.css`
- `styles/motion.css`
- `styles/admin.css`

Import `styles/globals.css` once from the root app layout when a Next.js project is scaffolded. It already imports tokens and motion.

Import `styles/admin.css` from the admin route group layout or the root layout if admin classes are needed globally.

## 3. Full CSS Token File

Use `styles/tokens.css` as the source of truth for:

- Colour tokens
- Typography tokens
- Spacing tokens
- Radius tokens
- Shadow tokens
- Border tokens
- Motion timing
- Mobile tap target values
- Admin token aliases

The accent colour must be used sparingly for small labels, selected states, thin lines, and premium highlights. Do not flood sections with gold.

## 4. Base Global CSS

Use `styles/globals.css` for:

- Base dark background
- Global typography
- Focus states
- Section shells
- Public reusable classes
- Core button/card/form/badge classes
- Empty, error, loading, and image placeholder states

Base assumptions:

- `html` and `body` are dark by default.
- Headings are tight and confident.
- Paragraphs are calm and readable.
- Tap targets are at least 44px.
- Primary actions are ideally 52px high.

## 5. Reusable Component Style Guide

These classes are available for implementation:

| Component | Class |
|---|---|
| PageShell | `.page-shell`, `.page-shell--public` |
| Section | `.section`, `.section--compact`, `.section--full-bleed`, `.section__inner` |
| SectionHeading | `.section-heading` |
| Eyebrow | `.eyebrow` |
| PremiumCard | `.premium-card` |
| GlassCard | `.glass-card` |
| PrimaryButton | `.primary-button` |
| SecondaryButton | `.secondary-button` |
| GhostButton | `.ghost-button` |
| StickyMobileCTA | `.mobile-sticky-cta` |
| StatusBadge | `.status-badge` plus modifier |
| PaymentPill | `.payment-pill` |
| FormField | `.form-field` |
| SelectableCard | `.selectable-card`, `.is-selected` |
| StepProgress | `.step-progress` |
| SlideUpSheet | `.sheet-backdrop`, `.slide-up-sheet`, `.sheet-handle` |
| EmptyState | `.empty-state` |
| ErrorState | `.error-state` |
| LoadingSkeleton | `.loading-skeleton` |
| ImagePlaceholder | `.image-placeholder`, `.image-placeholder__label` |

## 6. Button System

### Primary Button

Use for the strongest page action:

- Public: `Request a Booking`
- Booking: `Pay Deposit & Request Booking`
- Admin: `Approve Booking`, `Save`, `Send suggestion`

Class:

```html
<a class="primary-button" href="/booking">Request a Booking</a>
```

Rules:

- Minimum height: 52px.
- Light button on dark background.
- Active state scales to 0.97.
- Hover is shadow-only and subtle.
- Disabled state must be visibly disabled.
- If disabled because of business logic, show a nearby explanation.

### Secondary Button

Use for alternative actions:

```html
<button class="secondary-button">Choose another slot</button>
```

### Ghost Button

Use for compact admin/card actions:

```html
<button class="ghost-button">Review</button>
```

Do not create multiple competing primary buttons in one screen.

## 7. Card System

Cards are allowed when the card is the interaction or information unit. Do not turn entire page sections into nested cards.

Use `.premium-card` for public marketing/service/booking summary surfaces.

Use `.glass-card` only for restrained translucent overlays or controls where backdrop blur helps hierarchy.

Admin cards should use `styles/admin.css` classes:

- `.summary-card`
- `.booking-card`
- `.booking-hero-card`
- `.info-card`
- `.checklist-card`
- `.warning-card`

Admin cards must be actionable or operational. Avoid dead cards.

## 8. Form System

Forms must feel like a premium checkout:

- One booking decision per screen on mobile.
- Large selectable cards.
- Short helper text.
- Clear error text.
- No long policy paragraphs inside the step body.

Use:

```html
<div class="form-field">
  <label for="postcode">Postcode</label>
  <input id="postcode" name="postcode" autocomplete="postal-code" />
  <p class="form-field__hint">We check your service area before payment.</p>
</div>
```

Errors:

```html
<p class="form-field__error">Please check the postcode and try again.</p>
```

Selectable decisions:

```html
<button class="selectable-card is-selected" type="button">
  <span class="eyebrow">Maintenance</span>
  <h3>Regular care, refined finish.</h3>
  <p>Small, medium, and large vehicle options.</p>
</button>
```

## 9. Badge and Status System

Technical statuses must be mapped before display.

Use human labels:

- Needs review
- Payment in progress
- Approved
- Declined
- Outside-zone request
- Deposit paid
- Travel buffer

Do not show raw values like:

- `pending_admin_review`
- `payment_hold`
- `outside_zone_volume_exception`

Badge classes:

```html
<span class="status-badge status-badge--pending">Needs review</span>
<span class="status-badge status-badge--approved">Approved</span>
<span class="status-badge status-badge--warning">Outside-zone request</span>
<span class="payment-pill">Deposit paid</span>
```

Status colours must be small indicators only, not large page backgrounds.

## 10. Motion System

Motion files:

- `styles/motion.css`

Motion tokens:

- Hero reveal: 900ms to 1200ms.
- Section reveal: 600ms to 800ms.
- Card stagger: 80ms.
- Admin page transition: about 380ms.
- Admin sheet transition: about 450ms.
- Button feedback: 100ms to 180ms.

Use these classes where CSS animation is enough:

```html
<div class="motion-hero-reveal"></div>
<section class="motion-fade-up"></section>
<div class="motion-stagger">
  <article></article>
  <article></article>
  <article></article>
</div>
```

Use Framer Motion for:

- Scroll-linked image story
- Booking step transitions
- Admin route transitions
- Slide-up sheet presence
- Shared layout transitions

Avoid:

- Bouncy effects
- Repeated scroll reveals
- Heavy parallax on mobile
- Auto-sliding carousels
- Spinning icons
- Motion that delays booking

Reduced motion is mandatory and already included in `styles/motion.css`.

## 11. Placeholder Image System

Until real before/after photos exist, use `.image-placeholder`.

Rules:

- Do not use random cheap stock photos.
- Placeholders must look deliberate and premium.
- Label the placeholder with real content intent, such as `Exterior Finish`, `Interior Reset`, or `Before & After`.
- Use placeholders for public gallery, vertical image story, and admin gallery empty preview.

Example:

```html
<div class="image-placeholder">
  <span class="image-placeholder__label">Exterior Finish</span>
</div>
```

When real images are supplied, use strong vehicle/detailing images and keep readable overlay contrast.

## 12. Public Website Section Patterns

### Hero

- Full-bleed visual plane.
- Brand visible in first viewport.
- Headline short and confident.
- One primary CTA.
- Deposit/manual approval note under CTA.
- No hero card.

### Trust Strip

Use calm labels:

```html
<section class="trust-strip">
  <span>Mobile service</span>
  <span>Deposit required</span>
  <span>Manual approval</span>
  <span>Premium finish</span>
</section>
```

### Services

- Use restrained service cards.
- Show Maintenance and Deep Clean clearly.
- Avoid discount-table styling.
- Include final-price variation note where relevant.

### Booking Flow

- One step per screen on mobile.
- Use `requested time`, not `confirmed time`.
- Sticky summary on desktop.
- Clear deposit CTA.

### Gallery

- Use placeholders until real photos exist.
- Later support before/after sliders and featured images.
- No cluttered overlays.

## 13. Admin-Specific Style Notes

Admin UI must feel like a mobile booking control room.

Use:

- `.admin-shell`
- `.admin-header`
- `.admin-summary-grid`
- `.summary-card`
- `.booking-card`
- `.booking-hero-card`
- `.checklist-card`
- `.info-card`
- `.booking-action-bar`
- `.admin-bottom-nav`
- `.day-timeline`
- `.week-strip`

Admin rules:

- Default mobile navigation is bottom nav: Today, Requests, Calendar, Customers, More.
- Desktop can switch to a sidebar.
- Requests behave like an inbox.
- Booking detail must show approval checks before action buttons.
- Approve and decline use confirmation sheets.
- Calendar defaults to a day timeline on mobile, not a month grid.
- Keep technical detail hidden.
- Show warnings before action buttons.
- One primary action per screen.

## 14. Accessibility Rules

- Minimum tap target: 44px.
- Primary action target: 52px.
- Do not rely on colour alone for statuses.
- Use readable text contrast on dark backgrounds.
- Keep focus states visible.
- Forms must be keyboard accessible.
- Sticky CTAs must not cover form controls.
- Reduced motion must be respected.
- Avoid small calendar cells on mobile.
- Avoid long paragraphs in booking flow.
- Labels must be visible or programmatically available.

## 15. Public Section Example

```html
<section class="section">
  <div class="section__inner">
    <div class="section-heading motion-fade-up">
      <p class="eyebrow">Services</p>
      <h2>Choose the level of care.</h2>
      <p>Maintenance cleans, deep cleans and finishing extras, reviewed before confirmation.</p>
    </div>

    <div class="motion-stagger">
      <article class="premium-card" style="padding: var(--space-6);">
        <p class="eyebrow">Maintenance</p>
        <h3>Regular care, refined finish.</h3>
        <p>Small, medium, and large vehicle options.</p>
      </article>

      <article class="premium-card" style="padding: var(--space-6); margin-top: var(--space-4);">
        <p class="eyebrow">Deep Clean</p>
        <h3>A more complete reset.</h3>
        <p>Final price may vary depending on condition on arrival.</p>
      </article>
    </div>
  </div>
</section>
```

In production components, avoid inline styles; the example uses them only to show composition before component CSS exists.

## 16. Admin Card Example

```html
<article class="booking-card booking-card--pending">
  <div class="booking-card__top">
    <div>
      <span class="booking-card__time">14:30</span>
      <span class="status-badge status-badge--pending">Needs review</span>
    </div>
    <span class="warning-dot">!</span>
  </div>

  <h3>Deep Clean - Large / 4x4</h3>

  <div class="booking-card__meta">
    <p>Sarah Wilson</p>
    <p>Range Rover Evoque</p>
    <p>Outside-zone request</p>
  </div>

  <div class="booking-card__footer">
    <span class="payment-pill">Deposit paid</span>
    <button class="ghost-button">Review</button>
  </div>
</article>
```

## 17. Future Prompt Checklist

Before adding new UI:

- Use tokens from `styles/tokens.css`.
- Use existing global/admin classes before inventing new ones.
- Keep public pages cinematic and image-led.
- Keep booking flow calm and one-decision-per-screen.
- Keep admin screens operational and beginner-friendly.
- Use human labels, not raw statuses.
- Add empty, loading, error, success, and expired states where relevant.
- Respect reduced motion.
- Maintain 44px minimum tap targets.
- Avoid nested cards and decorative clutter.

