import Link from "next/link";

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  serviceType: string;
  vehicleType?: string;
  imageUrl?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  altText?: string;
  isPlaceholder: boolean;
  isFeatured?: boolean;
  hasMarketingConsent?: boolean;
};

const placeholderGalleryItems: GalleryItem[] = [
  {
    id: "exterior-finish",
    title: "Exterior Finish",
    description: "Before and after exterior work placeholder.",
    serviceType: "Exterior",
    isPlaceholder: true,
  },
  {
    id: "interior-reset",
    title: "Interior Reset",
    description: "Interior clean and surface detail placeholder.",
    serviceType: "Interior",
    isPlaceholder: true,
  },
  {
    id: "deep-clean-detail",
    title: "Deep Clean Detail",
    description: "Heavier condition work placeholder.",
    serviceType: "Deep Clean",
    isPlaceholder: true,
  },
  {
    id: "final-result",
    title: "Final Result",
    description: "Finished vehicle presentation placeholder.",
    serviceType: "Finish",
    isPlaceholder: true,
  },
  {
    id: "addon-detail",
    title: "Add-On Detail",
    description: "Engine bay, leather, roof or finishing extras placeholder.",
    serviceType: "Add-ons",
    isPlaceholder: true,
  },
  {
    id: "before-after",
    title: "Before & After",
    description: "Future slider placeholder.",
    serviceType: "Comparison",
    isPlaceholder: true,
  },
];

function GalleryMedia({ item }: { item: GalleryItem }) {
  const canShowBeforeAfter =
    !item.isPlaceholder && item.hasMarketingConsent && item.beforeImageUrl && item.afterImageUrl;
  const canShowSingleImage = !item.isPlaceholder && item.hasMarketingConsent && item.imageUrl;

  if (canShowBeforeAfter) {
    return (
      <div className="gallery-card__image gallery-card__comparison">
        <img alt={`Before ${item.altText ?? item.title}`} src={item.beforeImageUrl} />
        <img alt={`After ${item.altText ?? item.title}`} src={item.afterImageUrl} />
      </div>
    );
  }

  if (canShowSingleImage) {
    return <img alt={item.altText ?? item.title} className="gallery-card__image" src={item.imageUrl} />;
  }

  return (
    <div className="image-placeholder gallery-card__image" aria-label={`${item.title} placeholder`}>
      <span className="gallery-card__placeholder-note">Image coming soon</span>
      <span className="image-placeholder__label">{item.title}</span>
    </div>
  );
}

function getGalleryItemStateLabel(item: GalleryItem) {
  if (item.isPlaceholder) return "Placeholder";
  if (!item.hasMarketingConsent) return "Consent pending";

  return item.isFeatured ? "Featured" : "Selected";
}

type GalleryPageContentProps = {
  items?: GalleryItem[];
};

export function GalleryPageContent({ items = placeholderGalleryItems }: GalleryPageContentProps = {}) {
  const hasRealItems = items.some((item) => !item.isPlaceholder);

  return (
    <section className="section gallery-page" aria-labelledby="gallery-page-title">
      <div className="section__inner">
        <div className="gallery-page__heading">
          <p className="eyebrow">{hasRealItems ? "Gallery" : "Placeholder gallery"}</p>
          <h2 id="gallery-page-title">
            {hasRealItems ? "Recent finishes from mobile detailing work." : "Image spaces ready for approved customer work."}
          </h2>
          <p>
            {hasRealItems
              ? "Exterior angles and cabin details show the finish, trim and interior reset after a careful clean."
              : "Placeholder cards are shown until real gallery images are uploaded with customer photo consent."}
          </p>
        </div>

        <div className="gallery-page__grid motion-stagger">
          {items.map((item) => (
            <article className="premium-card gallery-card" key={item.id}>
              <GalleryMedia item={item} />

              <div className="gallery-card__body">
                <div className="gallery-card__meta">
                  <p className="eyebrow">{item.serviceType}</p>
                  <span>{getGalleryItemStateLabel(item)}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>

        {!hasRealItems ? (
          <aside className="gallery-page__future-note" aria-label="Future gallery support">
            <p>
              Future gallery items can support a single finished image, before and after images, a
              comparison slider, service and vehicle tags, featured homepage placement, alt text, and
              marketing consent and registration plate checks.
            </p>
          </aside>
        ) : null}

        <section className="premium-card gallery-page__cta" aria-labelledby="gallery-cta-title">
          <div>
            <p className="eyebrow">Request a booking</p>
            <h2 id="gallery-cta-title">Have a vehicle ready for detail?</h2>
            <p>Request your preferred slot and we'll review the booking before confirming.</p>
          </div>

          <Link className="primary-button" href="/booking">
            Request a Booking
          </Link>
        </section>
      </div>
    </section>
  );
}
