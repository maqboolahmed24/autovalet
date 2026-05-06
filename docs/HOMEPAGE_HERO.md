# AUTO VALET Homepage Hero

This document records the implemented homepage hero section and the rules future homepage work must keep.

## Source Files Checked

The user requested these `/mnt/data` files:

- `/mnt/data/look_and_feel.md`
- `/mnt/data/blueprint.md`
- `/mnt/data/AUTO_VALET_Blueprint_Completion_Addendum.md`
- `/mnt/data/AUTO_VALET_Master_Product_Specification.md`, if available

In this environment, `/mnt/data` does not exist. The matching repo files were used instead:

- `look_and_feel.md`
- `blueprint.md`
- `AUTO_VALET_Blueprint_Completion_Addendum.md`
- `AUTO_VALET_Master_Implementation_Direction.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/PUBLIC_LAYOUT_ARCHITECTURE.md`

`AUTO_VALET_Master_Product_Specification.md` is not present in the repo at generation time.

No real external links were present in the source files. The only URL-like value found was a placeholder Stripe checkout URL in an API example.

## 1. Hero Design Explanation

The hero is a full-viewport cinematic brand panel. It uses a dark glossy placeholder visual, a strong bottom-aligned text stack, one primary booking request CTA, and a clear deposit/approval note.

The design is intentionally sparse:

- Brand first.
- Headline second.
- One supporting sentence.
- One primary action.
- One operational note.

It does not use hero cards, promotional banners, instant-booking wording, or noisy sales language.

## 2. Final Hero Copy

Eyebrow:

```text
AUTO VALET
```

Headline:

```text
Premium mobile detailing,
wherever your car is parked.
```

Supporting copy:

```text
Maintenance cleans, deep cleans and finishing extras delivered with care.
```

Primary CTA:

```text
Request a Booking
```

Note:

```text
Deposit required. Bookings confirmed after approval.
```

Do not replace this with instant-confirmation wording.

## 3. Implemented Files

- `components/public/Hero.tsx`
- `styles/hero.css`
- `components/public/index.ts`
- `styles/globals.css`

`Hero` is exported from `components/public/index.ts`.

## 4. Component API

```tsx
type HeroProps = {
  className?: string;
  imageAlt?: string;
  imageSrc?: string;
};
```

Usage:

```tsx
import { Hero } from "@/components/public";

export default function HomePage() {
  return <Hero />;
}
```

With a real image later:

```tsx
<Hero imageSrc="/images/auto-valet-hero.jpg" imageAlt="AUTO VALET mobile detailing finish" />
```

If the image is purely decorative, leave `imageAlt` empty.

## 5. Animation Implementation

Implemented in CSS:

- Background visual fades in and scales from 1.08 to 1.00 over 1200ms.
- Eyebrow reveals first.
- Headline rises softly.
- Supporting text follows.
- CTA appears after copy.
- Note fades in last.

All motion uses:

```text
cubic-bezier(0.16, 1, 0.3, 1)
```

No bouncy or heavy parallax animation is used.

## 6. Reduced-Motion Fallback

`styles/hero.css` includes a `prefers-reduced-motion: reduce` block that removes hero-specific animations, opacity delays, transforms, and filter blur.

The global reduced-motion rules in `styles/motion.css` also apply.

## 7. Image Placeholder Strategy

The hero supports real images via `imageSrc`.

Until real assets are available, `.hero__image-placeholder` creates an intentional dark automotive surface using:

- Dark layered gradients
- A restrained champagne sheen
- A subtle reflective vehicle-like silhouette
- A slow shine pass
- A dark overlay for readable text

This placeholder must not be replaced by random stock photography. Real images should be high-quality vehicle/detailing imagery with calm tonal areas for text.

## 8. Mobile and Desktop Behavior

Mobile:

- Full viewport height.
- Content sits near the bottom.
- CTA is at least 52px high.
- Copy remains short.
- Safe-area insets are respected.
- Hero includes `data-hero` so `StickyBookingCTA` appears after the hero threshold.

Desktop:

- Hero remains full-bleed and cinematic.
- Content width is controlled.
- Header sits above it cleanly.
- Visual stays atmospheric without competing with text.

## 9. Accessibility Notes

- Hero uses `aria-labelledby` and `aria-describedby`.
- CTA references the deposit/approval note via `aria-describedby`.
- Visual media is treated as decorative unless `imageAlt` is provided.
- The CTA is a real link to `/booking`.
- Focus styling comes from the global design system.
- Motion respects reduced-motion preferences.

## 10. Acceptance Criteria

- Hero looks premium on mobile.
- CTA is obvious and easy to tap.
- Copy is short and confident.
- Booking request model is clear.
- Deposit requirement is visible.
- Placeholder image looks intentional.
- Motion is smooth and not distracting.
- Hero can later accept real image assets.
- Design matches the AUTO VALET look-and-feel blueprint.
- No copy implies instant booking, guaranteed slots, or confirmed appointments before admin approval.

