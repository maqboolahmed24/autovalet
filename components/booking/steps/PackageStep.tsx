import type { PackageId } from "../../../lib/booking/types";
import {
  formatServicePriceRange,
  formatVehicleVariantDuration,
  formatVehicleVariantPrice,
  servicePackageList,
  vehicleSizeLabels,
  vehicleSizeOrder,
} from "../../../lib/pricing";
import type { BookingStepProps } from "../BookingStepper";

type PackageOption = {
  id: PackageId;
  eyebrow: string;
  title: string;
  description: string;
  price: string;
  duration: string;
};

type PackageStepSelectorProps = {
  value: PackageId | "";
  onChange: (packageId: PackageId) => void;
};

const packageBody: Record<PackageId, string> = {
  maintenance: "For vehicles needing a routine mobile clean.",
  deep_clean: "For vehicles needing deeper attention inside, outside or both.",
};

const packages: PackageOption[] = servicePackageList.map((servicePackage) => ({
  id: servicePackage.id,
  eyebrow: servicePackage.label,
  title: servicePackage.description,
  description: packageBody[servicePackage.id],
  price:
    servicePackage.id === "maintenance"
      ? vehicleSizeOrder
          .map((vehicleSize) => `${vehicleSizeLabels[vehicleSize]} ${formatVehicleVariantPrice(servicePackage.id, vehicleSize)}`)
          .join(" · ")
      : formatServicePriceRange(servicePackage.id),
  duration:
    servicePackage.id === "maintenance"
      ? `From ${formatVehicleVariantDuration(servicePackage.id, "small")} before travel buffer.`
      : "Estimated duration depends on vehicle size and condition.",
}));

function PackageStepSelector({ value, onChange }: PackageStepSelectorProps) {
  return (
    <div className="booking-step-content">
      <div className="booking-option-grid" role="group" aria-label="Service package options">
        {packages.map((item) => {
          const isSelected = value === item.id;

          return (
            <button
              className={`selectable-card booking-package-card${isSelected ? " is-selected" : ""}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(item.id)}
              key={item.id}
            >
              <span className="eyebrow">{item.eyebrow}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <small>{item.price}</small>
              <em>{item.duration}</em>
            </button>
          );
        })}
      </div>

      <p className="booking-step-note">Prices may vary depending on vehicle condition on arrival.</p>
    </div>
  );
}

export function PackageStep({ draft, updateDraft }: BookingStepProps) {
  return (
    <PackageStepSelector
      value={draft.packageId}
      onChange={(packageId) => updateDraft((currentDraft) => ({ ...currentDraft, packageId }))}
    />
  );
}
