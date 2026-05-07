import type { CreateManualBookingInput } from "../../lib/admin/manual-booking";

type AdminManualCustomerSectionProps = {
  value: CreateManualBookingInput["customer"];
  onChange: (patch: Partial<CreateManualBookingInput["customer"]>) => void;
};

export function AdminManualCustomerSection({ value, onChange }: AdminManualCustomerSectionProps) {
  return (
    <section className="admin-form-card" aria-labelledby="manual-customer-title">
      <div className="admin-form-card__heading">
        <span>Customer</span>
        <h2 id="manual-customer-title">Who is this for?</h2>
      </div>

      <div className="admin-field-grid">
        <label className="admin-field">
          <span>Full name</span>
          <input
            value={value.fullName}
            onChange={(event) => onChange({ fullName: event.target.value })}
            placeholder="Sarah Wilson"
            autoComplete="name"
          />
        </label>
        <label className="admin-field">
          <span>Phone</span>
          <input
            value={value.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            placeholder="07123 456789"
            autoComplete="tel"
            inputMode="tel"
          />
        </label>
        <label className="admin-field admin-field-grid__full">
          <span>Email</span>
          <input
            value={value.email}
            onChange={(event) => onChange({ email: event.target.value })}
            placeholder="customer@example.com"
            autoComplete="email"
            inputMode="email"
          />
        </label>
      </div>
    </section>
  );
}
