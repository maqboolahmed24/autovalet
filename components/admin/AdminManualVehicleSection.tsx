import type { CreateManualBookingInput } from "../../lib/admin/manual-booking";
import { vehicleSizeLabels, vehicleSizeOrder } from "../../lib/pricing";
import type { VehicleSize } from "../../lib/booking/types";

type AdminManualVehicleSectionProps = {
  value: CreateManualBookingInput["vehicle"];
  onChange: (patch: Partial<CreateManualBookingInput["vehicle"]>) => void;
};

export function AdminManualVehicleSection({ value, onChange }: AdminManualVehicleSectionProps) {
  return (
    <section className="admin-form-card" aria-labelledby="manual-vehicle-title">
      <div className="admin-form-card__heading">
        <span>Vehicle</span>
        <h2 id="manual-vehicle-title">Vehicle details</h2>
      </div>

      <div className="admin-option-grid admin-option-grid--three">
        {vehicleSizeOrder.map((size) => (
          <button
            className={`admin-select-card${value.size === size ? " is-selected" : ""}`}
            key={size}
            type="button"
            aria-pressed={value.size === size}
            onClick={() => onChange({ size: size as VehicleSize })}
          >
            <strong>{vehicleSizeLabels[size]}</strong>
            <span>Size</span>
          </button>
        ))}
      </div>

      <div className="admin-field-grid">
        <label className="admin-field">
          <span>Make</span>
          <input
            value={value.make}
            onChange={(event) => onChange({ make: event.target.value })}
            placeholder="BMW"
          />
        </label>
        <label className="admin-field">
          <span>Model</span>
          <input
            value={value.model}
            onChange={(event) => onChange({ model: event.target.value })}
            placeholder="3 Series"
          />
        </label>
      </div>
    </section>
  );
}
