import type { CreateManualBookingInput } from "../../lib/admin/manual-booking";

type AdminManualLocationSectionProps = {
  value: CreateManualBookingInput["location"];
  zoneNote: string;
  onChange: (patch: Partial<CreateManualBookingInput["location"]>) => void;
};

export function AdminManualLocationSection({ value, zoneNote, onChange }: AdminManualLocationSectionProps) {
  return (
    <section className="admin-form-card" aria-labelledby="manual-location-title">
      <div className="admin-form-card__heading">
        <span>Location</span>
        <h2 id="manual-location-title">Address and access</h2>
      </div>

      <div className="admin-field-grid">
        <label className="admin-field">
          <span>Postcode</span>
          <input
            value={value.postcode}
            onChange={(event) => onChange({ postcode: event.target.value.toUpperCase() })}
            placeholder="CR0 1AA"
            autoComplete="postal-code"
          />
        </label>
        <label className="admin-field">
          <span>Parking available</span>
          <select
            value={value.parkingAvailable}
            onChange={(event) =>
              onChange({ parkingAvailable: event.target.value as CreateManualBookingInput["location"]["parkingAvailable"] })
            }
          >
            <option value="">Choose</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Not sure</option>
          </select>
        </label>
        <label className="admin-field admin-field-grid__full">
          <span>Full address</span>
          <textarea
            value={value.fullAddress}
            onChange={(event) => onChange({ fullAddress: event.target.value })}
            placeholder="Full address for the mobile visit"
          />
        </label>
      </div>

      <div className="admin-field-grid">
        <label className="admin-field">
          <span>Parking notes</span>
          <textarea
            value={value.parkingNotes}
            onChange={(event) => onChange({ parkingNotes: event.target.value })}
            placeholder="Driveway, permits, paid parking..."
          />
        </label>
        <label className="admin-field">
          <span>Access notes</span>
          <textarea
            value={value.accessNotes}
            onChange={(event) => onChange({ accessNotes: event.target.value })}
            placeholder="Gate codes, timing, apartment parking..."
          />
        </label>
      </div>

      <p className="admin-inline-note">{zoneNote}</p>
    </section>
  );
}
