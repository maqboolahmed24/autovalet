"use client";

import { useState } from "react";
import type { AdminGalleryImageMode } from "../../lib/admin/gallery";
import type { MediaUploadTarget } from "../../lib/media/types";

type BeforeAfterUploadFieldsProps = {
  imageMode: AdminGalleryImageMode;
  beforeImageUrl: string;
  afterImageUrl: string;
  singleImageUrl: string;
  onBeforeImageUrlChange: (value: string) => void;
  onAfterImageUrlChange: (value: string) => void;
  onSingleImageUrlChange: (value: string) => void;
};

type UploadUrlResponse =
  | {
      success: true;
      data: {
        uploadUrl: string;
        publicUrl: string;
        fields?: Record<string, string>;
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

export function BeforeAfterUploadFields({
  imageMode,
  beforeImageUrl,
  afterImageUrl,
  singleImageUrl,
  onBeforeImageUrlChange,
  onAfterImageUrlChange,
  onSingleImageUrlChange,
}: BeforeAfterUploadFieldsProps) {
  const [uploadMessage, setUploadMessage] = useState("");
  const [isRequestingTarget, setIsRequestingTarget] = useState<MediaUploadTarget | null>(null);

  async function requestUploadUrl(target: MediaUploadTarget) {
    setUploadMessage("");
    setIsRequestingTarget(target);

    try {
      const response = await fetch("/api/admin/gallery/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: `${target}-${Date.now()}.jpg`,
          contentType: "image/jpeg",
          target,
        }),
      });
      const payload = (await response.json()) as UploadUrlResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Upload URL could not be created." : payload.error.message);
      }

      setUploadMessage("Upload URL created. Media upload wiring can now use the returned URL.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Upload URL could not be created.");
    } finally {
      setIsRequestingTarget(null);
    }
  }

  if (imageMode === "placeholder") {
    return (
      <div className="gallery-upload-fields">
        <p className="admin-inline-note">
          Placeholder items stay hidden until real before/after or finished images are added.
        </p>
      </div>
    );
  }

  return (
    <div className="gallery-upload-fields">
      {imageMode === "before_after" ? (
        <>
          <label className="admin-field">
            <span>Before image URL</span>
            <input
              value={beforeImageUrl}
              onChange={(event) => onBeforeImageUrlChange(event.target.value)}
              placeholder="https://..."
            />
          </label>
          <button
            className="admin-button admin-button--secondary"
            type="button"
            disabled={isRequestingTarget === "gallery_before"}
            onClick={() => requestUploadUrl("gallery_before")}
          >
            {isRequestingTarget === "gallery_before" ? "Checking storage..." : "Request before upload URL"}
          </button>

          <label className="admin-field">
            <span>After image URL</span>
            <input
              value={afterImageUrl}
              onChange={(event) => onAfterImageUrlChange(event.target.value)}
              placeholder="https://..."
            />
          </label>
          <button
            className="admin-button admin-button--secondary"
            type="button"
            disabled={isRequestingTarget === "gallery_after"}
            onClick={() => requestUploadUrl("gallery_after")}
          >
            {isRequestingTarget === "gallery_after" ? "Checking storage..." : "Request after upload URL"}
          </button>
        </>
      ) : (
        <>
          <label className="admin-field">
            <span>Finished image URL</span>
            <input
              value={singleImageUrl}
              onChange={(event) => onSingleImageUrlChange(event.target.value)}
              placeholder="https://..."
            />
          </label>
          <button
            className="admin-button admin-button--secondary"
            type="button"
            disabled={isRequestingTarget === "gallery_single"}
            onClick={() => requestUploadUrl("gallery_single")}
          >
            {isRequestingTarget === "gallery_single" ? "Checking storage..." : "Request finished image upload URL"}
          </button>
        </>
      )}

      {uploadMessage ? (
        <p className="admin-submit-message admin-submit-message--warning" role="status">
          {uploadMessage}
        </p>
      ) : null}
    </div>
  );
}
