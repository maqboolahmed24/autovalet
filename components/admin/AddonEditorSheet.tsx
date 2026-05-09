"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { AdminAddonItem } from "../../lib/admin/services-pricing";

type AddonEditorSheetProps = {
  addon: AdminAddonItem;
  onClose: () => void;
};

type AddonResponse =
  | {
      success: true;
      data: {
        id: string;
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

export function AddonEditorSheet({ addon, onClose }: AddonEditorSheetProps) {
  const router = useRouter();
  const [pricePounds, setPricePounds] = useState(String(addon.priceMinor / 100));
  const [extraDurationMinutes, setExtraDurationMinutes] = useState(String(addon.extraDurationMinutes));
  const [active, setActive] = useState(addon.active);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    const priceMinor = poundsToMinor(pricePounds);
    const parsedDuration = readWholeMinutes(extraDurationMinutes);

    if (priceMinor === null || parsedDuration === null) {
      setIsSubmitting(false);
      setTone("warning");
      setMessage("Enter a valid price and whole-minute duration.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/addons/${addon.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: addon.label,
          priceMinor,
          extraDurationMinutes: parsedDuration,
          active,
        }),
      });
      const payload = (await response.json()) as AddonResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Add-on could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Add-on saved.");
      router.refresh();
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Add-on could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="addon-editor-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Add-on</p>
        <h2 id="addon-editor-title">{addon.label}</h2>
        <p>Changing add-on time affects future requested slot availability.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <div className="admin-field-grid">
          <label className="admin-field">
            <span>Price</span>
            <input inputMode="decimal" value={pricePounds} onChange={(event) => setPricePounds(event.target.value)} />
          </label>
          <label className="admin-field">
            <span>Extra duration minutes</span>
            <input
              inputMode="numeric"
              value={extraDurationMinutes}
              onChange={(event) => setExtraDurationMinutes(event.target.value)}
            />
          </label>
        </div>

        <div>
          <span className="admin-choice-label">Status</span>
          <div className="admin-choice-grid">
            <button className={`admin-choice-card${active ? " is-selected" : ""}`} type="button" onClick={() => setActive(true)}>
              Active
            </button>
            <button className={`admin-choice-card${!active ? " is-selected" : ""}`} type="button" onClick={() => setActive(false)}>
              Inactive
            </button>
          </div>
        </div>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save add-on"}
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

function poundsToMinor(value: string) {
  const normalized = value.replace(/[£,]/g, "").trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return Math.round(numberValue * 100);
}

function readWholeMinutes(value: string) {
  const normalized = value.trim();

  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const numberValue = Number(normalized);

  return Number.isSafeInteger(numberValue) && numberValue >= 0 ? numberValue : null;
}
