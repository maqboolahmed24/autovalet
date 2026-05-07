import type { BookingDraft } from "../../../lib/booking/types";
import type { BookingStepProps } from "../BookingStepper";

type CustomerDetailsFields = Pick<BookingDraft, "customer" | "extraNotes" | "marketingPhotoConsent">;

type CustomerDetailsStepFormProps = CustomerDetailsFields & {
  onChange: (patch: Partial<CustomerDetailsFields>) => void;
};

function CustomerDetailsStepForm({
  customer,
  extraNotes,
  marketingPhotoConsent,
  onChange,
}: CustomerDetailsStepFormProps) {
  const updateCustomer = (patch: Partial<typeof customer>) => {
    onChange({ customer: { ...customer, ...patch } });
  };

  return (
    <div className="booking-step-content">
      <div className="booking-field-grid">
        <div className="form-field">
          <label htmlFor="customer-name">Full name</label>
          <input
            id="customer-name"
            name="fullName"
            autoComplete="name"
            value={customer.fullName}
            onChange={(event) => updateCustomer({ fullName: event.target.value })}
            placeholder="Your full name"
          />
        </div>

        <div className="form-field">
          <label htmlFor="customer-phone">Phone number</label>
          <input
            id="customer-phone"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            type="tel"
            value={customer.phone}
            onChange={(event) => updateCustomer({ phone: event.target.value })}
            placeholder="Your phone number"
          />
        </div>

        <div className="form-field booking-field-grid__full">
          <label htmlFor="customer-email">Email address</label>
          <input
            id="customer-email"
            name="email"
            autoComplete="email"
            inputMode="email"
            type="email"
            value={customer.email}
            onChange={(event) => updateCustomer({ email: event.target.value })}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="booking-extra-notes">Extra notes</label>
        <textarea
          id="booking-extra-notes"
          name="extraNotes"
          value={extraNotes}
          onChange={(event) => onChange({ extraNotes: event.target.value })}
          placeholder="Vehicle condition, pet hair, stains, access timing or special requests..."
        />
        <p className="form-field__hint">
          Tell us about vehicle condition, pet hair, stains, access timing or special requests.
        </p>
      </div>

      <label className="booking-checkbox-card">
        <input
          type="checkbox"
          checked={marketingPhotoConsent}
          onChange={(event) => onChange({ marketingPhotoConsent: event.target.checked })}
        />
        <span>
          <strong>Photo consent</strong>
          <small>
            I allow AUTO VALET to use before/after photos of my vehicle for marketing, without showing
            personal information.
          </small>
        </span>
      </label>
    </div>
  );
}

export function CustomerDetailsStep({ draft, updateDraft }: BookingStepProps) {
  const updateCustomerDetails = (patch: Partial<CustomerDetailsFields>) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      ...patch,
    }));
  };

  return (
    <CustomerDetailsStepForm
      customer={draft.customer}
      extraNotes={draft.extraNotes}
      marketingPhotoConsent={draft.marketingPhotoConsent}
      onChange={updateCustomerDetails}
    />
  );
}
