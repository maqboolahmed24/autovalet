type CalendarEmptyStateProps = {
  title: string;
  description: string;
};

export function CalendarEmptyState({ title, description }: CalendarEmptyStateProps) {
  return (
    <section className="calendar-empty-state" aria-label={title}>
      <span aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
