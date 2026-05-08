import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";

type AdminNotesCardProps = {
  notes: AdminBookingDetailData["notes"];
};

export function AdminNotesCard({ notes }: AdminNotesCardProps) {
  return (
    <section className="info-card admin-notes-card" aria-labelledby="admin-notes-title">
      <div className="info-card__header">
        <div>
          <p className="eyebrow">Internal</p>
          <h2 id="admin-notes-title">Admin notes</h2>
        </div>
      </div>
      <p>{notes.adminNotes || "No admin notes yet."}</p>
      <label className="admin-field">
        <span>Add note</span>
        <textarea disabled placeholder="Admin note saving will be connected with the booking detail workflow." />
      </label>
      <button className="admin-button admin-button--secondary" type="button" disabled>
        Save note later
      </button>
    </section>
  );
}
