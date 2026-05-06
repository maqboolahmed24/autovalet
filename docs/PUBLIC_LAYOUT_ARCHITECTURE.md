# AUTO VALET Public Website Layout Architecture

This document defines the public customer website shell. It should be used by every public page before homepage sections, service pages, booking steps, or policy content are implemented.

## Source Files Checked

The user requested these `/mnt/data` files:

- `/mnt/data/blueprint.md`
- `/mnt/data/look_and_feel.md`
- `/mnt/data/AUTO_VALET_Blueprint_Completion_Addendum.md`
- `/mnt/data/AUTO_VALET_Master_Product_Specification.md`, if available

In this environment, `/mnt/data` does not exist. The matching repo files were used instead:

- `blueprint.md`
- `look_and_feel.md`
- `AUTO_VALET_Blueprint_Completion_Addendum.md`
- `AUTO_VALET_Master_Implementation_Direction.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/TECHNICAL_FOUNDATION.md`

`AUTO_VALET_Master_Product_Specification.md` is not present in the repo at generation time.

No real external links were present in the source files. The only URL-like value found was a placeholder Stripe checkout URL in an API example.

## 1. Public Website Layout Architecture

The public shell is mobile-first, fixed-header, dark, minimal, and CTA-oriented. It must support:

- Home
- Services
- Gallery
- Booking
- FAQ
- Policies
- Contact or service area page
- Booking success
- Payment failed
- Booking expired
- Booking status page

Implemented files:

- `components/public/PublicLayout.tsx`
- `components/public/PublicHeader.tsx`
- `components/public/MobileMenu.tsx`
- `components/public/PublicFooter.tsx`
- `components/public/StickyBookingCTA.tsx`
- `components/public/PublicPageShell.tsx`
- `components/public/PublicPageTransition.tsx`
- `components/public/SectionHeading.tsx`
- `components/public/PageIntro.tsx`
- `components/public/SkipLink.tsx`
- `styles/public.css`
- `lib/seo/public-metadata.ts`

Expected App Router layout usage:

```tsx
import type { ReactNode } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
```

The layout renders:

```tsx
<>
  <SkipLink />
  <PublicHeader />
  <PublicPageTransition>
    <main id="main-content">{children}</main>
  </PublicPageTransition>
  <PublicFooter />
  <StickyBookingCTA />
</>
```

## 2. Component List and Purpose

| Component | Purpose |
|---|---|
| `PublicLayout` | Composes the public shell around every public page. |
| `PublicHeader` | Fixed premium header with brand, desktop nav, mobile menu trigger, and booking CTA. |
| `MobileMenu` | Full-screen mobile menu with large links and booking approval/deposit note. |
| `PublicPageShell` | Applies the public page-shell class and dark foundation. |
| `PublicPageTransition` | Adds a soft page entrance wrapper using design-system motion classes. |
| `PublicFooter` | Minimal footer with brand, service links, policy links, service area note, and approval/deposit reminder. |
| `StickyBookingCTA` | Mobile fixed booking CTA that appears after the hero threshold and hides on booking/payment/status routes. |
| `SectionHeading` | Reusable eyebrow/title/body heading pattern for public sections. |
| `PageIntro` | Reusable top intro pattern for non-home public pages. |
| `SkipLink` | Keyboard accessibility link to main content. |

## 3. Route Structure

Recommended public App Router paths:

```text
app/
  (public)/
    layout.tsx
    page.tsx
    services/page.tsx
    gallery/page.tsx
    booking/page.tsx
    booking/success/page.tsx
    booking/failed/page.tsx
    booking/expired/page.tsx
    booking/status/[reference]/page.tsx
    faq/page.tsx
    policies/page.tsx
    policies/privacy/page.tsx
    policies/terms/page.tsx
    policies/deposit-cancellation/page.tsx
    policies/cookies/page.tsx
    contact/page.tsx
    reschedule/[token]/page.tsx
```

Blueprint-required post-payment screens can be mapped as:

| Blueprint Screen | App Route |
|---|---|
| `/payment-processing` | `/booking/processing` or `/payment-processing` |
| `/booking-request-received` | `/booking/success` |
| `/payment-failed` | `/booking/failed` |
| `/booking-expired` | `/booking/expired` |
| `/booking-status/:reference` | `/booking/status/[reference]` |
| `/reschedule/:token` | `/reschedule/[token]` |
| `/booking-approved` | `/booking-approved` or status-specific content |
| `/booking-declined` | `/booking-declined` or status-specific content |

Future implementation should choose one canonical route set and redirect old/alternate routes if needed.

## 4. Header UX and Code Example

Header behavior:

- Fixed at the top.
- Transparent over the hero at first load.
- Adds `is-scrolled` after `window.scrollY > 24`.
- Uses a soft dark blur background after scroll.
- Mobile shows `AUTO VALET` and `Menu`.
- Desktop shows Services, Gallery, How it works, Pricing, and Request a Booking.
- Booking CTA is primary but restrained.

Implemented in:

- `components/public/PublicHeader.tsx`

Current behavior:

```tsx
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const updateScrollState = () => {
    setIsScrolled(window.scrollY > 24);
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  return () => {
    window.removeEventListener("scroll", updateScrollState);
  };
}, []);
```

Core classes:

- `.public-header`
- `.public-header.is-scrolled`
- `.public-header__brand`
- `.public-header__nav`
- `.public-header__booking`
- `.public-header__menu`

## 5. Mobile Menu UX and Code Example

Mobile menu behavior:

- Full-screen dark sheet.
- Large tap targets.
- Escape closes menu.
- Body scroll locks while open.
- Includes Request a Booking primary CTA.
- Shows the exact reminder: `Deposit required. Bookings confirmed after approval.`

Implemented in:

- `components/public/MobileMenu.tsx`

Core markup:

```tsx
<div id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true">
  <div className="mobile-menu__panel motion-sheet-enter">
    <nav className="mobile-menu__nav" aria-label="Mobile navigation">
      ...
    </nav>
    <div className="mobile-menu__cta">
      <Link className="primary-button" href="/booking">Request a Booking</Link>
      <p>Deposit required. Bookings confirmed after approval.</p>
    </div>
  </div>
</div>
```

## 6. Sticky Booking CTA UX and Code Example

Sticky CTA behavior:

- Mobile only.
- Hidden on initial hero view.
- Appears after 70 percent of `[data-hero]` height or fallback threshold.
- Fixed near the bottom with safe-area inset.
- Hidden on `/booking`, `/payment`, `/booking-status`, and `/reschedule` routes to avoid covering critical flow controls.
- Text: `Request a Booking`.
- Note: `Paid request, manually approved`.

Implemented in:

- `components/public/StickyBookingCTA.tsx`

Hero sections should include:

```html
<section data-hero>
  ...
</section>
```

Core logic:

```tsx
const hero = document.querySelector<HTMLElement>("[data-hero]");
const heroThreshold = hero ? hero.offsetHeight * 0.7 : threshold;
setIsVisible(window.scrollY > heroThreshold);
```

## 7. Footer Structure

Footer includes:

- AUTO VALET
- Short brand line
- Services
- Booking
- Gallery
- FAQ
- Policies
- Contact
- Service area note
- Deposit/approval reminder
- Privacy Policy
- Terms & Conditions
- Deposit & Cancellation Policy
- Cookie Policy

Implemented in:

- `components/public/PublicFooter.tsx`

Footer copy must stay quiet and operational. Do not add noisy marketing claims.

## 8. Responsive Spacing Rules

Global classes:

- `.public-container`
- `.public-container--narrow`
- `.public-container--wide`
- `.public-section`
- `.public-section--tight`
- `.public-section--hero`
- `.section`
- `.section__inner`

Rules:

- Mobile section padding: 80px to 120px depending on section.
- Mobile horizontal padding: 20px via `--page-gutter`.
- Desktop max content width: `1180px` default.
- Wide content can use `1360px`.
- Text-heavy content should use the narrow container.
- Hero can break max-width because it is cinematic.
- Keep copy blocks short and readable.
- Avoid dense text blocks on mobile.

## 9. SEO Metadata Pattern

Implemented in:

- `lib/seo/public-metadata.ts`

Usage:

```tsx
import { createPublicMetadata } from "@/lib/seo/public-metadata";

export const metadata = createPublicMetadata("home");
```

Route metadata plan:

| Route | Title | Purpose |
|---|---|---|
| `/` | `AUTO VALET | Premium Mobile Car Detailing` | Premium introduction and booking CTA. |
| `/services` | `Services | AUTO VALET` | Services, pricing, add-ons, condition disclaimer. |
| `/gallery` | `Gallery | AUTO VALET` | Before/after and placeholder work. |
| `/booking` | `Request a Booking | AUTO VALET` | Multi-step booking request. |
| `/faq` | `FAQ | AUTO VALET` | Deposit, approval, pricing, service zone, cancellation. |
| `/policies` | `Policies | AUTO VALET` | Terms, privacy, deposit/cancellation, service area, cookie, photo consent. |
| `/contact` | `Contact | AUTO VALET` | Contact and service area guidance. |
| `/booking/success` | `Booking Request Received | AUTO VALET` | Deposit-paid booking request success state. |
| `/booking/failed` | `Payment Failed | AUTO VALET` | Failed deposit payment state. |
| `/booking/expired` | `Booking Hold Expired | AUTO VALET` | Expired payment hold state. |
| `/booking/status/[reference]` | `Booking Status | AUTO VALET` | Customer status by secure booking reference. |

SEO standards:

- Each public page exports metadata.
- Use canonical URLs.
- Use semantic headings.
- Add LocalBusiness, Service, FAQPage, BreadcrumbList, and ImageObject structured data when the matching page content exists.
- Do not send personal data into analytics events.

## 10. Accessibility Rules

- Include `SkipLink` before the header.
- Main content uses `id="main-content"`.
- Header nav has `aria-label="Primary navigation"`.
- Mobile menu uses `role="dialog"` and `aria-modal="true"`.
- Menu button controls `#mobile-menu` with `aria-expanded`.
- Mobile menu closes on Escape.
- Tap targets must be at least 44px.
- Primary CTAs should be 52px.
- Focus states must stay visible.
- Sticky CTA must hide on booking/payment/status flows to avoid overlapping critical controls.
- Motion relies on global reduced-motion rules.
- No customer copy should imply instant confirmation.

## 11. Acceptance Criteria

- Works mobile-first.
- Header is simple, premium, and not bulky.
- Header becomes readable with blur after scroll.
- Desktop navigation includes Services, Gallery, How it works, Pricing, and Request a Booking.
- Mobile navigation is beginner-friendly with large tap targets.
- Booking CTA is easy to reach without feeling aggressive.
- Sticky CTA appears after hero threshold and hides on booking-critical routes.
- Footer includes required brand, navigation, service area, approval/deposit, and policy links.
- Layout supports all public pages listed in the blueprint.
- Customer is never told a slot is instantly confirmed.
- Motion is smooth and respects reduced-motion preferences.
- SEO metadata pattern exists for all public route types.

