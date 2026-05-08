import type { BookingDraft, PackageId } from "../../lib/booking/types";
import {
  addonDefinitions,
  calculateBookingPrice,
  formatMoneyGBP,
  servicePackages,
  vehicleSizeLabels,
} from "../../lib/pricing";

type BookingSummaryProps = {
  draft: BookingDraft;
};

const packageLabels: Record<PackageId, string> = {
  maintenance: servicePackages.maintenance.label,
  deep_clean: servicePackages.deep_clean.label,
};

const parkingLabels: Record<Exclude<BookingDraft["parkingAvailable"], "">, string> = {
  yes: "Yes",
  no: "No",
  unknown: "Not sure",
};

function formatRequestedTime(draft: BookingDraft) {
  if (!draft.selectedDate && !draft.selectedSlotStart) return "Not selected";
  if (!draft.selectedDate) return draft.selectedSlotStart;
  if (!draft.selectedSlotStart) return draft.selectedDate;
  return `${draft.selectedDate} at ${draft.selectedSlotStart}`;
}

export function BookingSummary({ draft }: BookingSummaryProps) {
  const primaryVehicle = draft.vehicles[0];
  const selectedAddons = draft.vehicles.flatMap((vehicle) => vehicle.addons);
  const estimate = calculateBookingPrice(draft);

  return (
    <aside className="premium-card booking-summary" aria-labelledby="booking-summary-title">
      <div className="booking-summary__header">
        <p className="eyebrow">Request summary</p>
        <h2 id="booking-summary-title">Draft details</h2>
        <span className="payment-pill">Review first</span>
      </div>

      <dl className="booking-summary__list">
        <div>
          <dt>Service</dt>
          <dd>{draft.packageId ? packageLabels[draft.packageId] : "Not selected"}</dd>
        </div>
        <div>
          <dt>Primary vehicle</dt>
          <dd>
            {[primaryVehicle?.make, primaryVehicle?.model].filter(Boolean).join(" ") || "Not added"}
            {primaryVehicle?.size ? ` · ${vehicleSizeLabels[primaryVehicle.size]}` : ""}
          </dd>
        </div>
        <div>
          <dt>Vehicles</dt>
          <dd>{draft.vehicleCount}</dd>
        </div>
        <div>
          <dt>Extras</dt>
          <dd>{selectedAddons.length ? selectedAddons.map((addonId) => addonDefinitions[addonId].label).join(", ") : "None selected"}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{draft.postcode || draft.fullAddress ? [draft.postcode, draft.fullAddress].filter(Boolean).join(" · ") : "Not added"}</dd>
        </div>
        <div>
          <dt>Parking</dt>
          <dd>{draft.parkingAvailable ? parkingLabels[draft.parkingAvailable] : "Not selected"}</dd>
        </div>
        <div>
          <dt>Requested time</dt>
          <dd>{formatRequestedTime(draft)}</dd>
        </div>
        <div>
          <dt>Estimated total</dt>
          <dd>{estimate.estimatedTotalMinor === 0 ? "Select service and vehicle" : `${formatMoneyGBP(estimate.estimatedTotalMinor)} estimate`}</dd>
        </div>
      </dl>

      <p className="booking-summary__note">
        Final price may vary depending on condition on arrival. No online payment is taken when the
        request is sent for review.
      </p>
    </aside>
  );
}
