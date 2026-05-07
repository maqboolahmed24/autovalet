# AUTO VALET Homepage Trust Strip

## Purpose

The trust strip sits directly after the homepage hero and gives customers a fast, calm credibility signal before they continue into deeper homepage content.

It must reinforce the AUTO VALET booking model without sounding salesy:

- Mobile service
- Deposit required
- Manual approval
- Premium finish

## Placement

The homepage order for this implementation is:

```tsx
<Hero />
<TrustStrip />
```

Future homepage sections should be added after `TrustStrip`.

## Implementation

Component:

- `components/public/TrustStrip.tsx`

Homepage composition:

- `app/(public)/page.tsx`

Route shell:

- `app/(public)/layout.tsx` wraps the route group in the existing `PublicLayout` so the public header, footer, and sticky booking CTA remain active.

The section intentionally uses the existing global `.trust-strip` class from `styles/globals.css`. No new colour palette, CTA, icon set, or section-specific stylesheet is required.

## Copy Rules

Allowed labels:

- `Mobile service`
- `Deposit required`
- `Manual approval`
- `Premium finish`

Avoid wording that implies the request bypasses admin review or creates an appointment automatically.

## Accessibility

The trust strip uses:

```tsx
aria-label="AUTO VALET service highlights"
```

The labels are short text spans inside a semantic `section`, matching the existing horizontal pill-style scroll pattern.

## Acceptance Criteria

- Renders immediately below the hero.
- Uses the existing `.trust-strip` styling.
- Scrolls horizontally on mobile without adding extra controls.
- Does not add duplicate CTA buttons.
- Keeps wording short, premium, and calm.
- Reinforces deposit and manual approval rules.
