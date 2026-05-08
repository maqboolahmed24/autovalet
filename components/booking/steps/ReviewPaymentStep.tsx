import type { BookingDraft } from "../../../lib/booking/types";
import {
  addonDefinitions,
  calculateBookingPrice,
  formatMoneyGBP,
  servicePackages,
  vehicleSizeLabels,
} from "../../../lib/pricing";
import type { BookingStepProps } from "../BookingStepper";

type ReviewPaymentContentProps = {
  draft: BookingDraft;
  onSubmit?: () => void | Promise<void>;
  isSubmitting?: boolean;
  paymentsEnabled?: boolean;
  submitError?: string;
};

const parkingLabels: Record<Exclude<BookingDraft["parkingAvailable"], "">, string> = {
  yes: "Yes",
  no: "No",
  unknown: "Not sure",
};

function getPackageLabel(packageId: BookingDraft["packageId"]) {
  return packageId ? servicePackages[packageId].label : "Not selected";
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

  return addonIds.length ? addonIds.map((addonId) => addonDefinitions[addonId].label).join(", ") : "None selected";
}

function getParkingLabel(parkingAvailable: BookingDraft["parkingAvailable"]) {
  return parkingAvailable ? parkingLabels[parkingAvailable] : "Not selected";
}

function ReviewPaymentContent({
  draft,
  onSubmit,
  isSubmitting = false,
  paymentsEnabled = false,
  submitError = "",
}: ReviewPaymentContentProps) {
  const estimate = calculateBookingPrice(draft, { paymentsEnabled });
  const canSubmitRequest = Boolean(onSubmit) && !isSubmitting;
  const estimateIsReady = estimate.estimatedTotalMinor > 0;

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
              <dd>{estimateIsReady ? `${formatMoneyGBP(estimate.estimatedTotalMinor)} estimate` : "Complete service details"}</dd>
            </div>
            <div>
              <dt>Online payment today</dt>
              <dd>{paymentsEnabled && estimateIsReady ? formatMoneyGBP(estimate.depositDueMinor) : "£0"}</dd>
            </div>
            <div>
              <dt>Balance due on completion</dt>
              <dd>{estimateIsReady ? `${formatMoneyGBP(estimate.remainingBalanceMinor)} estimate` : "Calculated after estimate"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="booking-review-policy">
        <p>Prices may vary depending on vehicle condition on arrival.</p>
        <p>No online payment is taken when you submit this request.</p>
        <p>The balance is arranged after approval and paid on completion.</p>
        <p>Your appointment is confirmed only after manual approval.</p>
        <p>Selected dates and times are requested times until approval.</p>
      </div>

      <button
        className="primary-button booking-payment-button"
        type="button"
        disabled={!canSubmitRequest}
        aria-describedby={
          submitError ? "booking-payment-error" : undefined
        }
        onClick={canSubmitRequest ? () => void onSubmit?.() : undefined}
      >
        {paymentsEnabled
          ? isSubmitting
            ? "Preparing checkout..."
            : "Pay Deposit & Request Booking"
          : isSubmitting
            ? "Submitting request..."
            : "Submit booking request"}
      </button>

      {submitError ? (
        <p className="form-field__error booking-payment-error" id="booking-payment-error" role="alert">
          {submitError}
        </p>
      ) : null}
    </div>
  );
}

export function ReviewPaymentStep({
  draft,
  onBookingSubmit,
  isBookingSubmitting,
  paymentsEnabled,
  bookingSubmitError,
}: BookingStepProps) {
  return (
    <ReviewPaymentContent
      draft={draft}
      onSubmit={onBookingSubmit}
      isSubmitting={isBookingSubmitting}
      paymentsEnabled={paymentsEnabled}
      submitError={bookingSubmitError}
    />
  );
}
