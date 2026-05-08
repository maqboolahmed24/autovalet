"use client";

import type { DepositSettings, DepositType } from "../../lib/admin/deposit-settings";

type DepositSettingsCardProps = {
  settings: DepositSettings;
  isSubmitting: boolean;
  onChange: (settings: DepositSettings) => void;
  onSave: () => void;
};

const depositTypeOptions: {
  id: DepositType;
  label: string;
  text: string;
}[] = [
  {
    id: "fixed",
    label: "Fixed",
    text: "Same deposit for every booking estimate.",
  },
  {
    id: "percentage",
    label: "Percentage",
    text: "Deposit is a percentage of the estimate.",
  },
  {
    id: "per_vehicle",
    label: "Per vehicle",
    text: "Deposit scales with vehicle count.",
  },
];

export function DepositSettingsCard({ settings, isSubmitting, onChange, onSave }: DepositSettingsCardProps) {
  function patchSettings(patch: Partial<DepositSettings>) {
    onChange({
      ...settings,
      ...patch,
    });
  }

  return (
    <section className="settings-card deposit-settings-card" aria-labelledby="deposit-settings-card-title">
      <div className="settings-card__header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2 id="deposit-settings-card-title">Deposit rules</h2>
          <p>Set how the deposit preview is calculated before checkout.</p>
        </div>
      </div>

      <div>
        <span className="admin-choice-label">Deposit type</span>
        <div className="admin-choice-grid admin-choice-grid--three">
          {depositTypeOptions.map((option) => (
            <button
              key={option.id}
              className={`admin-choice-card${settings.depositType === option.id ? " is-selected" : ""}`}
              type="button"
              onClick={() => patchSettings({ depositType: option.id })}
            >
              <strong>{option.label}</strong>
              <small>{option.text}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-field-grid">
        <label className="admin-field">
          <span>Fixed amount</span>
          <input
            inputMode="decimal"
            value={minorToPounds(settings.fixedAmountMinor)}
            onChange={(event) => patchSettings({
              fixedAmountMinor: poundsToMinorValue(event.target.value, settings.fixedAmountMinor),
            })}
          />
        </label>
        <label className="admin-field">
          <span>Percentage</span>
          <input
            inputMode="decimal"
            value={String(settings.percentage)}
            onChange={(event) => patchSettings({ percentage: readPercentage(event.target.value, settings.percentage) })}
          />
        </label>
        <label className="admin-field">
          <span>Per-vehicle amount</span>
          <input
            inputMode="decimal"
            value={minorToPounds(settings.perVehicleAmountMinor)}
            onChange={(event) => patchSettings({
              perVehicleAmountMinor: poundsToMinorValue(event.target.value, settings.perVehicleAmountMinor),
            })}
          />
        </label>
        <label className="admin-field">
          <span>Minimum deposit</span>
          <input
            inputMode="decimal"
            value={minorToPounds(settings.minimumDepositMinor)}
            onChange={(event) => patchSettings({
              minimumDepositMinor: poundsToMinorValue(event.target.value, settings.minimumDepositMinor),
            })}
          />
        </label>
        <label className="admin-field">
          <span>Maximum deposit</span>
          <input
            inputMode="decimal"
            value={typeof settings.maximumDepositMinor === "number" ? minorToPounds(settings.maximumDepositMinor) : ""}
            onChange={(event) => {
              const value = event.target.value.trim();
              patchSettings({
                maximumDepositMinor: value
                  ? poundsToMinorValue(value, settings.maximumDepositMinor ?? settings.minimumDepositMinor)
                  : undefined,
              });
            }}
            placeholder="Optional"
          />
        </label>
      </div>

      <div>
        <span className="admin-choice-label">Deposit transfers</span>
        <div className="admin-choice-grid">
          <button
            className={`admin-choice-card${settings.transferAllowed ? " is-selected" : ""}`}
            type="button"
            onClick={() => patchSettings({ transferAllowed: true })}
          >
            Transfer allowed
          </button>
          <button
            className={`admin-choice-card${!settings.transferAllowed ? " is-selected" : ""}`}
            type="button"
            onClick={() => patchSettings({ transferAllowed: false })}
          >
            Transfer off
          </button>
        </div>
      </div>

      <p className="admin-inline-note">Deposit cannot exceed the estimated total in the fallback calculator.</p>

      <div className="settings-card-actions">
        <button className="admin-button admin-button--primary" type="button" disabled={isSubmitting} onClick={onSave}>
          {isSubmitting ? "Saving..." : "Save deposit settings"}
        </button>
      </div>
    </section>
  );
}

function minorToPounds(amountMinor: number) {
  return String(amountMinor / 100);
}

function poundsToMinorValue(value: string, fallbackMinor: number) {
  const normalized = value.replace(/[£,]/g, "").trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return fallbackMinor;
  }

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    return fallbackMinor;
  }

  return Math.round(numberValue * 100);
}

function readPercentage(value: string, fallback: number) {
  const normalized = value.trim();

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return fallback;
  }

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}
