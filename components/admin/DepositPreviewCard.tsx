"use client";

import { useState } from "react";
import { calculateDepositFromSettings, type DepositSettings } from "../../lib/admin/deposit-settings";
import { formatMoneyGBP } from "../../lib/pricing/format-money";

type DepositPreviewCardProps = {
  settings: DepositSettings;
};

export function DepositPreviewCard({ settings }: DepositPreviewCardProps) {
  const [estimatePounds, setEstimatePounds] = useState("150");
  const [vehicleCount, setVehicleCount] = useState(1);
  const estimatedTotalMinor = poundsToMinorValue(estimatePounds);
  const depositDueMinor = calculateDepositFromSettings({
    estimatedTotalMinor,
    vehicleCount,
    settings,
  });
  const remainingBalanceMinor = Math.max(estimatedTotalMinor - depositDueMinor, 0);

  return (
    <aside className="settings-card deposit-preview-card" aria-labelledby="deposit-preview-title">
      <div className="settings-card__header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2 id="deposit-preview-title">Deposit preview</h2>
          <p>Check how the current rule behaves against an estimated booking.</p>
        </div>
      </div>

      <div className="admin-field-grid">
        <label className="admin-field">
          <span>Booking estimate</span>
          <input inputMode="decimal" value={estimatePounds} onChange={(event) => setEstimatePounds(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>Vehicles</span>
          <input
            inputMode="numeric"
            value={String(vehicleCount)}
            onChange={(event) => setVehicleCount(Math.max(Number(event.target.value) || 1, 1))}
          />
        </label>
      </div>

      <dl className="settings-inline-list settings-inline-list--stacked">
        <div>
          <dt>Estimated total</dt>
          <dd>{formatMoneyGBP(estimatedTotalMinor)}</dd>
        </div>
        <div>
          <dt>Vehicles</dt>
          <dd>{vehicleCount}</dd>
        </div>
        <div>
          <dt>Deposit due</dt>
          <dd>{formatMoneyGBP(depositDueMinor)}</dd>
        </div>
        <div>
          <dt>Remaining balance</dt>
          <dd>{formatMoneyGBP(remainingBalanceMinor)}</dd>
        </div>
      </dl>
    </aside>
  );
}

function poundsToMinorValue(value: string) {
  const numberValue = Number(value.replace(/[£,]/g, "").trim());

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(Math.round(numberValue * 100), 0);
}
