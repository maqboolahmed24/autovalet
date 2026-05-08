"use client";

import { useState } from "react";
import { AddServiceZoneSheet } from "./AddServiceZoneSheet";
import { EditServiceZoneSheet } from "./EditServiceZoneSheet";
import { OutsideZoneSettingsCard } from "./OutsideZoneSettingsCard";
import { ServiceZoneList } from "./ServiceZoneList";
import { AdminPageHeader } from "./AdminPageHeader";
import type { AdminServiceZoneItem, AdminServiceZonesData } from "../../lib/admin/service-zone-types";

type AdminServiceZonesPageProps = {
  data: AdminServiceZonesData;
};

export function AdminServiceZonesPage({ data }: AdminServiceZonesPageProps) {
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<AdminServiceZoneItem | null>(null);

  return (
    <div className="admin-page settings-page">
      <AdminPageHeader
        eyebrow="Service zones"
        title="Manage service areas"
        description="Control the postcodes and regions where customers can request AUTO VALET bookings."
        actions={
          <button className="ghost-button" type="button" onClick={() => setIsAddingZone(true)}>
            Add zone
          </button>
        }
      />

      <section className="settings-notice" aria-label="Service zone notice">
        <strong>{data.isMockData ? "Local service-zone defaults" : "Service-zone settings"}</strong>
        <p>
          These zones feed the public service-area check for new booking requests.
        </p>
      </section>

      <div className="settings-page__grid">
        <ServiceZoneList zones={data.zones} onAdd={() => setIsAddingZone(true)} onEdit={setEditingZone} />
        <OutsideZoneSettingsCard minimumVehicleCount={data.outsideZoneSettings.minimumVehicleCount} />
      </div>

      {isAddingZone ? (
        <div className="admin-sheet-backdrop" role="presentation">
          <AddServiceZoneSheet onClose={() => setIsAddingZone(false)} />
        </div>
      ) : null}

      {editingZone ? (
        <div className="admin-sheet-backdrop" role="presentation">
          <EditServiceZoneSheet zone={editingZone} onClose={() => setEditingZone(null)} />
        </div>
      ) : null}
    </div>
  );
}
