"use client";

import type { DepositSettings } from "../../lib/admin/deposit-settings";

type DepositPolicyTextCardProps = {
  settings: DepositSettings;
  onChange: (settings: DepositSettings) => void;
};

export function DepositPolicyTextCard({ settings, onChange }: DepositPolicyTextCardProps) {
  return (
    <section className="settings-card deposit-policy-card" aria-labelledby="deposit-policy-title">
      <div className="settings-card__header">
        <div>
          <p className="eyebrow">Policy</p>
          <h2 id="deposit-policy-title">Customer policy text</h2>
          <p>This text can support future checkout and status pages.</p>
        </div>
      </div>

      <label className="admin-field">
        <span>Policy text</span>
        <textarea
          value={settings.policyText}
          onChange={(event) => onChange({ ...settings, policyText: event.target.value })}
        />
      </label>

      <p className="admin-inline-note">Keep the manual approval wording clear: deposit payment does not confirm the appointment.</p>
    </section>
  );
}
