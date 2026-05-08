"use client";

import type { AdminCustomerNote } from "../../lib/admin/customers";

type CustomerNotesCardProps = {
  notes: AdminCustomerNote[];
  onAddNote: () => void;
};

export function CustomerNotesCard({ notes, onAddNote }: CustomerNotesCardProps) {
  return (
    <section className="customer-section-card customer-notes-card" aria-labelledby="customer-notes-title">
      <div className="customer-section-card__header">
        <div>
          <p className="eyebrow">Private notes</p>
          <h2 id="customer-notes-title">Admin notes</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onAddNote}>
          Add note
        </button>
      </div>

      <p className="admin-inline-note">Private admin notes are not visible to the customer.</p>

      {notes.length > 0 ? (
        <div className="customer-notes-list">
          {notes.map((note) => (
            <article className="customer-note" key={note.id}>
              <p>{note.note}</p>
              <small>
                {note.createdBy} · {note.updatedAtLabel ? `Updated ${note.updatedAtLabel}` : note.createdAtLabel}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <p className="customer-section-card__empty">No private notes yet.</p>
      )}
    </section>
  );
}
