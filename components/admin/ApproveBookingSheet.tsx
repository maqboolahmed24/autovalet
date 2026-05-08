"use client";

import { useState, type FormEvent } from "react";
import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";

type ApproveBookingSheetProps = {
  booking: AdminBookingDetailData;
  onClose: () => void;
};

type ApproveResponse =
  | {
      success: true;
      data: {
        bookingId: string;
        status: "approved";
        approvedAt: string;
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

export function ApproveBookingSheet({ booking, onClose }: ApproveBookingSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(booking.id)}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const payload = (await response.json()) as ApproveResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Booking could not be approved." : payload.error.message);
      }

      setTone("success");
      setMessage("Booking approved.");
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Booking could not be approved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="approve-booking-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Approve</p>
        <h2 id="approve-booking-title">Approve this booking?</h2>
        <p>This will send a confirmation to the customer once persistence and notifications are connected.</p>
      </div>

      <dl className="admin-sheet-summary">
        <div>
          <dt>Date and time</dt>
          <dd>{booking.requestedDateLabel} at {booking.requestedTimeLabel}</dd>
        </div>
        <div>
          <dt>Service</dt>
          <dd>{booking.serviceLabel}</dd>
        </div>
        <div>
          <dt>Customer</dt>
          <dd>{booking.customer.fullName}</dd>
        </div>
        <div>
          <dt>Estimate</dt>
          <dd>{booking.payment.estimatedTotalLabel}</dd>
        </div>
        <div>
          <dt>Buffer until</dt>
          <dd>{booking.blockedUntilLabel}</dd>
        </div>
      </dl>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <p className="admin-inline-note">
          Approval will re-check conflict, customer, vehicle, zone and duration rules before saving.
        </p>
        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Approving..." : "Approve & Send Confirmation"}
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
