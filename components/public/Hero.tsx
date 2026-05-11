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
        {imageSrc ? (
          <img alt={imageAlt} className="hero__image" src={imageSrc} />
        ) : (
          <div className="hero__scene">
            <div className="hero__road" aria-hidden="true" />
            <div className="hero__vehicle-stage" aria-hidden="true">
              <div className="hero-car">
                <div className="hero-car__shadow" />
                <img className="hero-car__image" src="/hero-car/car-full-v2.png" alt="" />
                <div className="hero-car__wheel hero-car__wheel--front">
                  <img className="hero-car__wheel-image" src="/hero-car/car-wheel-v2.png" alt="" />
                </div>
                <div className="hero-car__wheel hero-car__wheel--rear">
                  <img className="hero-car__wheel-image" src="/hero-car/car-wheel-rear-v2.png" alt="" />
                </div>
                <div className="hero-car__brake-light" />
              </div>
            </div>
          </div>
        )}
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
          Requests are reviewed before approval.
        </p>
      </div>
    </section>
  );
}
