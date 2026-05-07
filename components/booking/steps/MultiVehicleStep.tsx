import type { ZoneCheckStatus } from "../../../lib/booking/types";
import { DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT } from "../../../lib/zones";
import type { BookingStepProps } from "../BookingStepper";

type VehicleCountOption = {
  value: number;
  label: string;
  text: string;
};

type MultiVehicleStepSelectorProps = {
  vehicleCount: number;
  zoneCheckStatus?: ZoneCheckStatus;
  onChange: (vehicleCount: number) => void;
};

const vehicleCountOptions: VehicleCountOption[] = [
  {
    value: 1,
    label: "1",
    text: "One vehicle at this address.",
  },
  {
    value: 2,
    label: "2",
    text: "Two vehicles at this address.",
  },
  {
    value: 3,
    label: "3",
    text: "May qualify for outside-zone review.",
  },
  {
    value: 4,
    label: "4+",
    text: "Best for multi-vehicle location requests.",
  },
];

function MultiVehicleStepSelector({
  vehicleCount,
  zoneCheckStatus = "unchecked",
  onChange,
}: MultiVehicleStepSelectorProps) {
  const isOutsideBlocked =
    zoneCheckStatus === "outside_zone_blocked" && vehicleCount < DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT;
  const qualifiesForVolumeReview = vehicleCount >= DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT;

  return (
    <div className="booking-step-content">
      <div className="booking-count-grid" role="group" aria-label="Vehicle count at this location">
        {vehicleCountOptions.map((option) => {
          const isSelected = vehicleCount === option.value;

          return (
            <button
              className={`selectable-card booking-count-card${isSelected ? " is-selected" : ""}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              key={option.value}
            >
              <strong>{option.label}</strong>
              <p>{option.text}</p>
            </button>
          );
        })}
      </div>

      <div className={`booking-zone-note${isOutsideBlocked ? " booking-zone-note--warning" : ""}`}>
        {isOutsideBlocked ? (
          <p>
            This location appears outside the usual service area. Outside-zone requests need 3+ vehicles at the same
            address.
          </p>
        ) : qualifiesForVolumeReview ? (
          <p>3+ vehicles may qualify for outside-zone review if this location is outside the usual area.</p>
        ) : (
          <p>
            AUTO VALET operates within selected service areas. Outside-zone requests may be considered for 3+
            vehicles.
          </p>
        )}
      </div>

      <p className="booking-step-note">
        Multiple vehicles at the same address are reviewed as one location visit. Approval is still manual.
      </p>
    </div>
  );
}

export function MultiVehicleStep({ draft, updateDraft }: BookingStepProps) {
  return (
    <MultiVehicleStepSelector
      vehicleCount={draft.vehicleCount}
      zoneCheckStatus={draft.zoneCheckStatus}
      onChange={(vehicleCount) =>
        updateDraft((currentDraft) => {
          let zoneCheckStatus = currentDraft.zoneCheckStatus;

          if (
            currentDraft.zoneCheckStatus === "outside_zone_blocked" &&
            vehicleCount >= DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT
          ) {
            zoneCheckStatus = "outside_zone_volume_allowed";
          }

          if (
            currentDraft.zoneCheckStatus === "outside_zone_volume_allowed" &&
            vehicleCount < DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT
          ) {
            zoneCheckStatus = "outside_zone_blocked";
          }

          return {
            ...currentDraft,
            vehicleCount,
            zoneCheckStatus,
          };
        })
      }
    />
  );
}
