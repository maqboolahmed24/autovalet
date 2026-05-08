import type { CreateManualBookingInput } from "../../lib/admin/manual-booking";
import { buildManualBookingDraft } from "../../lib/admin/manual-booking";
import { arePaymentsEnabled } from "../../lib/config/features";
import { calculateBookingDuration, calculateBookingPrice, formatMoneyGBP, servicePackages, vehicleSizeLabels } from "../../lib/pricing";

type AdminBookingSummaryProps = {
  booking: CreateManualBookingInput;
};

function getPackageLabel(booking: CreateManualBookingInput) {
  return booking.service.packageId ? servicePackages[booking.service.packageId].label : "Not selected";
}

function getVehicleSizeLabel(booking: CreateManualBookingInput) {
  return booking.vehicle.size ? vehicleSizeLabels[booking.vehicle.size] : "Not selected";
}

export function AdminBookingSummary({ booking }: AdminBookingSummaryProps) {
  const draft = buildManualBookingDraft(booking);
  const price = calculateBookingPrice(draft);
  const duration = calculateBookingDuration(draft);
  const paymentsEnabled = arePaymentsEnabled();
  const balanceDue = paymentsEnabled
    ? Math.max(price.estimatedTotalMinor - booking.payment.depositPaidMinor, 0)
    : price.estimatedTotalMinor;

  return (
    <aside className="admin-booking-summary" aria-label="Manual booking summary">
      <div className="info-card admin-booking-summary__card">
        <div className="info-card__header">
          <div>
            <span className="eyebrow">Summary</span>
            <h2>Manual booking</h2>
          </div>
          <span className="status-badge status-badge--pending">
            {booking.status === "approved" ? "Approved" : "Pending"}
          </span>
        </div>

        <div className="info-row">
          <span>Service</span>
          <strong>{getPackageLabel(booking)}</strong>
        </div>
        <div className="info-row">
          <span>Vehicle</span>
          <strong>
            {getVehicleSizeLabel(booking)} / {booking.vehicle.make || "Make"} {booking.vehicle.model || "Model"}
          </strong>
        </div>
        <div className="info-row">
          <span>Vehicles</span>
          <strong>{booking.service.vehicleCount}</strong>
        </div>
        <div className="info-row">
          <span>Estimated total</span>
          <strong>{formatMoneyGBP(price.estimatedTotalMinor)}</strong>
        </div>
        {paymentsEnabled ? (
          <div className="info-row">
            <span>Deposit paid</span>
            <strong>{formatMoneyGBP(booking.payment.depositPaidMinor)}</strong>
          </div>
        ) : null}
        <div className="info-row">
          <span>{paymentsEnabled ? "Balance due" : "Due on completion"}</span>
          <strong>{formatMoneyGBP(balanceDue)}</strong>
        </div>
        <div className="info-row">
          <span>Service time</span>
          <strong>{duration.serviceDurationMinutes} mins</strong>
        </div>
        <div className="info-row">
          <span>Calendar block</span>
          <strong>{duration.blockedDurationMinutes} mins</strong>
        </div>
      </div>
    </aside>
  );
}
