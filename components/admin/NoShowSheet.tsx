"use client";

import { useState, type FormEvent } from "react";
import type { NoShowReason } from "../../lib/policies";

type NoShowSheetProps = {
  bookingId: string;
  depositPaidMinor: number;
  onMarkedNoShow?: (update: { status: "no_show"; depositAction: string }) => void;
  onClose?: () => void;
};

type NoShowResponse =
  | {
      success: true;
      data: {
        status: "no_show";
        depositAction: string;
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

const noShowReasons: { value: NoShowReason; label: string }[] = [
  { value: "customer_unavailable", label: "Customer unavailable" },
  { value: "vehicle_inaccessible", label: "Vehicle inaccessible" },
  { value: "no_parking", label: "No suitable parking" },
  { value: "unsafe_location", label: "Unsafe location" },
  { value: "other", label: "Other" },
];

export function NoShowSheet({ bookingId, depositPaidMinor, onMarkedNoShow, onClose }: NoShowSheetProps) {
  const [reason, setReason] = useState<NoShowReason>("customer_unavailable");
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
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/mark-no-show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          notes,
        }),
      });
      const payload = (await response.json()) as NoShowResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "No-show could not be recorded." : payload.error.message);
      }

      setTone("success");
      setMessage("No-show recorded.");
      onMarkedNoShow?.(payload.data);
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "No-show could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet" aria-labelledby="no-show-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">No-show</p>
        <h2 id="no-show-title">Record access failure</h2>
        <p>No-show/access failure may forfeit the deposit according to policy.</p>
      </div>

      <div className="admin-inline-note">
        {depositPaidMinor > 0
          ? "Deposit action: keep according to policy."
          : "No deposit action required because no deposit is recorded."}
      </div>

      <form className="admin-money-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Reason</span>
          <select value={reason} onChange={(event) => setReason(event.target.value as NoShowReason)}>
            {noShowReasons.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Customer unavailable, vehicle inaccessible, no parking, unsafe location..."
          />
        </label>
        <div className="admin-sheet-actions">
          {onClose ? (
            <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
              Close
            </button>
          ) : null}
          <button className="admin-button admin-button--danger" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Mark no-show"}
          </button>
        </div>
      </form>

      {message ? (
        <p className={`admin-submit-message admin-submit-message--${tone}`} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
