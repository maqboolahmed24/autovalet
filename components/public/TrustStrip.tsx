type TrustItem = {
  label: string;
  description?: string;
};

const trustItems: TrustItem[] = [
  { label: "Mobile service" },
  { label: "No online payment" },
  { label: "Manual approval" },
  { label: "Premium finish" },
];

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="AUTO VALET service highlights">
      {trustItems.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </section>
  );
}
