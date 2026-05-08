import Link from "next/link";
import { AdminNotesCard } from "./AdminNotesCard";
import { ApprovalChecklist } from "./ApprovalChecklist";
import { BalancePaymentCard } from "./BalancePaymentCard";
import { BookingActionBar } from "./BookingActionBar";
import { BookingActivityLog } from "./BookingActivityLog";
import { BookingHeroCard } from "./BookingHeroCard";
import { ContactActions } from "./ContactActions";
import { FinalPriceAdjustmentCard } from "./FinalPriceAdjustmentCard";
import { InfoCard } from "./InfoCard";
import { InfoRow } from "./InfoRow";
import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";
import { vehicleSizeLabels } from "../../lib/pricing";

type AdminBookingDetailProps = {
  booking: AdminBookingDetailData;
  backHref?: string;
  backLabel?: string;
  isMockData?: boolean;
};

function getParkingTone(parkingAvailable: string) {
  return parkingAvailable === "Yes" ? "success" : "warning";
}

export function AdminBookingDetail({
  booking,
  backHref = "/admin/requests",
  backLabel = "Back to requests",
  isMockData = false,
}: AdminBookingDetailProps) {
  const addonSummary =
    booking.addons.length > 0
      ? booking.addons.map((addon) => `${addon.label} (${addon.priceLabel})`).join(", ")
      : "None selected";

  return (
    <div className="admin-page booking-detail-page">
      <div className="booking-detail-page__top">
        <Link className="ghost-button" href={backHref}>
          {backLabel}
        </Link>
      </div>

      {isMockData ? (
        <div className="admin-inline-note">
          Booking detail data is placeholder until database persistence is connected.
        </div>
      ) : null}

      <div className="booking-detail">
        <div className="booking-detail__main">
          <BookingHeroCard booking={booking} />
          <ApprovalChecklist checks={booking.checks} />

          <InfoCard
            action={<ContactActions email={booking.customer.email} phone={booking.customer.phone} />}
            eyebrow="Customer"
            title="Customer"
          >
            <InfoRow label="Name" value={booking.customer.fullName} />
            <InfoRow label="Phone" value={booking.customer.phone} />
            <InfoRow label="Email" value={booking.customer.email} />
          </InfoCard>

          <InfoCard eyebrow="Vehicle" title="Vehicle">
            <InfoRow label="Vehicle" value={booking.vehicle.label} />
            <InfoRow label="Make" value={booking.vehicle.make} />
            <InfoRow label="Model" value={booking.vehicle.model} />
            <InfoRow label="Size" value={vehicleSizeLabels[booking.vehicle.size]} />
          </InfoCard>

          <InfoCard eyebrow="Service" title="Service">
            <InfoRow label="Package" value={booking.serviceLabel} />
            <InfoRow label="Add-ons" value={addonSummary} />
            <InfoRow label="Requested date" value={booking.requestedDateLabel} />
            <InfoRow label="Requested time" value={booking.requestedTimeLabel} />
            <InfoRow label="Service ends" value={booking.serviceEndLabel} />
            <InfoRow label="Blocked until" value={booking.blockedUntilLabel} />
          </InfoCard>

          <InfoCard eyebrow="Location" title="Location">
            <InfoRow label="Address" value={booking.location.fullAddress} />
            <InfoRow label="Postcode" value={booking.location.postcode} />
            <InfoRow
              label="Service zone"
              tone={booking.location.isOutsideZone ? "warning" : "success"}
              value={booking.location.zoneLabel}
            />
            <InfoRow
              label="Parking"
              tone={getParkingTone(booking.location.parkingAvailable)}
              value={booking.location.parkingAvailable}
            />
            <InfoRow label="Parking notes" value={booking.location.parkingNotes} />
            <InfoRow label="Access notes" value={booking.location.accessNotes} />
          </InfoCard>

          <InfoCard eyebrow="Payment" title="Payment">
            <InfoRow label="Deposit paid" value={booking.payment.depositPaidLabel} />
            <InfoRow label="Estimated total" value={booking.payment.estimatedTotalLabel} />
            <InfoRow label="Final total" value={booking.payment.finalTotalLabel ?? "Not set"} />
            <InfoRow label="Balance due" value={booking.payment.balanceDueLabel} />
            <InfoRow label="Payment status" value={booking.payment.paymentStatusLabel} />
          </InfoCard>

          <InfoCard eyebrow="Notes" title="Customer notes">
            <p className="info-card__note">{booking.notes.customerNotes || "No customer notes provided."}</p>
          </InfoCard>
        </div>

        <aside className="booking-detail__side" aria-label="Admin booking tools">
          {booking.actions.canAdjustPrice ? (
            <FinalPriceAdjustmentCard
              balanceDueMinor={booking.financials.balanceDueMinor}
              balancePaidMinor={booking.financials.balancePaidMinor}
              bookingId={booking.id}
              depositPaidMinor={booking.financials.depositPaidMinor}
              estimatedTotalMinor={booking.financials.estimatedTotalMinor}
              finalTotalMinor={booking.financials.finalTotalMinor}
              status={booking.status}
            />
          ) : null}

          {booking.actions.canMarkBalancePaid ? (
            <BalancePaymentCard
              balanceDueMinor={booking.financials.balanceDueMinor}
              balancePaidMinor={booking.financials.balancePaidMinor}
              bookingId={booking.id}
              depositPaidMinor={booking.financials.depositPaidMinor}
              estimatedTotalMinor={booking.financials.estimatedTotalMinor}
              finalTotalMinor={booking.financials.finalTotalMinor}
              status={booking.status}
            />
          ) : null}

          <AdminNotesCard notes={booking.notes} />
          <BookingActivityLog activity={booking.activity} />
        </aside>
      </div>

      <BookingActionBar booking={booking} />
    </div>
  );
}
