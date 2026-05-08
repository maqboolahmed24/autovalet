"use client";

import { useState, type FormEvent } from "react";
import {
  adminServiceZoneTypes,
  serviceZoneTypeLabels,
  type AdminServiceZoneItem,
  type AdminServiceZoneType,
} from "../../lib/admin/service-zones";

type EditServiceZoneSheetProps = {
  zone: AdminServiceZoneItem;
  onClose: () => void;
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

export function EditServiceZoneSheet({ zone, onClose }: EditServiceZoneSheetProps) {
  const [zoneType, setZoneType] = useState<AdminServiceZoneType>(zone.zoneType);
  const [value, setValue] = useState(zone.value);
  const [notes, setNotes] = useState(zone.notes ?? "");
  const [active, setActive] = useState(zone.active);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");
  const canSubmit = Boolean(value.trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    try {
      const response = await fetch(`/api/admin/service-zones/${zone.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zoneType,
          value,
          notes,
          active,
        }),
      });
      const payload = (await response.json()) as ServiceZoneMutationResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Service zone could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Service zone saved.");
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Service zone could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="edit-service-zone-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Service zones</p>
        <h2 id="edit-service-zone-title">Edit service zone</h2>
        <p>Changes will affect future public service-area checks once persistence is connected.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Zone type</span>
          <select value={zoneType} onChange={(event) => setZoneType(event.target.value as AdminServiceZoneType)}>
            {adminServiceZoneTypes.map((type) => (
              <option key={type} value={type}>
                {serviceZoneTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Value</span>
          <input value={value} onChange={(event) => setValue(event.target.value)} />
        </label>

        <label className="admin-field">
          <span>Notes</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>

        <div>
          <span className="admin-choice-label">Status</span>
          <div className="admin-choice-grid">
            <button
              className={`admin-choice-card${active ? " is-selected" : ""}`}
              type="button"
              onClick={() => setActive(true)}
            >
              Active
            </button>
            <button
              className={`admin-choice-card${!active ? " is-selected" : ""}`}
              type="button"
              onClick={() => setActive(false)}
            >
              Inactive
            </button>
          </div>
        </div>

        <dl className="settings-inline-list">
          <div>
            <dt>Current normalized value</dt>
            <dd>{zone.normalizedValue}</dd>
          </div>
        </dl>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? "Saving..." : "Save zone"}
          </button>
        </div>
      </form>

      {message ? (
        <p className={`admin-submit-message admin-submit-message--${tone}`} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
