import type { AddonId, BookingDraft, PackageId, VehicleSize } from "./BookingStepper";

type BookingSummaryProps = {
  draft: BookingDraft;
};

const packageLabels: Record<PackageId, string> = {
  maintenance: "Maintenance",
  deep_clean: "Deep Clean",
};

const vehicleSizeLabels: Record<VehicleSize, string> = {
  small: "Small",
  medium: "Medium",
  large_4x4: "Large / 4x4",
};

const addonLabels: Record<AddonId, string> = {
  engine_bay_clean: "Engine bay clean",
  windscreen_repellent: "Windscreen repellent",
  exhaust_tips_polished: "Exhaust tips polished",
  leather_deep_clean: "Leather deep clean",
  convertible_roof_treatment: "Convertible roof treatment",
  excess_pet_hair_removal: "Removal of excess pet hair",
  liquid_decon_clay_bar: "Liquid decon and clay bar",
};

const maintenancePricesMinor: Record<VehicleSize, number> = {
  small: 5500,
  medium: 6500,
  large_4x4: 7500,
};

const deepCleanPricesMinor: Record<VehicleSize, number> = {
  small: 16000,
  medium: 16500,
  large_4x4: 17000,
};

const addonPricesMinor: Record<AddonId, number> = {
  engine_bay_clean: 3000,
  windscreen_repellent: 3000,
  exhaust_tips_polished: 2000,
  leather_deep_clean: 5000,
  convertible_roof_treatment: 4000,
  excess_pet_hair_removal: 3000,
  liquid_decon_clay_bar: 5000,
};

const parkingLabels: Record<Exclude<BookingDraft["parkingAvailable"], "">, string> = {
  yes: "Yes",
  no: "No",
  unknown: "Not sure",
};

function formatMoney(minorUnits: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(minorUnits / 100);
}

function calculateEstimatedTotal(draft: BookingDraft) {
  if (!draft.packageId) return null;

  return draft.vehicles.reduce<number | null>((total, vehicle) => {
    if (!vehicle.size) return total;

    const basePrice =
      draft.packageId === "maintenance"
        ? maintenancePricesMinor[vehicle.size]
        : deepCleanPricesMinor[vehicle.size];
    const addonsTotal = vehicle.addons.reduce((addonTotal, addonId) => addonTotal + addonPricesMinor[addonId], 0);
    const nextTotal = basePrice + addonsTotal;

    return total === null ? nextTotal : total + nextTotal;
  }, null);
}

function formatRequestedTime(draft: BookingDraft) {
  if (!draft.selectedDate && !draft.selectedSlotStart) return "Not selected";
  if (!draft.selectedDate) return draft.selectedSlotStart;
  if (!draft.selectedSlotStart) return draft.selectedDate;
  return `${draft.selectedDate} at ${draft.selectedSlotStart}`;
}

export function BookingSummary({ draft }: BookingSummaryProps) {
  const primaryVehicle = draft.vehicles[0];
  const selectedAddons = draft.vehicles.flatMap((vehicle) => vehicle.addons);
  const estimatedTotal = calculateEstimatedTotal(draft);

  return (
    <aside className="premium-card booking-summary" aria-labelledby="booking-summary-title">
      <div className="booking-summary__header">
        <p className="eyebrow">Request summary</p>
        <h2 id="booking-summary-title">Draft details</h2>
        <span className="payment-pill">Deposit required</span>
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
          <dd>{selectedAddons.length ? selectedAddons.map((addonId) => addonLabels[addonId]).join(", ") : "None selected"}</dd>
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
          <dd>{estimatedTotal === null ? "Select service and vehicle" : `${formatMoney(estimatedTotal)} estimate`}</dd>
        </div>
      </dl>

      <p className="booking-summary__note">
        Final price may vary depending on condition on arrival. A deposit is required before the
        request is sent for review.
      </p>
    </aside>
  );
}
