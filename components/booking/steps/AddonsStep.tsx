import type { AddonId, BookingStepProps } from "../BookingStepper";

type AddonOption = {
  id: AddonId;
  label: string;
  price: string;
  note: string;
};

type AddonsStepSelectorProps = {
  selectedAddonIds: AddonId[];
  onChange: (selectedAddonIds: AddonId[]) => void;
};

// TODO: Replace this local booking display data with the central add-on catalog once lib/pricing exists.
const addonOptions: AddonOption[] = [
  {
    id: "engine_bay_clean",
    label: "Engine bay clean",
    price: "£30",
    note: "Focused engine bay presentation.",
  },
  {
    id: "windscreen_repellent",
    label: "Windscreen repellent",
    price: "£30",
    note: "Repellent treatment for clearer glass.",
  },
  {
    id: "exhaust_tips_polished",
    label: "Exhaust tips polished",
    price: "£20",
    note: "Sharper finish for visible exhaust tips.",
  },
  {
    id: "leather_deep_clean",
    label: "Leather deep clean",
    price: "£50",
    note: "Focused clean for leather surfaces.",
  },
  {
    id: "convertible_roof_treatment",
    label: "Convertible roof treatment",
    price: "£40",
    note: "Extra care for convertible roof material.",
  },
  {
    id: "excess_pet_hair_removal",
    label: "Removal of excess pet hair",
    price: "£30",
    note: "Additional attention for heavier pet hair.",
  },
  {
    id: "liquid_decon_clay_bar",
    label: "Liquid decon and clay bar",
    price: "£50",
    note: "Paint preparation for a smoother exterior.",
  },
];

function AddonsStepSelector({ selectedAddonIds, onChange }: AddonsStepSelectorProps) {
  const toggleAddon = (addonId: AddonId) => {
    if (selectedAddonIds.includes(addonId)) {
      onChange(selectedAddonIds.filter((selectedId) => selectedId !== addonId));
      return;
    }

    onChange([...selectedAddonIds, addonId]);
  };

  const selectedCountText =
    selectedAddonIds.length === 0
      ? "No extras selected"
      : `${selectedAddonIds.length} extra${selectedAddonIds.length === 1 ? "" : "s"} selected`;

  return (
    <div className="booking-step-content">
      <div className="booking-selected-count" aria-live="polite">
        {selectedCountText}
      </div>

      <div className="booking-addons-grid" role="group" aria-label="Optional add-on extras">
        {addonOptions.map((addon) => {
          const isSelected = selectedAddonIds.includes(addon.id);

          return (
            <button
              className={`selectable-card booking-addon-card${isSelected ? " is-selected" : ""}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleAddon(addon.id)}
              key={addon.id}
            >
              <span className="booking-addon-card__check" aria-hidden="true">
                {isSelected ? "On" : "+"}
              </span>
              <strong>{addon.label}</strong>
              <p>{addon.note}</p>
              <small>{addon.price}</small>
            </button>
          );
        })}
      </div>

      <p className="booking-step-note">Add-ons may increase the time needed and will be reviewed before approval.</p>
    </div>
  );
}

export function AddonsStep({ draft, updateDraft }: BookingStepProps) {
  const primaryVehicle = draft.vehicles[0];

  const updateSelectedAddons = (selectedAddonIds: AddonId[]) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      vehicles: currentDraft.vehicles.map((vehicle, index) =>
        index === 0 ? { ...vehicle, addons: selectedAddonIds } : vehicle,
      ),
    }));
  };

  return (
    <AddonsStepSelector selectedAddonIds={primaryVehicle.addons} onChange={updateSelectedAddons} />
  );
}
