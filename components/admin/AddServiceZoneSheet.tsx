"use client";

import { useState, type FormEvent } from "react";
import {
  adminServiceZoneTypes,
  serviceZoneTypeLabels,
  type AdminServiceZoneType,
} from "../../lib/admin/service-zones";

type AddServiceZoneSheetProps = {
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

export function AddServiceZoneSheet({ onClose }: AddServiceZoneSheetProps) {
  const [zoneType, setZoneType] = useState<AdminServiceZoneType>("district");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
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
      const response = await fetch("/api/admin/service-zones", {
        method: "POST",
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
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="add-service-zone-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Service zones</p>
        <h2 id="add-service-zone-title">Add service zone</h2>
        <p>Add a postcode, outward code, district or region for customer service-area checks.</p>
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
          <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="e.g. CR0 or Croydon" />
        </label>

        <label className="admin-field">
          <span>Notes</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Coverage note for admin reference" />
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

        <p className="admin-inline-note">Duplicate active zones must be blocked before these settings go live.</p>

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
