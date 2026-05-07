import Link from "next/link";

import type { BookingStatus } from "../../lib/booking/types";
import { getCustomerBookingStatusLabel } from "../../lib/booking/status-labels";
import { BookingStatusTimeline } from "./BookingStatusTimeline";

const statusTone: Record<BookingStatus, string> = {
  draft: "pending",
  zone_validated: "pending",
  payment_hold: "pending",
  pending_admin_review: "pending",
  approved: "approved",
  declined: "declined",
  reschedule_requested: "warning",
  on_the_way: "approved",
  arrived: "approved",
  in_progress: "approved",
  completed: "approved",
  cancelled_by_customer: "declined",
  cancelled_by_admin: "declined",
  no_show: "declined",
  expired: "warning",
  payment_failed: "declined",
  refunded: "warning",
};

type BookingStatusViewProps = {
  reference?: string;
};

// TODO: Replace this placeholder with `/api/booking/[reference]` data once the booking status API exists.
const placeholderStatus: BookingStatus = "pending_admin_review";

const placeholderTimeline = [
  {
    label: "Booking request submitted",
    description: "Your request details have been captured.",
    state: "complete" as const,
  },
  {
    label: "Deposit paid",
    description: "Your deposit has been received for review.",
    state: "complete" as const,
  },
  {
    label: "Waiting for AUTO VALET review",
    description: "Location, vehicle details and requested time are being checked.",
    state: "current" as const,
  },
  {
    label: "Approval or reschedule pending",
    description: "Your appointment is not confirmed until AUTO VALET approves it.",
    state: "pending" as const,
  },
];

function getStatusMessage(status: BookingStatus) {
  if (status === "approved") {
    return "Your appointment has been confirmed by AUTO VALET.";
  }

  if (status === "reschedule_requested") {
    return "AUTO VALET has suggested a new time. Please review the update before the appointment is confirmed.";
  }

  if (status === "declined") {
    return "AUTO VALET could not approve this request. Refund or transfer handling follows the booking policy.";
  }

  if (status === "payment_failed") {
    return "Payment was not completed, so no booking request is active.";
  }

  if (status === "expired") {
    return "The temporary hold expired, so the requested slot has been released.";
  }

  if (status === "cancelled_by_customer" || status === "cancelled_by_admin") {
    return "This booking request has been cancelled.";
  }

  if (status === "completed") {
    return "This AUTO VALET job is complete.";
  }

  return "Your appointment is not confirmed yet. AUTO VALET will review your location, vehicle details and requested time before approval.";
}

export function BookingStatusView({ reference }: BookingStatusViewProps) {
  const displayReference = reference?.trim() || "AV-2026-0000";
  const status = placeholderStatus;
  const label = getCustomerBookingStatusLabel(status);

  return (
    <section className="booking-outcome booking-outcome--status" aria-labelledby="booking-status-title">
      <div className="section__inner booking-outcome__inner">
        <article className="premium-card booking-outcome__card booking-status-view">
          <p className="eyebrow">Booking status</p>
          <h1 id="booking-status-title">Booking status.</h1>

          <div className="booking-status-summary" aria-label="Booking reference and status">
            <div>
              <span>Reference</span>
              <strong>{displayReference}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong className={`status-badge status-badge--${statusTone[status]}`}>{label}</strong>
            </div>
          </div>

          <div className="booking-outcome__body">
            <p>{getStatusMessage(status)}</p>
          </div>

          <BookingStatusTimeline items={placeholderTimeline} />

          <div className="booking-outcome__actions">
            <Link className="primary-button" href="/booking">
              Request another booking
            </Link>
            <Link className="secondary-button" href="/">
              Back to home
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
