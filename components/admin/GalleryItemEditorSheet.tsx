"use client";

import { useState, type FormEvent } from "react";
import type {
  AdminGalleryImageMode,
  AdminGalleryItem,
  AdminGalleryItemInput,
} from "../../lib/admin/gallery";
import { BeforeAfterUploadFields } from "./BeforeAfterUploadFields";
import { GalleryFeaturedToggle } from "./GalleryFeaturedToggle";

type GalleryItemEditorSheetProps = {
  item?: AdminGalleryItem;
  onClose: () => void;
};

type GalleryMutationResponse =
  | {
      success: true;
      data: {
        galleryItemId: string;
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

export function GalleryItemEditorSheet({ item, onClose }: GalleryItemEditorSheetProps) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [serviceType, setServiceType] = useState(item?.serviceType ?? "");
  const [vehicleType, setVehicleType] = useState(item?.vehicleType ?? "");
  const [imageMode, setImageMode] = useState<AdminGalleryImageMode>(item?.imageMode ?? "before_after");
  const [beforeImageUrl, setBeforeImageUrl] = useState(item?.beforeImageUrl ?? "");
  const [afterImageUrl, setAfterImageUrl] = useState(item?.afterImageUrl ?? "");
  const [singleImageUrl, setSingleImageUrl] = useState(item?.singleImageUrl ?? "");
  const [altText, setAltText] = useState(item?.altText ?? "");
  const [hasMarketingConsent, setHasMarketingConsent] = useState(item?.hasMarketingConsent ?? false);
  const [registrationPlateChecked, setRegistrationPlateChecked] = useState(item?.registrationPlateChecked ?? false);
  const [isFeatured, setIsFeatured] = useState(item?.isFeatured ?? false);
  const [active, setActive] = useState(item?.active ?? false);
  const [displayOrder, setDisplayOrder] = useState(item?.displayOrder?.toString() ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("warning");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setTone("warning");

    const input = buildInput();

    if (!input.title.trim()) {
      setMessage("Add a title before saving.");
      return;
    }

    if (displayOrder.trim() && !Number.isInteger(Number(displayOrder))) {
      setMessage("Display order must be a whole number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(item ? `/api/admin/gallery/${encodeURIComponent(item.id)}` : "/api/admin/gallery", {
        method: item ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as GalleryMutationResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Gallery item could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Gallery item saved.");
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Gallery item could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function buildInput(): AdminGalleryItemInput {
    const parsedDisplayOrder = displayOrder.trim() ? Number(displayOrder) : undefined;
    const input: AdminGalleryItemInput = {
      title,
      description,
      serviceType,
      vehicleType,
      beforeImageUrl: imageMode === "before_after" ? beforeImageUrl : "",
      afterImageUrl: imageMode === "before_after" ? afterImageUrl : "",
      singleImageUrl: imageMode === "single" ? singleImageUrl : "",
      altText,
      hasMarketingConsent,
      registrationPlateChecked,
      isFeatured,
      active,
    };

    if (typeof parsedDisplayOrder === "number" && Number.isInteger(parsedDisplayOrder)) {
      input.displayOrder = parsedDisplayOrder;
    }

    return input;
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="gallery-editor-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Gallery</p>
        <h2 id="gallery-editor-title">{item ? "Edit gallery item" : "Add gallery item"}</h2>
        <p>Only publish items after consent and personal-details checks are complete.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <div className="admin-field-grid">
          <label className="admin-field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Deep clean result" />
          </label>

          <label className="admin-field">
            <span>Service type</span>
            <input value={serviceType} onChange={(event) => setServiceType(event.target.value)} placeholder="Deep Clean" />
          </label>

          <label className="admin-field">
            <span>Vehicle type</span>
            <input value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} placeholder="Large / 4x4" />
          </label>

          <label className="admin-field">
            <span>Display order</span>
            <input
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              inputMode="numeric"
              placeholder="1"
            />
          </label>
        </div>

        <label className="admin-field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short admin/public description for this work."
          />
        </label>

        <div>
          <span className="admin-choice-label">Image mode</span>
          <div className="admin-choice-grid gallery-mode-grid">
            {imageModeOptions.map((option) => (
              <button
                className={`admin-choice-card${imageMode === option.value ? " is-selected" : ""}`}
                key={option.value}
                type="button"
                onClick={() => setImageMode(option.value)}
              >
                <strong>{option.label}</strong>
                <small>{option.text}</small>
              </button>
            ))}
          </div>
        </div>

        <BeforeAfterUploadFields
          imageMode={imageMode}
          beforeImageUrl={beforeImageUrl}
          afterImageUrl={afterImageUrl}
          singleImageUrl={singleImageUrl}
          onBeforeImageUrlChange={setBeforeImageUrl}
          onAfterImageUrlChange={setAfterImageUrl}
          onSingleImageUrlChange={setSingleImageUrl}
        />

        <label className="admin-field">
          <span>Alt text</span>
          <input
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            placeholder="Interior deep clean before and after result"
          />
        </label>

        <div className="gallery-safety-grid">
          <label className="gallery-checkbox-card">
            <input
              type="checkbox"
              checked={hasMarketingConsent}
              onChange={(event) => setHasMarketingConsent(event.target.checked)}
            />
            <span>
              <strong>Marketing/photo consent recorded</strong>
              <small>Only publish images when the customer has given permission.</small>
            </span>
          </label>

          <label className="gallery-checkbox-card">
            <input
              type="checkbox"
              checked={registrationPlateChecked}
              onChange={(event) => setRegistrationPlateChecked(event.target.checked)}
            />
            <span>
              <strong>Registration plate and personal details checked</strong>
              <small>Confirm plates, house numbers and personal details are not visible.</small>
            </span>
          </label>
        </div>

        <GalleryFeaturedToggle
          active={active}
          isFeatured={isFeatured}
          onActiveChange={setActive}
          onFeaturedChange={setIsFeatured}
        />

        <p className="admin-inline-note">
          Active public items require an image, consent and a completed personal-details check.
          Uploads are disabled until a media storage provider is configured.
        </p>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save gallery item"}
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

const imageModeOptions: {
  value: AdminGalleryImageMode;
  label: string;
  text: string;
}[] = [
  {
    value: "before_after",
    label: "Before/after pair",
    text: "Use when both images are available.",
  },
  {
    value: "single",
    label: "Single finished image",
    text: "Use for one safe finished photo.",
  },
  {
    value: "placeholder",
    label: "Placeholder only",
    text: "Keep hidden until images are ready.",
  },
];
