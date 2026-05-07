import type { AddonId } from "../../../lib/booking/types";
import { addonList, formatMoneyGBP } from "../../../lib/pricing";
import type { BookingStepProps } from "../BookingStepper";

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

const addonNotes: Record<AddonId, string> = {
  engine_bay_clean: "Focused engine bay presentation.",
  windscreen_repellent: "Repellent treatment for clearer glass.",
  exhaust_tips_polished: "Sharper finish for visible exhaust tips.",
  leather_deep_clean: "Focused clean for leather surfaces.",
  convertible_roof_treatment: "Extra care for convertible roof material.",
  excess_pet_hair_removal: "Additional attention for heavier pet hair.",
  liquid_decon_clay_bar: "Paint preparation for a smoother exterior.",
};

const addonOptions: AddonOption[] = addonList.map((addon) => ({
  id: addon.id,
  label: addon.label,
  price: formatMoneyGBP(addon.priceMinor),
  note: addonNotes[addon.id],
}));

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
