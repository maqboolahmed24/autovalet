type LoadingSkeletonProps = {
  variant?: "page" | "card" | "list";
  label?: string;
};

export function LoadingSkeleton({ variant = "page", label = "Loading" }: LoadingSkeletonProps) {
  const rowCount = variant === "list" ? 5 : 3;

  return (
    <section className={`loading-skeleton loading-skeleton--${variant}`} aria-label={label} aria-busy="true">
      <div className="loading-skeleton__header" />
      {Array.from({ length: rowCount }, (_, index) => (
        <div className="loading-skeleton__row" key={index} />
      ))}
    </section>
  );
}
