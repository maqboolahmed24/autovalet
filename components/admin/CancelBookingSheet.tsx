"use client";

import { useState, type FormEvent } from "react";
import type {
  CancellationActor,
  CancellationReason,
  DepositAction,
} from "../../lib/policies";
import { depositActionLabels } from "../../lib/policies";

type CancelBookingSheetProps = {
  bookingId: string;
  defaultActor?: CancellationActor;
  defaultReason?: CancellationReason;
  defaultDepositAction?: DepositAction;
  onCancelled?: (update: { status: string; depositAction: DepositAction }) => void;
};

type CancelBookingResponse =
  | {
      success: true;
      data: {
        bookingId: string;
        status: string;
        depositAction: DepositAction;
      };
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details: Record<string, unknown>;
      };
    };

const cancellationReasons: { value: CancellationReason; label: string }[] = [
  { value: "customer_requested", label: "Customer requested cancellation" },
  { value: "weather", label: "Weather issue" },
  { value: "outside_service_area", label: "Outside service area" },
  { value: "vehicle_unsuitable", label: "Vehicle or service unsuitable" },
  { value: "access_or_parking_issue", label: "Access or parking issue" },
  { value: "admin_operational_issue", label: "AUTO VALET operational issue" },
  { value: "duplicate_booking", label: "Duplicate booking" },
  { value: "payment_issue", label: "Payment issue" },
  { value: "other", label: "Other" },
];

const depositActions: DepositAction[] = [
  "refund",
  "transfer",
  "keep_according_to_policy",
  "no_deposit_action_required",
];

export function CancelBookingSheet({
  bookingId,
  defaultActor = "admin",
  defaultReason = "admin_operational_issue",
  defaultDepositAction = "transfer",
  onCancelled,
}: CancelBookingSheetProps) {
  const [actor, setActor] = useState<CancellationActor>(defaultActor);
  const [reason, setReason] = useState<CancellationReason>(defaultReason);
  const [depositAction, setDepositAction] = useState<DepositAction>(defaultDepositAction);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setTone("neutral");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actor,
          reason,
          depositAction,
          notes,
        }),
      });
      const payload = (await response.json()) as CancelBookingResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Booking could not be cancelled." : payload.error.message);
      }

      setTone("success");
      setMessage("Booking cancellation recorded.");
      onCancelled?.({
        status: payload.data.status,
        depositAction: payload.data.depositAction,
      });
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Booking could not be cancelled.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet" aria-labelledby="cancel-booking-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Cancel booking</p>
        <h2 id="cancel-booking-title">Record cancellation</h2>
      </div>

      <form className="admin-money-form" onSubmit={handleSubmit}>
        <div className="admin-field-grid">
          <label className="admin-field">
            <span>Cancelled by</span>
            <select value={actor} onChange={(event) => setActor(event.target.value as CancellationActor)}>
              <option value="admin">AUTO VALET</option>
              <option value="customer">Customer</option>
              <option value="system">System</option>
            </select>
          </label>
          <label className="admin-field">
            <span>Reason</span>
            <select value={reason} onChange={(event) => setReason(event.target.value as CancellationReason)}>
              {cancellationReasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field admin-field-grid__full">
            <span>Deposit action</span>
            <select
              value={depositAction}
              onChange={(event) => setDepositAction(event.target.value as DepositAction)}
            >
              {depositActions.map((action) => (
                <option key={action} value={action}>
                  {depositActionLabels[action]}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field admin-field-grid__full">
            <span>Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add a clear admin note for audit history."
            />
          </label>
        </div>

        <button className="admin-button admin-button--danger" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Recording..." : "Cancel booking"}
        </button>
      </form>

      {message ? (
        <p className={`admin-submit-message admin-submit-message--${tone}`} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
