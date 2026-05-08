type GalleryFeaturedToggleProps = {
  active: boolean;
  isFeatured: boolean;
  onActiveChange: (active: boolean) => void;
  onFeaturedChange: (isFeatured: boolean) => void;
};

export function GalleryFeaturedToggle({
  active,
  isFeatured,
  onActiveChange,
  onFeaturedChange,
}: GalleryFeaturedToggleProps) {
  return (
    <div className="gallery-toggle-stack">
      <div>
        <span className="admin-choice-label">Public status</span>
        <div className="admin-choice-grid">
          <button
            className={`admin-choice-card${active ? " is-selected" : ""}`}
            type="button"
            onClick={() => onActiveChange(true)}
          >
            Active on public gallery
          </button>
          <button
            className={`admin-choice-card${!active ? " is-selected" : ""}`}
            type="button"
            onClick={() => onActiveChange(false)}
          >
            Draft / hidden
          </button>
        </div>
      </div>

      <label className="gallery-checkbox-card">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(event) => onFeaturedChange(event.target.checked)}
        />
        <span>
          <strong>Feature this item</strong>
          <small>Featured items should also be active and safe for public use.</small>
        </span>
      </label>
    </div>
  );
}
