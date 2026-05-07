import type { BookingStepProps, BookingVehicle, VehicleSize } from "../BookingStepper";

type VehicleSizeOption = {
  id: VehicleSize;
  label: string;
  duration: string;
  helper: string;
};

const vehicleSizeOptions: VehicleSizeOption[] = [
  {
    id: "small",
    label: "Small",
    duration: "60 mins for Maintenance",
    helper: "Compact cars and similar.",
  },
  {
    id: "medium",
    label: "Medium",
    duration: "75 mins for Maintenance",
    helper: "Standard hatchbacks, saloons and similar.",
  },
  {
    id: "large_4x4",
    label: "Large / 4x4",
    duration: "90 mins for Maintenance",
    helper: "SUVs, large vehicles and 4x4s.",
  },
];

type VehicleStepSelectorProps = {
  vehicle: BookingVehicle;
  onChange: (vehicle: BookingVehicle) => void;
};

function VehicleStepSelector({ vehicle, onChange }: VehicleStepSelectorProps) {
  const updateVehicle = (patch: Partial<BookingVehicle>) => {
    onChange({ ...vehicle, ...patch });
  };

  return (
    <div className="booking-step-content">
      <div className="booking-option-grid booking-option-grid--three" role="group" aria-label="Vehicle size options">
        {vehicleSizeOptions.map((size) => {
          const isSelected = vehicle.size === size.id;

          return (
            <button
              className={`selectable-card booking-size-card${isSelected ? " is-selected" : ""}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => updateVehicle({ size: size.id })}
              key={size.id}
            >
              <strong>{size.label}</strong>
              <span>{size.duration}</span>
              <p>{size.helper}</p>
            </button>
          );
        })}
      </div>

      <div className="booking-field-grid">
        <div className="form-field">
          <label htmlFor="vehicle-make">Vehicle make</label>
          <input
            id="vehicle-make"
            name="vehicleMake"
            autoComplete="off"
            value={vehicle.make}
            onChange={(event) => updateVehicle({ make: event.target.value })}
            placeholder="e.g. BMW"
          />
        </div>

        <div className="form-field">
          <label htmlFor="vehicle-model">Vehicle model</label>
          <input
            id="vehicle-model"
            name="vehicleModel"
            autoComplete="off"
            value={vehicle.model}
            onChange={(event) => updateVehicle({ model: event.target.value })}
            placeholder="e.g. 3 Series"
          />
        </div>
      </div>

      <p className="booking-step-note">Not sure? Choose the closest size. We'll review it before approval.</p>
    </div>
  );
}

export function VehicleStep({ draft, updateDraft }: BookingStepProps) {
  const primaryVehicle = draft.vehicles[0];

  const updatePrimaryVehicle = (nextVehicle: BookingVehicle) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      vehicles: currentDraft.vehicles.map((vehicle, index) => (index === 0 ? nextVehicle : vehicle)),
    }));
  };

  return <VehicleStepSelector vehicle={primaryVehicle} onChange={updatePrimaryVehicle} />;
}
