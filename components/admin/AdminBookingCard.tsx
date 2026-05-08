import Link from "next/link";
import { getAdminBookingStatusLabel } from "../../lib/booking/status-labels";
import type { BookingStatus } from "../../lib/booking/types";

export type AdminBookingCardData = {
  id: string;
  reference: string;
  status: BookingStatus;
  requestedStartLabel: string;
  serviceLabel: string;
  customerName: string;
  vehicleLabel: string;
  locationLabel: string;
  depositLabel: string;
  href: string;
  zoneLabel?: string;
  requestedDateLabel?: string;
  createdAtLabel?: string;
  warning?: string;
};

type AdminBookingCardProps = {
  booking: AdminBookingCardData;
  variant?: "compact" | "full" | "request";
  actionLabel?: string;
  statusLabel?: string;
};

function getStatusTone(status: BookingStatus) {
  if (
    status === "approved" ||
    status === "on_the_way" ||
    status === "arrived" ||
    status === "in_progress"
  ) {
    return "approved";
  }

  if (status === "pending_admin_review" || status === "payment_hold") {
    return "pending";
  }

  if (status === "declined" || status === "payment_failed" || status === "cancelled_by_admin") {
    return "danger";
  }

  return "warning";
}

function getCardTone(status: BookingStatus) {
  if (status === "pending_admin_review" || status === "payment_hold") {
    return "pending";
  }

  if (status === "declined" || status === "payment_failed" || status === "cancelled_by_admin") {
    return "declined";
  }

  return "approved";
}

function getActionLabel(status: BookingStatus) {
  if (status === "payment_hold") {
    return "View hold";
  }

  if (status === "pending_admin_review" || status === "reschedule_requested") {
    return "Review";
  }

  if (status === "approved") {
    return "Open booking";
  }

  if (status === "declined") {
    return "View details";
  }

  return "Open job";
}

export function AdminBookingCard({
  booking,
  variant = "full",
  actionLabel,
  statusLabel,
}: AdminBookingCardProps) {
  const resolvedStatusLabel = statusLabel ?? getAdminBookingStatusLabel(booking.status);
  const footerLabel = booking.createdAtLabel
    ? `${booking.reference} · ${booking.createdAtLabel}`
    : booking.reference;

  return (
    <article className={`booking-card booking-card--${getCardTone(booking.status)} booking-card--${variant}`}>
      <div className="booking-card__top">
        <div>
          {booking.requestedDateLabel ? (
            <span className="booking-card__date">{booking.requestedDateLabel}</span>
          ) : null}
          <time className="booking-card__time">{booking.requestedStartLabel}</time>
          <span className={`status-badge status-badge--${getStatusTone(booking.status)}`}>
            {resolvedStatusLabel}
          </span>
        </div>
        <span className="payment-pill">{booking.depositLabel}</span>
      </div>

      <h3>{booking.serviceLabel}</h3>

      <div className="booking-card__meta">
        <p>{booking.customerName}</p>
        <p>{booking.vehicleLabel}</p>
        <p>{booking.locationLabel}</p>
        {booking.zoneLabel ? <p>{booking.zoneLabel}</p> : null}
        {booking.warning ? <p className="booking-card__warning">{booking.warning}</p> : null}
      </div>

      <div className="booking-card__footer">
        <small>{footerLabel}</small>
        <Link className="ghost-button" href={booking.href}>
          {actionLabel ?? getActionLabel(booking.status)}
        </Link>
      </div>
    </article>
  );
}
