import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";

export default function AdminLoading() {
  return (
    <section className="admin-page" aria-live="polite">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Loading</p>
          <h1>Preparing admin tools...</h1>
          <p>Loading AUTO VALET admin data.</p>
        </div>
      </header>
      <LoadingSkeleton variant="list" label="Loading admin page" />
    </section>
  );
}
