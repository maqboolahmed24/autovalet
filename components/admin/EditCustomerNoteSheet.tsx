"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type EditCustomerNoteSheetProps = {
  customerId: string;
  onClose: () => void;
};

type CustomerNoteResponse =
  | {
      success: true;
      data: {
        noteId: string;
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

export function EditCustomerNoteSheet({ customerId, onClose }: EditCustomerNoteSheetProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");
  const canSubmit = Boolean(note.trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });
      const payload = (await response.json()) as CustomerNoteResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Customer note could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Customer note saved.");
      router.refresh();
      onClose();
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Customer note could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="customer-note-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Private note</p>
        <h2 id="customer-note-title">Add customer note</h2>
        <p>Keep notes relevant to booking and service management.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Private note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Customer preference, access context or service detail..."
          />
        </label>

        <p className="admin-inline-note">Avoid storing unnecessary sensitive information in admin notes.</p>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? "Saving..." : "Save private note"}
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
