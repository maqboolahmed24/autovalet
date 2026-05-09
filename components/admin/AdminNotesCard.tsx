"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";

type AdminNotesCardProps = {
  bookingId: string;
  notes: AdminBookingDetailData["notes"];
};

type NotesResponse =
  | {
      success: true;
      data: {
        bookingId: string;
        notes: string;
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

export function AdminNotesCard({ bookingId, notes }: AdminNotesCardProps) {
  const router = useRouter();
  const [value, setValue] = useState(notes.adminNotes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: value }),
      });
      const payload = (await response.json()) as NotesResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Admin notes could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Admin notes saved.");
      router.refresh();
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Admin notes could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="info-card admin-notes-card" aria-labelledby="admin-notes-title">
      <div className="info-card__header">
        <div>
          <p className="eyebrow">Internal</p>
          <h2 id="admin-notes-title">Admin notes</h2>
        </div>
      </div>
      <p>{notes.adminNotes || "No admin notes yet."}</p>
      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Private note</span>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Add internal context for this booking."
          />
        </label>
        <button className="admin-button admin-button--secondary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save note"}
        </button>
      </form>
      {message ? (
        <p className={`admin-submit-message admin-submit-message--${tone}`} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
