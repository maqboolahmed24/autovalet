import type { AddonId, BookingDraft, BookingStepProps, PackageId, VehicleSize } from "../BookingStepper";

type ReviewPaymentContentProps = {
  draft: BookingDraft;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  paymentEnabled?: boolean;
};

type TemporaryEstimate = {
  estimatedTotal: string;
  depositDue: string;
  remainingBalance: string;
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

const parkingLabels: Record<Exclude<BookingDraft["parkingAvailable"], "">, string> = {
  yes: "Yes",
  no: "No",
  unknown: "Not sure",
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

const temporaryDepositMinor = 3000;

function formatMoney(minorUnits: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(minorUnits / 100);
}

// Temporary UI-only estimate. Backend pricing and deposit settings will be authoritative later.
function calculateTemporaryEstimate(draft: BookingDraft): TemporaryEstimate {
  const primaryVehicle = draft.vehicles[0];

  if (!draft.packageId || !primaryVehicle?.size) {
    return {
      estimatedTotal: "Complete service details",
      depositDue: formatMoney(temporaryDepositMinor),
      remainingBalance: "Calculated after estimate",
    };
  }

  const basePrice =
    draft.packageId === "maintenance"
      ? maintenancePricesMinor[primaryVehicle.size]
      : deepCleanPricesMinor[primaryVehicle.size];
  const addonTotal = primaryVehicle.addons.reduce((total, addonId) => total + addonPricesMinor[addonId], 0);
  const perVehicleEstimate = basePrice + addonTotal;
  const estimatedTotal = perVehicleEstimate * Math.max(draft.vehicleCount, 1);
  const depositDue = Math.min(temporaryDepositMinor, estimatedTotal);
  const remainingBalance = Math.max(estimatedTotal - depositDue, 0);

  return {
    estimatedTotal: `${formatMoney(estimatedTotal)} estimate`,
    depositDue: formatMoney(depositDue),
    remainingBalance: `${formatMoney(remainingBalance)} estimate`,
  };
}

function getPackageLabel(packageId: BookingDraft["packageId"]) {
  return packageId ? packageLabels[packageId] : "Not selected";
}

function getVehicleSummary(draft: BookingDraft) {
  const primaryVehicle = draft.vehicles[0];
  const vehicleName = [primaryVehicle?.make, primaryVehicle?.model].filter(Boolean).join(" ") || "Not added";
  const vehicleSize = primaryVehicle?.size ? vehicleSizeLabels[primaryVehicle.size] : "Size not selected";
  const countLabel = draft.vehicleCount === 1 ? "1 vehicle" : `${draft.vehicleCount} vehicles`;

  return `${vehicleName} - ${vehicleSize} - ${countLabel}`;
}

function getAddonSummary(draft: BookingDraft) {
  const addonIds = draft.vehicles.flatMap((vehicle) => vehicle.addons);

  return addonIds.length ? addonIds.map((addonId) => addonLabels[addonId]).join(", ") : "None selected";
}

function getParkingLabel(parkingAvailable: BookingDraft["parkingAvailable"]) {
  return parkingAvailable ? parkingLabels[parkingAvailable] : "Not selected";
}

function ReviewPaymentContent({
  draft,
  onSubmit,
  isSubmitting = false,
  paymentEnabled = false,
}: ReviewPaymentContentProps) {
  const estimate = calculateTemporaryEstimate(draft);
  const canStartPayment = paymentEnabled && Boolean(onSubmit) && !isSubmitting;

  return (
    <div className="booking-step-content">
      <div className="booking-review-notice">
        <strong>This is a booking request.</strong>
        <p>Your appointment is only confirmed once AUTO VALET approves it.</p>
      </div>

      <div className="booking-review-grid">
        <section className="booking-review-card">
          <h3>Service</h3>
          <dl>
            <div>
              <dt>Package</dt>
              <dd>{getPackageLabel(draft.packageId)}</dd>
            </div>
            <div>
              <dt>Vehicle</dt>
              <dd>{getVehicleSummary(draft)}</dd>
            </div>
            <div>
              <dt>Add-ons</dt>
              <dd>{getAddonSummary(draft)}</dd>
            </div>
          </dl>
        </section>

        <section className="booking-review-card">
          <h3>Location</h3>
          <dl>
            <div>
              <dt>Postcode</dt>
              <dd>{draft.postcode || "Not added"}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{draft.fullAddress || "Not added"}</dd>
            </div>
            <div>
              <dt>Parking</dt>
              <dd>{getParkingLabel(draft.parkingAvailable)}</dd>
            </div>
            {draft.parkingNotes ? (
              <div>
                <dt>Parking notes</dt>
                <dd>{draft.parkingNotes}</dd>
              </div>
            ) : null}
            {draft.accessNotes ? (
              <div>
                <dt>Access notes</dt>
                <dd>{draft.accessNotes}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="booking-review-card">
          <h3>Requested time</h3>
          <dl>
            <div>
              <dt>Date</dt>
              <dd>{draft.selectedDate || "Not selected"}</dd>
            </div>
            <div>
              <dt>Requested time</dt>
              <dd>{draft.selectedSlotStart || "Not selected"}</dd>
            </div>
          </dl>
        </section>

        <section className="booking-review-card">
          <h3>Customer</h3>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{draft.customer.fullName || "Not added"}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{draft.customer.phone || "Not added"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{draft.customer.email || "Not added"}</dd>
            </div>
            {draft.extraNotes ? (
              <div>
                <dt>Extra notes</dt>
                <dd>{draft.extraNotes}</dd>
              </div>
            ) : null}
            <div>
              <dt>Photo consent</dt>
              <dd>{draft.marketingPhotoConsent ? "Allowed" : "Not allowed"}</dd>
            </div>
          </dl>
        </section>

        <section className="booking-review-card booking-review-card--estimate">
          <h3>Estimate</h3>
          <dl>
            <div>
              <dt>Estimated total</dt>
              <dd>{estimate.estimatedTotal}</dd>
            </div>
            <div>
              <dt>Deposit due today</dt>
              <dd>{estimate.depositDue}</dd>
            </div>
            <div>
              <dt>Remaining balance</dt>
              <dd>{estimate.remainingBalance}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="booking-review-policy">
        <p>Prices may vary depending on vehicle condition on arrival.</p>
        <p>A deposit is required to submit your booking request.</p>
        <p>The remaining balance is due after the deposit and paid on completion.</p>
        <p>Your appointment is confirmed only after manual approval.</p>
        <p>Selected dates and times are requested times until approval.</p>
      </div>

      <button
        className="primary-button booking-payment-button"
        type="button"
        disabled={!canStartPayment}
        aria-describedby={!paymentEnabled ? "booking-payment-hint" : undefined}
        onClick={canStartPayment ? onSubmit : undefined}
      >
        {paymentEnabled
          ? isSubmitting
            ? "Preparing checkout..."
            : "Pay Deposit & Request Booking"
          : "Payment integration coming next"}
      </button>

      {!paymentEnabled ? (
        <p className="form-field__hint" id="booking-payment-hint">
          Deposit checkout will be connected in the payment integration step.
        </p>
      ) : null}
    </div>
  );
}

export function ReviewPaymentStep({ draft }: BookingStepProps) {
  return <ReviewPaymentContent draft={draft} />;
}
