"use client";

import { useState } from "react";
import type { AdminServiceZoneItem } from "../../lib/admin/service-zones";

type ServiceZoneCardProps = {
  zone: AdminServiceZoneItem;
  onEdit: () => void;
};

type ServiceZoneMutationResponse =
  | {
      success: true;
      data: {
        zoneId: string;
        normalizedValue: string;
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

export function ServiceZoneCard({ zone, onEdit }: ServiceZoneCardProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDisable() {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/service-zones/${zone.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zoneType: zone.zoneType,
          value: zone.value,
          notes: zone.notes ?? "",
          active: false,
        }),
      });
      const payload = (await response.json()) as ServiceZoneMutationResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Zone could not be disabled." : payload.error.message);
      }

      setMessage("Zone disabled.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Zone could not be disabled.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="service-zone-card">
      <div>
        <span className={`settings-badge${zone.active ? " settings-badge--active" : " settings-badge--muted"}`}>
          {zone.active ? "Active" : "Inactive"}
        </span>
        <strong>{zone.value}</strong>
        <small>{zone.zoneTypeLabel}</small>
      </div>

      {zone.notes ? <p>{zone.notes}</p> : null}

      <dl className="settings-inline-list">
        <div>
          <dt>Normalized</dt>
          <dd>{zone.normalizedValue}</dd>
        </div>
      </dl>

      <div className="settings-card-actions">
        <button className="ghost-button" type="button" onClick={onEdit}>
          Edit
        </button>
        <button className="ghost-button" type="button" disabled={isSubmitting || !zone.active} onClick={handleDisable}>
          {isSubmitting ? "Checking..." : "Disable"}
        </button>
      </div>

      {message ? (
        <p className="admin-submit-message admin-submit-message--warning" role="status">
          {message}
        </p>
      ) : null}
    </article>
  );
}
