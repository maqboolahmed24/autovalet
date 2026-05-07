import type { CreateManualBookingInput } from "../../lib/admin/manual-booking";
import type { AddonId, PackageId } from "../../lib/booking/types";
import { addonList, formatMoneyGBP, servicePackageList } from "../../lib/pricing";

type AdminManualServiceSectionProps = {
  value: CreateManualBookingInput["service"];
  onChange: (patch: Partial<CreateManualBookingInput["service"]>) => void;
};

export function AdminManualServiceSection({ value, onChange }: AdminManualServiceSectionProps) {
  function toggleAddon(addonId: AddonId) {
    const addons = value.addons.includes(addonId)
      ? value.addons.filter((selectedId) => selectedId !== addonId)
      : [...value.addons, addonId];

    onChange({ addons });
  }

  return (
    <section className="admin-form-card" aria-labelledby="manual-service-title">
      <div className="admin-form-card__heading">
        <span>Service</span>
        <h2 id="manual-service-title">Package and extras</h2>
      </div>

      <div className="admin-option-grid">
        {servicePackageList.map((servicePackage) => (
          <button
            className={`admin-select-card${value.packageId === servicePackage.id ? " is-selected" : ""}`}
            key={servicePackage.id}
            type="button"
            aria-pressed={value.packageId === servicePackage.id}
            onClick={() => onChange({ packageId: servicePackage.id as PackageId })}
          >
            <strong>{servicePackage.label}</strong>
            <span>{servicePackage.description}</span>
          </button>
        ))}
      </div>

      <label className="admin-field admin-field--compact">
        <span>Vehicle count at same address</span>
        <select
          value={value.vehicleCount}
          onChange={(event) => onChange({ vehicleCount: Number(event.target.value) })}
        >
          <option value={1}>1 vehicle</option>
          <option value={2}>2 vehicles</option>
          <option value={3}>3 vehicles</option>
          <option value={4}>4+ vehicles</option>
        </select>
      </label>

      <div className="admin-checkbox-grid" aria-label="Add-ons">
        {addonList.map((addon) => {
          const isSelected = value.addons.includes(addon.id);

          return (
            <label className={`admin-check-card${isSelected ? " is-selected" : ""}`} key={addon.id}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleAddon(addon.id)}
              />
              <span>
                <strong>{addon.label}</strong>
                <small>
                  {formatMoneyGBP(addon.priceMinor)} / {addon.extraDurationMinutes} mins
                </small>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
