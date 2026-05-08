"use client";

import { useState } from "react";
import { AddonEditorSheet } from "./AddonEditorSheet";
import { AddonManager } from "./AddonManager";
import { ServicePackageCard } from "./ServicePackageCard";
import { ServicePricingPreviewCard } from "./ServicePricingPreviewCard";
import { ServiceVariantEditor } from "./ServiceVariantEditor";
import { AdminPageHeader } from "./AdminPageHeader";
import type { AdminAddonItem, AdminServicePackage, AdminServicesPricingData } from "../../lib/admin/services-pricing";

type AdminServicesPricingPageProps = {
  data: AdminServicesPricingData;
};

export function AdminServicesPricingPage({ data }: AdminServicesPricingPageProps) {
  const [editingPackage, setEditingPackage] = useState<AdminServicePackage | null>(null);
  const [editingAddon, setEditingAddon] = useState<AdminAddonItem | null>(null);

  return (
    <div className="admin-page settings-page">
      <AdminPageHeader
        eyebrow="Services"
        title="Services & pricing"
        description="Manage package estimates, vehicle-size durations, add-ons and add-on time."
      />

      <section className="settings-notice" aria-label="Pricing notice">
        <strong>{data.isMockData ? "Current configured defaults" : "Service pricing settings"}</strong>
        <p>Changing durations affects available booking times. Changing prices affects future booking estimates.</p>
      </section>

      <div className="settings-page__grid">
        <div className="settings-page__main">
          {data.packages.map((servicePackage) => (
            <ServicePackageCard key={servicePackage.id} servicePackage={servicePackage} onEdit={() => setEditingPackage(servicePackage)} />
          ))}
          <AddonManager addons={data.addons} onEdit={setEditingAddon} />
        </div>

        <aside className="settings-page__side" aria-label="Pricing preview">
          <ServicePricingPreviewCard preview={data.preview} />
        </aside>
      </div>

      {editingPackage ? (
        <div className="admin-sheet-backdrop" role="presentation">
          <ServiceVariantEditor servicePackage={editingPackage} onClose={() => setEditingPackage(null)} />
        </div>
      ) : null}

      {editingAddon ? (
        <div className="admin-sheet-backdrop" role="presentation">
          <AddonEditorSheet addon={editingAddon} onClose={() => setEditingAddon(null)} />
        </div>
      ) : null}
    </div>
  );
}
