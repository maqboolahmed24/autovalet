export function GalleryEmptyState() {
  return (
    <section className="gallery-empty-state" aria-labelledby="gallery-empty-title">
      <span />
      <h2 id="gallery-empty-title">No gallery items yet.</h2>
      <p>
        Add approved before/after images after consent is recorded. Draft items can stay hidden
        until they are safe for the public website.
      </p>
    </section>
  );
}
