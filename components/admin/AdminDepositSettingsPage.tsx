"use client";

import { useState } from "react";
import { DepositPolicyTextCard } from "./DepositPolicyTextCard";
import { DepositPreviewCard } from "./DepositPreviewCard";
import { DepositSettingsCard } from "./DepositSettingsCard";
import { AdminPageHeader } from "./AdminPageHeader";
import type { DepositSettings } from "../../lib/admin/deposit-settings";

type AdminDepositSettingsPageProps = {
  settings: DepositSettings;
};

type DepositSettingsResponse =
  | {
      success: true;
      data: {
        settings: DepositSettings;
      };
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details: Record<string, unknown>;
      };
    };

export function AdminDepositSettingsPage({ settings: initialSettings }: AdminDepositSettingsPageProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  async function handleSave() {
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    try {
      const response = await fetch("/api/admin/deposit-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const payload = (await response.json()) as DepositSettingsResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Deposit settings could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Deposit settings saved.");
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Deposit settings could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-page settings-page">
      <AdminPageHeader
        eyebrow="Deposit"
        title="Deposit settings"
        description="Configure the deposit customers pay before a booking request reaches admin review."
      />

      <section className="settings-notice" aria-label="Deposit settings notice">
        <strong>Current fallback deposit</strong>
        <p>Public booking keeps the fixed £30 fallback when admin-managed settings are unavailable.</p>
      </section>

      <div className="settings-page__grid">
        <div className="settings-page__main">
          <DepositSettingsCard
            isSubmitting={isSubmitting}
            settings={settings}
            onChange={setSettings}
            onSave={handleSave}
          />
          <DepositPolicyTextCard settings={settings} onChange={setSettings} />
        </div>

        <aside className="settings-page__side" aria-label="Deposit preview">
          <DepositPreviewCard settings={settings} />
          {message ? (
            <p className={`admin-submit-message admin-submit-message--${tone}`} role="status">
              {message}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
