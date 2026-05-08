import type { AdminGalleryItem } from "../../lib/admin/gallery";
import { GalleryEmptyState } from "./GalleryEmptyState";
import { GalleryItemCard } from "./GalleryItemCard";

type GalleryItemGridProps = {
  items: AdminGalleryItem[];
  onEdit: (item: AdminGalleryItem) => void;
};

export function GalleryItemGrid({ items, onEdit }: GalleryItemGridProps) {
  if (items.length === 0) {
    return <GalleryEmptyState />;
  }

  return (
    <section className="gallery-admin-section" aria-labelledby="gallery-items-title">
      <div className="gallery-admin-section__header">
        <div>
          <p className="eyebrow">Items</p>
          <h2 id="gallery-items-title">Gallery items</h2>
        </div>
        <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>

      <div className="gallery-admin-grid">
        {items.map((item) => (
          <GalleryItemCard item={item} key={item.id} onEdit={() => onEdit(item)} />
        ))}
      </div>
    </section>
  );
}
