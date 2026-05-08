"use client";

import { useState, type FormEvent } from "react";
import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";
import {
  declineReasonLabels,
  declineReasons,
  type DeclineReason,
} from "../../lib/admin/decline-booking";
import type { DepositAction } from "../../lib/policies";
import { depositActionLabels } from "../../lib/policies";

type DeclineBookingSheetProps = {
  booking: AdminBookingDetailData;
  onClose: () => void;
};

type DeclineResponse =
  | {
      success: true;
      data: {
        bookingId: string;
        status: "declined";
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

const depositActions: DepositAction[] = [
  "refund",
  "transfer",
  "no_deposit_action_required",
];

export function DeclineBookingSheet({ booking, onClose }: DeclineBookingSheetProps) {
  const [reason, setReason] = useState<DeclineReason>("outside_service_area");
  const [depositAction, setDepositAction] = useState<DepositAction>(
    booking.financials.depositPaidMinor > 0 ? "refund" : "no_deposit_action_required",
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(booking.id)}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          depositAction,
          notes,
        }),
      });
      const payload = (await response.json()) as DeclineResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Request could not be declined." : payload.error.message);
      }

      setTone("success");
      setMessage("Request declined.");
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Request could not be declined.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="decline-booking-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Decline</p>
        <h2 id="decline-booking-title">Decline request</h2>
        <p>Declining releases this requested slot. Refund or transfer handling is recorded by policy later.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <div>
          <span className="admin-choice-label">Reason</span>
          <div className="admin-choice-grid">
            {declineReasons.map((item) => (
              <button
                className={`admin-choice-card${reason === item ? " is-selected" : ""}`}
                key={item}
                type="button"
                onClick={() => setReason(item)}
              >
                {declineReasonLabels[item]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="admin-choice-label">Deposit action</span>
          <div className="admin-choice-grid">
            {depositActions.map((action) => (
              <button
                className={`admin-choice-card${depositAction === action ? " is-selected" : ""}`}
                key={action}
                type="button"
                onClick={() => setDepositAction(action)}
              >
                {depositActionLabels[action]}
              </button>
            ))}
          </div>
        </div>

        <label className="admin-field">
          <span>Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add a clear note for the customer update and audit trail."
          />
        </label>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--danger" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Declining..." : "Decline Request"}
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
