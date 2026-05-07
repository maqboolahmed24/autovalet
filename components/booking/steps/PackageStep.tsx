import type { BookingStepProps, PackageId } from "../BookingStepper";

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

// TODO: Replace this public display data with the central service catalog once booking services are API-backed.
const packages: PackageOption[] = [
  {
    id: "maintenance",
    eyebrow: "Maintenance",
    title: "Regular care, refined finish.",
    description: "For vehicles needing a routine mobile clean.",
    price: "Small £55 · Medium £65 · Large / 4x4 £75",
    duration: "From 60 mins before travel buffer.",
  },
  {
    id: "deep_clean",
    eyebrow: "Deep Clean",
    title: "A more complete reset.",
    description: "For vehicles needing deeper attention inside, outside or both.",
    price: "£160 - £170",
    duration: "Estimated duration depends on vehicle size and condition.",
  },
];

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
