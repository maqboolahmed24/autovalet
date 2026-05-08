import type { AdminGalleryItem } from "../../lib/admin/gallery";

type GalleryItemCardProps = {
  item: AdminGalleryItem;
  onEdit: () => void;
};

export function GalleryItemCard({ item, onEdit }: GalleryItemCardProps) {
  return (
    <article className="gallery-admin-card">
      <div className="gallery-admin-card__media">
        {item.previewImageUrl ? (
          <img alt={item.altText || item.title} src={item.previewImageUrl} />
        ) : (
          <div className="gallery-admin-placeholder">
            <span>Image pending</span>
          </div>
        )}
      </div>

      <div className="gallery-admin-card__body">
        <div className="gallery-badge-row" aria-label="Gallery item status">
          <span className={`gallery-badge ${item.active ? "gallery-badge--active" : "gallery-badge--muted"}`}>
            {item.statusLabel}
          </span>
          {item.isFeatured ? <span className="gallery-badge gallery-badge--featured">Featured</span> : null}
          <span className={`gallery-badge ${item.hasMarketingConsent ? "gallery-badge--active" : "gallery-badge--warning"}`}>
            {item.consentLabel}
          </span>
        </div>

        <div>
          <h3>{item.title}</h3>
          <p>{item.description || "No description added yet."}</p>
        </div>

        <dl className="gallery-admin-card__meta">
          <div>
            <dt>Service</dt>
            <dd>{item.serviceType || "Not set"}</dd>
          </div>
          <div>
            <dt>Vehicle</dt>
            <dd>{item.vehicleType || "Not set"}</dd>
          </div>
          <div>
            <dt>Safety</dt>
            <dd>{item.safetyLabel}</dd>
          </div>
        </dl>

        {!item.canPublish ? (
          <p className="gallery-admin-card__warning">
            Public visibility needs consent, an image and a completed personal-details check.
          </p>
        ) : null}

        <button className="admin-button admin-button--secondary" type="button" onClick={onEdit}>
          Edit item
        </button>
      </div>
    </article>
  );
}
