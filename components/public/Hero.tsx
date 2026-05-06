import Link from "next/link";

type HeroProps = {
  className?: string;
  imageAlt?: string;
  imageSrc?: string;
};

export function Hero({ className, imageAlt = "", imageSrc }: HeroProps) {
  const hasImage = Boolean(imageSrc);

  return (
    <section
      aria-describedby="home-hero-note"
      aria-labelledby="home-hero-title"
      className={`hero${hasImage ? " hero--has-image" : ""}${className ? ` ${className}` : ""}`}
      data-hero
    >
      <div className="hero__media" aria-hidden={imageAlt ? undefined : true}>
        {imageSrc ? <img alt={imageAlt} className="hero__image" src={imageSrc} /> : <div className="hero__image-placeholder" />}
        <div className="hero__overlay" aria-hidden="true" />
      </div>

      <div className="hero__content">
        <p className="eyebrow hero__eyebrow">AUTO VALET</p>

        <h1 className="hero__title" id="home-hero-title">
          Premium mobile detailing,
          <span>wherever your car is parked.</span>
        </h1>

        <p className="hero__text">Maintenance cleans, deep cleans and finishing extras delivered with care.</p>

        <div className="hero__action">
          <Link aria-describedby="home-hero-note" className="primary-button" href="/booking">
            Request a Booking
          </Link>
        </div>

        <p className="hero__note" id="home-hero-note">
          Deposit required. Bookings confirmed after approval.
        </p>
      </div>
    </section>
  );
}

