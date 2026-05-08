type SummaryCardProps = {
  label: string;
  value: string;
  note: string;
};

export function SummaryCard({ label, value, note }: SummaryCardProps) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}
