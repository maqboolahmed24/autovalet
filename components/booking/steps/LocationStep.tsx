import type { BookingDraft, BookingStepProps } from "../BookingStepper";

type LocationFields = Pick<
  BookingDraft,
  "postcode" | "fullAddress" | "parkingAvailable" | "parkingNotes" | "accessNotes"
>;

type ParkingAvailability = Exclude<BookingDraft["parkingAvailable"], "">;

type ParkingOption = {
  id: ParkingAvailability;
  label: string;
  text: string;
};

type LocationStepFormProps = LocationFields & {
  onChange: (patch: Partial<LocationFields>) => void;
};

const parkingOptions: ParkingOption[] = [
  {
    id: "yes",
    label: "Yes",
    text: "Suitable parking is available nearby.",
  },
  {
    id: "no",
    label: "No",
    text: "There may not be suitable parking.",
  },
  {
    id: "unknown",
    label: "Not sure",
    text: "AUTO VALET can review the details.",
  },
];

function normalizePostcodeInput(value: string) {
  return value.toUpperCase().replace(/\s+/g, " ").trimStart();
}

function hasValidLookingUkPostcode(value: string) {
  const normalizedValue = value.trim().toUpperCase();

  if (!normalizedValue) {
    return true;
  }

  return /^(GIR\s*0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/.test(normalizedValue);
}

function LocationStepForm({
  postcode,
  fullAddress,
  parkingAvailable,
  parkingNotes,
  accessNotes,
  onChange,
}: LocationStepFormProps) {
  const showPostcodeFormatHint = postcode.trim().length > 0 && !hasValidLookingUkPostcode(postcode);
  const showLimitedParkingWarning = parkingAvailable === "no";
  const showParkingReviewNote = parkingAvailable === "unknown";

  return (
    <div className="booking-step-content">
      <div className="booking-field-grid booking-field-grid--single">
        <div className="form-field">
          <label htmlFor="booking-postcode">Postcode</label>
          <input
            id="booking-postcode"
            name="postcode"
            autoComplete="postal-code"
            value={postcode}
            onChange={(event) => onChange({ postcode: normalizePostcodeInput(event.target.value) })}
            placeholder="e.g. CR0 1AA"
            aria-describedby="booking-postcode-hint"
          />
          <p className="form-field__hint" id="booking-postcode-hint">
            We check your service area before payment.
          </p>
          {showPostcodeFormatHint ? (
            <p className="form-field__hint booking-field-warning" role="status">
              This postcode format looks unusual. AUTO VALET will check the service area before payment.
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="booking-address">Full address</label>
          <textarea
            id="booking-address"
            name="address"
            autoComplete="street-address"
            value={fullAddress}
            onChange={(event) => onChange({ fullAddress: event.target.value })}
            placeholder="Enter the address where the vehicle will be detailed"
          />
          <p className="form-field__hint">Enter the address where the vehicle will be detailed.</p>
        </div>
      </div>

      <div className="booking-step-subsection">
        <div>
          <h3>Is suitable parking available?</h3>
          <p className="form-field__hint">Suitable parking helps us complete the mobile service safely.</p>
        </div>

        <div className="booking-option-grid booking-option-grid--three" role="group" aria-label="Parking availability">
          {parkingOptions.map((option) => {
            const isSelected = parkingAvailable === option.id;

            return (
              <button
                className={`selectable-card booking-parking-card${isSelected ? " is-selected" : ""}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ parkingAvailable: option.id })}
                key={option.id}
              >
                <strong>{option.label}</strong>
                <p>{option.text}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="booking-field-grid">
        <div className="form-field">
          <label htmlFor="parking-notes">Parking notes</label>
          <textarea
            id="parking-notes"
            name="parking-notes"
            value={parkingNotes}
            onChange={(event) => onChange({ parkingNotes: event.target.value })}
            placeholder="Permits, restrictions, driveway, paid parking..."
          />
          <p className="form-field__hint">Add any parking details that may affect the mobile visit.</p>
        </div>

        <div className="form-field">
          <label htmlFor="access-notes">Access notes</label>
          <textarea
            id="access-notes"
            name="access-notes"
            value={accessNotes}
            onChange={(event) => onChange({ accessNotes: event.target.value })}
            placeholder="Gates, building access, keys, timing notes..."
          />
          <p className="form-field__hint">
            Tell us about gates, permits, apartment parking, time restrictions or anything else useful.
          </p>
        </div>
      </div>

      {showLimitedParkingWarning ? (
        <p className="booking-step-note booking-step-note--warning">
          Limited parking may affect approval. AUTO VALET will review this before confirming.
        </p>
      ) : null}

      {showParkingReviewNote ? (
        <p className="booking-step-note">
          AUTO VALET can review parking details before approval. Add anything useful in the notes.
        </p>
      ) : null}

      <p className="booking-step-note">
        Please make sure the vehicle is accessible and suitable parking is available nearby.
      </p>
    </div>
  );
}

export function LocationStep({ draft, updateDraft }: BookingStepProps) {
  const updateLocationFields = (patch: Partial<LocationFields>) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      ...patch,
    }));
  };

  return (
    <LocationStepForm
      postcode={draft.postcode}
      fullAddress={draft.fullAddress}
      parkingAvailable={draft.parkingAvailable}
      parkingNotes={draft.parkingNotes}
      accessNotes={draft.accessNotes}
      onChange={updateLocationFields}
    />
  );
}
