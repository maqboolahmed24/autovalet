"use client";

import { useState } from "react";
import type { AdminGalleryData, AdminGalleryItem } from "../../lib/admin/gallery";
import { AdminPageHeader } from "./AdminPageHeader";
import { GalleryConsentNotice } from "./GalleryConsentNotice";
import { GalleryItemEditorSheet } from "./GalleryItemEditorSheet";
import { GalleryItemGrid } from "./GalleryItemGrid";
import { GalleryUploadCard } from "./GalleryUploadCard";

type AdminGalleryPageProps = {
  data: AdminGalleryData;
};

export function AdminGalleryPage({ data }: AdminGalleryPageProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminGalleryItem | null>(null);

  return (
    <div className="admin-page gallery-admin-page">
      <AdminPageHeader
        eyebrow="Gallery"
        title="Gallery management"
        description="Upload approved before/after images and choose what appears on the public website."
        actions={
          <button className="admin-button admin-button--primary" type="button" onClick={() => setIsAdding(true)}>
            Add gallery item
          </button>
        }
      />

      <GalleryConsentNotice />

      {data.isMockData ? (
        <section className="settings-notice" aria-label="Gallery persistence status">
          <strong>Current gallery defaults</strong>
          <p>
            These items are placeholder admin data until database persistence and media storage are
            connected. Save and upload actions stay guarded.
          </p>
        </section>
      ) : null}

      <GalleryUploadCard onAdd={() => setIsAdding(true)} />

      <GalleryItemGrid items={data.items} onEdit={setEditingItem} />

      {isAdding || editingItem ? (
        <div className="admin-sheet-backdrop" role="presentation">
          <GalleryItemEditorSheet item={editingItem ?? undefined} onClose={() => {
            setIsAdding(false);
            setEditingItem(null);
          }} />
        </div>
      ) : null}
    </div>
  );
}
