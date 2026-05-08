import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";

export default function PublicLoading() {
  return (
    <section className="section public-route-state" aria-live="polite">
      <div className="section__inner">
        <p className="eyebrow">Loading</p>
        <h1>Preparing AUTO VALET...</h1>
        <LoadingSkeleton label="Preparing AUTO VALET" />
      </div>
    </section>
  );
}
