import type { CreateManualBookingInput, ManualBookingStatus } from "../../lib/admin/manual-booking";
import { arePaymentsEnabled } from "../../lib/config/features";

type AdminManualPaymentSectionProps = {
  source: CreateManualBookingInput["source"];
  status: ManualBookingStatus;
  value: CreateManualBookingInput["payment"];
  onSourceChange: (source: CreateManualBookingInput["source"]) => void;
  onStatusChange: (status: ManualBookingStatus) => void;
  onPaymentChange: (patch: Partial<CreateManualBookingInput["payment"]>) => void;
};

export function AdminManualPaymentSection({
  source,
  status,
  value,
  onSourceChange,
  onStatusChange,
  onPaymentChange,
}: AdminManualPaymentSectionProps) {
  const paymentsEnabled = arePaymentsEnabled();

  return (
    <section className="admin-form-card" aria-labelledby="manual-payment-title">
      <div className="admin-form-card__heading">
        <span>Workflow</span>
        <h2 id="manual-payment-title">Source and status</h2>
      </div>

      <div className="admin-field-grid">
        <label className="admin-field">
          <span>Booking source</span>
          <select value={source} onChange={(event) => onSourceChange(event.target.value as CreateManualBookingInput["source"])}>
            <option value="admin_manual">Admin manual</option>
            <option value="phone">Phone</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Booking status</span>
          <select value={status} onChange={(event) => onStatusChange(event.target.value as ManualBookingStatus)}>
            <option value="pending_admin_review">Pending request</option>
            <option value="approved">Approved booking</option>
          </select>
        </label>
        {paymentsEnabled ? (
          <>
            <label className="admin-field">
              <span>Deposit status</span>
              <select
                value={value.depositStatus}
                onChange={(event) =>
                  onPaymentChange({ depositStatus: event.target.value as CreateManualBookingInput["payment"]["depositStatus"] })
                }
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid offline</option>
                <option value="waived">Waived</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Deposit paid</span>
              <input
                type="number"
                min={0}
                step={1}
                value={Math.round(value.depositPaidMinor / 100)}
                onChange={(event) => onPaymentChange({ depositPaidMinor: Math.max(Number(event.target.value) || 0, 0) * 100 })}
              />
            </label>
            <label className="admin-field">
              <span>Payment method</span>
              <select
                value={value.paymentMethod}
                onChange={(event) =>
                  onPaymentChange({ paymentMethod: event.target.value as CreateManualBookingInput["payment"]["paymentMethod"] })
                }
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="card_reader">Card reader</option>
                <option value="online_payment_link">Online payment link</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="admin-field admin-field-grid__full">
              <span>Payment notes</span>
              <textarea
                value={value.notes}
                onChange={(event) => onPaymentChange({ notes: event.target.value })}
                placeholder="Payment context for this manual booking..."
              />
            </label>
          </>
        ) : (
          <p className="admin-inline-note admin-field-grid__full">
            No online payment is taken for booking requests while payments are disabled.
          </p>
        )}
      </div>
    </section>
  );
}
