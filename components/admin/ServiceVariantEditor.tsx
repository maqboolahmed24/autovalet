"use client";

import { useState, type FormEvent } from "react";
import type { AdminServicePackage } from "../../lib/admin/services-pricing";

type ServiceVariantEditorProps = {
  servicePackage: AdminServicePackage;
  onClose: () => void;
};

type ServicePricingResponse =
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

type EditableVariant = {
  vehicleSize: AdminServicePackage["variants"][number]["vehicleSize"];
  vehicleSizeLabel: string;
  pricePounds: string;
  durationMinutes: string;
};

export function ServiceVariantEditor({ servicePackage, onClose }: ServiceVariantEditorProps) {
  const [variants, setVariants] = useState<EditableVariant[]>(
    servicePackage.variants.map((variant) => ({
      vehicleSize: variant.vehicleSize,
      vehicleSizeLabel: variant.vehicleSizeLabel,
      pricePounds: minorToPounds(variant.priceMinor),
      durationMinutes: String(variant.durationMinutes),
    })),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  function updateVariant(index: number, patch: Partial<EditableVariant>) {
    setVariants((current) => current.map((variant, currentIndex) => currentIndex === index ? { ...variant, ...patch } : variant));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    const parsedVariants = variants.map((variant) => ({
      vehicleSize: variant.vehicleSize,
      priceMinor: poundsToMinor(variant.pricePounds),
      durationMinutes: readWholeMinutes(variant.durationMinutes),
    }));

    if (parsedVariants.some((variant) => variant.priceMinor === null || variant.durationMinutes === null)) {
      setIsSubmitting(false);
      setTone("warning");
      setMessage("Enter valid prices and whole-minute durations.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/services-pricing/${servicePackage.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: servicePackage.active,
          variants: parsedVariants,
        }),
      });
      const payload = (await response.json()) as ServicePricingResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Package pricing could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Package pricing saved.");
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Package pricing could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="service-variant-editor-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Package pricing</p>
        <h2 id="service-variant-editor-title">{servicePackage.label}</h2>
        <p>Set the estimate and service duration for each vehicle size.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <div className="variant-editor-list">
          {variants.map((variant, index) => (
            <div className="variant-editor-row" key={variant.vehicleSize}>
              <strong>{variant.vehicleSizeLabel}</strong>
              <div className="admin-field-grid">
                <label className="admin-field">
                  <span>Price</span>
                  <input
                    inputMode="decimal"
                    value={variant.pricePounds}
                    onChange={(event) => updateVariant(index, { pricePounds: event.target.value })}
                  />
                </label>
                <label className="admin-field">
                  <span>Duration minutes</span>
                  <input
                    inputMode="numeric"
                    value={variant.durationMinutes}
                    onChange={(event) => updateVariant(index, { durationMinutes: event.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <p className="admin-inline-note">Existing booking estimates should not be silently rewritten after a price change.</p>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save package"}
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

function minorToPounds(amountMinor: number) {
  return String(amountMinor / 100);
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

  return Number.isSafeInteger(numberValue) && numberValue > 0 ? numberValue : null;
}
