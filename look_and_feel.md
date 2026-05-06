Absolutely — the homepage should feel like a **premium mobile detailing studio**, not a generic car wash website.

Think:

```text
Minimal.
Dark.
Glossy.
Calm.
Confident.
Image-led.
Smooth vertical storytelling.
```

The website should make the user feel:

```text
“This is professional. This is careful. This is premium. I trust them with my car.”
```

---

# AUTO VALET Visual Direction

## Core Aesthetic

I would design AUTO VALET around this style:

```text
Quiet luxury detailing
```

Not loud. Not overdesigned. Not full of banners.

More like:

```text
Luxury watch website
Premium car configurator
High-end mobile service
Minimal editorial portfolio
```

The homepage should feel like a vertical journey where each scroll reveals one clean idea.

---

# 1. Overall Look and Feel

## Mood

```text
Dark charcoal background
Soft white typography
Glossy vehicle imagery
Muted metallic accents
Large spacing
Minimal wording
Smooth scroll reveals
Premium card surfaces
```

## Visual Personality

| Element    | Direction                             |
| ---------- | ------------------------------------- |
| Background | Deep black / charcoal                 |
| Text       | Soft white, light grey                |
| Accent     | Champagne, silver, or cool blue-grey  |
| Buttons    | Solid light button on dark background |
| Images     | Large, cinematic, rounded, glossy     |
| Animations | Slow, smooth, controlled              |
| Layout     | Spacious, editorial, mobile-first     |
| Wording    | Short, confident, premium             |

---

# 2. Recommended Colour Palette

Use a restrained palette.

```css
:root {
  --bg-main: #070707;
  --bg-soft: #101010;
  --bg-card: #151515;
  --bg-glass: rgba(255, 255, 255, 0.06);

  --text-main: #f5f2ec;
  --text-muted: #a9a9a9;
  --text-soft: #d7d2c8;

  --accent: #c8a96a;
  --accent-soft: rgba(200, 169, 106, 0.18);

  --border-soft: rgba(255, 255, 255, 0.12);
  --shadow-premium: 0 24px 80px rgba(0, 0, 0, 0.45);

  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 32px;

  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
}
```

The gold/champagne accent should be used carefully.

Use it for:

```text
Small labels
Icons
Thin lines
Selected states
Premium highlights
```

Do **not** use gold everywhere.

---

# 3. Typography Direction

The typography should feel clean and expensive.

Recommended font pairing:

```text
Headings: Satoshi, Neue Haas Grotesk, Manrope, or Inter Tight
Body: Inter, Satoshi, or Manrope
```

Font style:

```css
body {
  font-family: Inter, system-ui, sans-serif;
  background: var(--bg-main);
  color: var(--text-main);
}

h1, h2, h3 {
  letter-spacing: -0.04em;
  line-height: 0.95;
}

.eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--accent);
}
```

Use big, confident headings.

Example:

```text
Premium mobile detailing.
Done at your doorstep.
```

Not:

```text
We offer professional and affordable car detailing services in your local area.
```

---

# 4. Homepage Journey

The homepage should not feel like a normal static page.

It should feel like a premium scroll sequence.

## Homepage Structure

```text
1. Hero
2. Trust strip
3. Services preview
4. Premium vertical image story
5. How it works
6. Pricing preview
7. Add-ons
8. Service area / deposit message
9. Final CTA
```

Each section should reveal calmly.

---

# 5. Hero Section

The hero should take almost the full mobile screen.

## Visual Feel

```text
Dark background
Large headline
One premium car/detailing image or placeholder
Soft gradient overlay
Sticky booking CTA
Tiny trust message
```

## Hero Copy

```text
AUTO VALET

Premium mobile detailing,
wherever your car is parked.

Maintenance cleans, deep cleans and finishing extras delivered with care.

[Request a Booking]

Deposit required. All bookings are manually approved.
```

## Hero Animation

When the page loads:

```text
Logo fades in
Headline rises softly
Subtext fades in after
CTA appears last
Image slowly scales from 1.06 to 1.00
```

It should feel slow and premium, not bouncy.

### Hero Motion Timing

```text
Image reveal: 900ms
Headline reveal: 700ms
Button reveal: 500ms
Delay between elements: 100–180ms
Easing: cubic-bezier(0.16, 1, 0.3, 1)
```

---

## Hero Layout Example

```jsx
<section className="hero">
  <div className="hero__media">
    <div className="hero__image-placeholder" />
    <div className="hero__overlay" />
  </div>

  <div className="hero__content">
    <p className="eyebrow">AUTO VALET</p>

    <h1>
      Premium mobile detailing,
      <span>wherever your car is parked.</span>
    </h1>

    <p className="hero__text">
      Maintenance cleans, deep cleans and finishing extras delivered with care.
    </p>

    <a href="/booking" className="primary-button">
      Request a Booking
    </a>

    <p className="hero__note">
      Deposit required. Bookings confirmed after approval.
    </p>
  </div>
</section>
```

---

## Hero CSS

```css
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  padding: 24px;
  background: var(--bg-main);
}

.hero__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero__image-placeholder {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0)),
    radial-gradient(circle at 50% 30%, rgba(200,169,106,0.22), transparent 36%),
    linear-gradient(180deg, #1a1a1a, #050505);
  transform: scale(1.04);
  animation: heroImageReveal 1200ms var(--ease-premium) forwards;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.88)),
    linear-gradient(to right, rgba(0,0,0,0.7), transparent);
}

.hero__content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  padding-bottom: 36px;
}

.hero h1 {
  margin: 12px 0 18px;
  font-size: clamp(3.2rem, 14vw, 7rem);
  line-height: 0.92;
  letter-spacing: -0.07em;
}

.hero h1 span {
  display: block;
  color: var(--text-soft);
}

.hero__text {
  max-width: 520px;
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1.6;
}

.hero__note {
  margin-top: 14px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

@keyframes heroImageReveal {
  from {
    transform: scale(1.08);
    opacity: 0.55;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

# 6. Primary Button Style

The button should feel premium and tactile.

```css
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 22px;
  border-radius: 999px;
  background: var(--text-main);
  color: #070707;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 180ms var(--ease-premium),
    box-shadow 180ms var(--ease-premium),
    background 180ms ease;
  box-shadow: 0 16px 40px rgba(245, 242, 236, 0.12);
}

.primary-button:active {
  transform: scale(0.97);
}

.primary-button:hover {
  box-shadow: 0 22px 60px rgba(245, 242, 236, 0.18);
}
```

For mobile, add a sticky bottom CTA after the hero.

```css
.mobile-sticky-cta {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  z-index: 80;
  display: none;
}

.mobile-sticky-cta.is-visible {
  display: block;
}

.mobile-sticky-cta a {
  width: 100%;
}
```

The sticky CTA should appear only after the user scrolls past the hero.

---

# 7. Trust Strip

Right after the hero, show a small premium trust strip.

```text
Mobile service
Deposit protected
Manual approval
Premium finish
```

Design it like a quiet horizontal scroll on mobile.

```jsx
<section className="trust-strip">
  <span>Mobile service</span>
  <span>Deposit required</span>
  <span>Manual approval</span>
  <span>Premium finish</span>
</section>
```

```css
.trust-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 18px 20px;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
  background: rgba(255,255,255,0.025);
  scrollbar-width: none;
}

.trust-strip span {
  flex: 0 0 auto;
  padding: 10px 14px;
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  color: var(--text-soft);
  font-size: 0.82rem;
}
```

This gives the homepage credibility without becoming noisy.

---

# 8. Services Preview Section

This section should feel simple and high-end.

## Copy

```text
Choose the level of care.

From routine maintenance cleans to deeper resets, every booking is reviewed before confirmation.
```

## Layout

On mobile:

```text
Vertical service cards
Large spacing
One card per service
```

On desktop:

```text
2 or 3 card grid
```

---

## Service Card Example

```jsx
<section className="services-preview">
  <div className="section-heading">
    <p className="eyebrow">Services</p>
    <h2>Choose the level of care.</h2>
    <p>
      Maintenance cleans, deep cleans and finishing extras for vehicles that deserve proper attention.
    </p>
  </div>

  <div className="service-card">
    <div>
      <p className="service-card__label">Maintenance</p>
      <h3>Regular care, refined finish.</h3>
    </div>

    <ul>
      <li>Small — £55</li>
      <li>Medium — £65</li>
      <li>Large / 4x4 — £75</li>
    </ul>

    <span>From 1 hour</span>
  </div>

  <div className="service-card service-card--featured">
    <div>
      <p className="service-card__label">Deep Clean</p>
      <h3>A more complete reset.</h3>
    </div>

    <p>From £160 - £170</p>
    <span>Final price may vary by condition</span>
  </div>
</section>
```

---

## Service Card CSS

```css
.services-preview {
  padding: 96px 20px;
  background: var(--bg-main);
}

.section-heading {
  margin-bottom: 32px;
}

.section-heading h2 {
  margin: 10px 0;
  font-size: clamp(2.4rem, 9vw, 5rem);
}

.section-heading p {
  color: var(--text-muted);
  line-height: 1.6;
}

.service-card {
  position: relative;
  margin-bottom: 16px;
  padding: 24px;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  background:
    linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  box-shadow: var(--shadow-premium);
  overflow: hidden;
}

.service-card::after {
  content: "";
  position: absolute;
  inset: auto -20% -40% auto;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, var(--accent-soft), transparent 65%);
  pointer-events: none;
}

.service-card h3 {
  margin: 8px 0 20px;
  font-size: 1.8rem;
  line-height: 1;
}

.service-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  color: var(--text-soft);
}

.service-card li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.service-card span {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.service-card__label {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
}
```

---

# 9. Premium Vertical Image Scroll Section

This is the most important visual section.

Since the real images are coming later, build it with placeholders now.

The idea:

```text
As the user scrolls, images move vertically through the screen like a luxury editorial story.
Text stays calm and sticky.
Each image card reveals a different part of the service.
```

## Section Concept

```text
Detail in every surface.

Interior reset.
Paintwork care.
Finishing touches.
Before and after results.
```

## How It Should Feel

On mobile:

```text
The user scrolls down.
A large image card enters from below.
It slows into position.
Text fades in.
Next image replaces it.
Each card feels cinematic.
```

On desktop:

```text
Left side: sticky text
Right side: vertical image stack
Images move upward as user scrolls
```

---

## Visual Structure

```text
Section height: 300vh
Sticky area: 100vh
Image cards: move vertically during scroll
Text: changes or fades per stage
```

This gives a premium vertical scroll experience.

---

## Image Story Content

Use these four image cards:

```text
1. Exterior Finish
Placeholder until vehicle images arrive.

2. Interior Reset
Placeholder until interior before/after images arrive.

3. Deep Clean Detail
Placeholder until close-up detailing images arrive.

4. Final Result
Placeholder until finished vehicle images arrive.
```

---

## Framer Motion Example

This is the kind of motion I would use in React.

```jsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function WorkStory() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["20%", "-120%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["70%", "-80%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["120%", "-40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="work-story">
      <div className="work-story__sticky">
        <motion.div className="work-story__copy" style={{ opacity }}>
          <p className="eyebrow">Recent Work</p>
          <h2>Detail you can see. Care you can feel.</h2>
          <p>
            A quiet, careful process designed to reset the vehicle and leave a refined finish.
          </p>
        </motion.div>

        <div className="work-story__media">
          <motion.div className="work-card work-card--one" style={{ y: y1 }}>
            <span>Exterior finish</span>
          </motion.div>

          <motion.div className="work-card work-card--two" style={{ y: y2 }}>
            <span>Interior reset</span>
          </motion.div>

          <motion.div className="work-card work-card--three" style={{ y: y3 }}>
            <span>Final result</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

---

## Vertical Image Scroll CSS

```css
.work-story {
  position: relative;
  height: 320vh;
  background: #080808;
}

.work-story__sticky {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
  display: grid;
  align-items: center;
  padding: 24px;
}

.work-story__copy {
  position: relative;
  z-index: 3;
  max-width: 560px;
}

.work-story__copy h2 {
  margin: 10px 0 18px;
  font-size: clamp(2.8rem, 11vw, 6rem);
  line-height: 0.92;
  letter-spacing: -0.06em;
}

.work-story__copy p {
  color: var(--text-muted);
  line-height: 1.6;
}

.work-story__media {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.work-card {
  position: absolute;
  right: 20px;
  width: min(72vw, 420px);
  height: 52vh;
  border-radius: 32px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 40px 120px rgba(0,0,0,0.7);
  background:
    linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)),
    radial-gradient(circle at 40% 20%, rgba(200,169,106,0.22), transparent 35%),
    #171717;
}

.work-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, transparent, rgba(0,0,0,0.72)),
    linear-gradient(120deg, rgba(255,255,255,0.08), transparent 45%);
}

.work-card span {
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 2;
  color: var(--text-main);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.work-card--one {
  top: 20%;
}

.work-card--two {
  top: 38%;
  right: 44px;
}

.work-card--three {
  top: 56%;
}

@media (min-width: 900px) {
  .work-story__sticky {
    grid-template-columns: 0.9fr 1.1fr;
    padding: 64px;
  }

  .work-story__copy {
    max-width: 640px;
  }

  .work-card {
    width: 460px;
    height: 580px;
    right: 10vw;
  }
}
```

This creates the premium “vertical image journey” effect.

When real images arrive, replace the placeholder background with real image URLs:

```css
.work-card--one {
  background-image:
    linear-gradient(to bottom, transparent, rgba(0,0,0,0.7)),
    url("/images/exterior-finish.jpg");
  background-size: cover;
  background-position: center;
}
```

---

# 10. Scroll Reveal Animations

Every section should softly reveal as the user scrolls.

Not too much movement.

Use:

```text
Opacity: 0 to 1
Y position: 24px to 0
Duration: 600–800ms
Easing: premium cubic bezier
```

## Framer Motion Variants

```jsx
export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const staggerParent = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
```

Usage:

```jsx
<motion.section
  variants={staggerParent}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.28 }}
>
  <motion.p variants={fadeUp} className="eyebrow">
    Services
  </motion.p>

  <motion.h2 variants={fadeUp}>
    Choose the level of care.
  </motion.h2>

  <motion.p variants={fadeUp}>
    Premium mobile detailing at your location.
  </motion.p>
</motion.section>
```

---

# 11. How It Works Section

This should feel calm and clear.

## Copy

```text
How it works

Choose your service.
Request your preferred slot.
Pay your deposit.
We review and confirm.
```

Use four stacked cards on mobile.

Each card reveals one after another.

```jsx
<section className="process">
  <p className="eyebrow">How it works</p>
  <h2>A simple request process.</h2>

  <div className="process-list">
    <article>
      <span>01</span>
      <h3>Choose your service</h3>
      <p>Select the package, vehicle size and any extras.</p>
    </article>

    <article>
      <span>02</span>
      <h3>Request your slot</h3>
      <p>Pick a preferred date and time from available options.</p>
    </article>

    <article>
      <span>03</span>
      <h3>Pay your deposit</h3>
      <p>Your request is submitted securely after deposit payment.</p>
    </article>

    <article>
      <span>04</span>
      <h3>We confirm</h3>
      <p>Every booking is manually reviewed before approval.</p>
    </article>
  </div>
</section>
```

```css
.process {
  padding: 96px 20px;
  background:
    radial-gradient(circle at top right, rgba(200,169,106,0.08), transparent 34%),
    var(--bg-main);
}

.process h2 {
  font-size: clamp(2.4rem, 9vw, 5rem);
  margin: 10px 0 32px;
}

.process-list {
  display: grid;
  gap: 14px;
}

.process article {
  padding: 22px;
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.045);
  border: 1px solid var(--border-soft);
}

.process article span {
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
}

.process article h3 {
  margin: 16px 0 8px;
  font-size: 1.35rem;
}

.process article p {
  color: var(--text-muted);
  line-height: 1.5;
}
```

---

# 12. Pricing Section Feel

Pricing should be transparent but not cheap-looking.

Do not make it look like a discount table.

Use premium cards.

## Copy

```text
Clear pricing.
Final quote confirmed on arrival.

Prices may vary depending on the condition of the vehicle.
```

## Pricing Card Style

```text
Maintenance
Small £55
Medium £65
Large / 4x4 £75

Deep Clean
£160 - £170
```

Add-ons shown as elegant chips.

```css
.price-card {
  padding: 26px;
  border-radius: 28px;
  border: 1px solid var(--border-soft);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025));
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.price-row:last-child {
  border-bottom: none;
}

.addon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.addon-chip {
  padding: 10px 13px;
  border-radius: 999px;
  border: 1px solid var(--border-soft);
  color: var(--text-soft);
  background: rgba(255,255,255,0.035);
}
```

---

# 13. Service Area / Deposit Section

This section should reassure users without sounding strict.

## Copy

```text
Booking requests are reviewed before confirmation.

A deposit is required to protect your requested slot. We’ll check your location, vehicle details and selected service before approving the appointment.
```

For service zones:

```text
AUTO VALET operates within selected service areas. Outside-zone requests may be considered for 3+ vehicles at the same address.
```

Design it as a premium information card.

```css
.policy-card {
  margin: 0 20px 96px;
  padding: 28px;
  border-radius: 32px;
  background:
    linear-gradient(145deg, rgba(200,169,106,0.12), rgba(255,255,255,0.035));
  border: 1px solid rgba(200,169,106,0.22);
}

.policy-card h2 {
  font-size: clamp(2rem, 8vw, 4rem);
  margin: 0 0 16px;
}

.policy-card p {
  color: var(--text-muted);
  line-height: 1.6;
}
```

---

# 14. Final CTA Section

The final section should feel like a closing luxury ad.

## Copy

```text
Ready when your car is.

Request your preferred slot and we’ll review the booking.
```

CTA:

```text
Request a Booking
```

Visual:

```text
Dark glossy image
Subtle gold glow
Large rounded CTA card
```

```css
.final-cta {
  padding: 120px 20px;
  min-height: 80svh;
  display: flex;
  align-items: center;
  background:
    radial-gradient(circle at 50% 20%, rgba(200,169,106,0.16), transparent 34%),
    linear-gradient(to bottom, #080808, #000);
}

.final-cta__card {
  width: 100%;
  padding: 34px;
  border-radius: 36px;
  background:
    linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025));
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-premium);
}

.final-cta h2 {
  font-size: clamp(3rem, 13vw, 7rem);
  line-height: 0.9;
  letter-spacing: -0.07em;
  margin: 0 0 22px;
}

.final-cta p {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 24px;
}
```

---

# 15. Mobile Homepage Flow

On a phone, the experience should feel like this:

```text
Open site
↓
Dark premium hero fills screen
↓
Headline fades up
↓
Large booking button appears
↓
Trust tags slide into view
↓
Services reveal as clean cards
↓
Scroll into cinematic image story
↓
Large detailing images move vertically
↓
How it works explains the booking request process
↓
Pricing feels transparent but refined
↓
Deposit and service area rules are clear
↓
Final CTA closes the journey
```

The user should never feel overwhelmed.

The homepage should guide them naturally toward:

```text
Request a Booking
```

---

# 16. Animation Rules

Use these rules across the whole site.

## Good Animations

```text
Fade up
Soft image scale
Sticky sections
Subtle parallax
Card hover lift
Button press feedback
Progressive reveal
Smooth step transitions
```

## Avoid

```text
Spinning icons
Bouncy effects
Overly fast transitions
Too many things moving at once
Heavy parallax on mobile
Auto-sliding carousels
Popups on first load
```

## Motion Settings

```js
const motionSettings = {
  ease: [0.16, 1, 0.3, 1],
  slow: 0.9,
  medium: 0.65,
  fast: 0.28,
  stagger: 0.08,
};
```

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# 17. Booking CTA Behaviour

The homepage should have two booking CTAs.

## First CTA

Inside hero:

```text
Request a Booking
```

## Sticky Mobile CTA

Appears after the hero once the user scrolls.

```text
Request a Booking
```

At the bottom of the screen.

Behaviour:

```text
Hidden on hero
Appears after 70% of hero is passed
Hides slightly when scrolling down fast
Reappears when scrolling up
Always visible near pricing/final CTA
```

This improves conversion without feeling aggressive.

---

# 18. Image Placeholder Design

Until real images arrive, do not use random cheap stock photos.

Use premium placeholders.

Example placeholder style:

```text
Dark gradient
Subtle reflective shine
Label: Exterior Finish / Interior Reset / Before & After
Small “Image coming soon” text
```

CSS:

```css
.image-placeholder {
  position: relative;
  min-height: 360px;
  border-radius: 32px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)),
    radial-gradient(circle at 50% 20%, rgba(200,169,106,0.18), transparent 40%),
    #151515;
  border: 1px solid var(--border-soft);
}

.image-placeholder::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    110deg,
    transparent,
    rgba(255,255,255,0.08),
    transparent
  );
  animation: placeholderShine 3.8s ease-in-out infinite;
}

@keyframes placeholderShine {
  0%, 55% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
```

This keeps the website looking intentional even before real images are ready.

---

# 19. Homepage Wireframe Feel

This is the emotional structure.

```text
[ HERO ]
AUTO VALET
Premium mobile detailing,
wherever your car is parked.

[Request a Booking]

↓ soft scroll

[ TRUST ]
Mobile service / Deposit required / Manual approval / Premium finish

↓ cards rise in

[ SERVICES ]
Choose the level of care.
Maintenance / Deep Clean

↓ cinematic section begins

[ IMAGE STORY ]
Detail you can see.
Care you can feel.

Large vertical image cards scroll upward.

Exterior finish
Interior reset
Deep clean detail
Final result

↓ calm explanation

[ HOW IT WORKS ]
1. Choose
2. Request
3. Pay deposit
4. We confirm

↓ pricing

[ PRICING ]
Clear packages.
Condition-based final confirmation.

↓ protection rules

[ SERVICE AREA + DEPOSIT ]
Bookings reviewed before confirmation.
Outside-zone requests considered for 3+ vehicles.

↓ final moment

[ FINAL CTA ]
Ready when your car is.

[Request a Booking]
```

---

# 20. Sample Full Homepage Component Structure

```jsx
export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <ServicesPreview />
      <WorkStory />
      <HowItWorks />
      <PricingPreview />
      <ServiceAreaNotice />
      <FinalCTA />
      <MobileStickyCTA />
    </main>
  );
}
```

Recommended component names:

```text
Hero
TrustStrip
ServicesPreview
WorkStory
HowItWorks
PricingPreview
AddonsPreview
ServiceAreaNotice
FinalCTA
MobileStickyCTA
```

---

# 21. The Homepage Should Feel Like This

The final result should not feel like:

```text
A car wash website.
```

It should feel like:

```text
A premium mobile detailing brand with a controlled, professional booking experience.
```

The scroll should feel cinematic:

```text
Dark hero.
Soft reveal.
Clean service cards.
Sticky vertical image story.
Minimal pricing.
Clear booking request process.
Strong final CTA.
```

The most important design move is the **premium vertical image story section**. That is where the website will feel memorable once the before/after images arrive. For now, the placeholder cards can still make the site feel polished and intentional.
