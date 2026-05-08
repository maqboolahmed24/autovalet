type GalleryUploadCardProps = {
  onAdd: () => void;
};

export function GalleryUploadCard({ onAdd }: GalleryUploadCardProps) {
  return (
    <section className="gallery-upload-card" aria-labelledby="gallery-upload-title">
      <div>
        <p className="eyebrow">Upload workflow</p>
        <h2 id="gallery-upload-title">Add before/after work</h2>
        <p>
          Create a draft item, add before and after images or a single finished image, then publish
          only after consent and plate checks are complete.
        </p>
      </div>
      <button className="admin-button admin-button--secondary" type="button" onClick={onAdd}>
        Add gallery item
      </button>
    </section>
  );
}
