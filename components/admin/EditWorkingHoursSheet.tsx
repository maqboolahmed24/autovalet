"use client";

import { useState, type FormEvent } from "react";
import type { AdminAvailabilityData } from "../../lib/admin/availability";

type EditWorkingHoursSheetProps = {
  day: AdminAvailabilityData["workingHours"][number];
  onClose: () => void;
};

type WorkingHoursResponse =
  | {
      success: true;
      data: {
        weekday: number;
        active: boolean;
        startTime?: string;
        endTime?: string;
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

export function EditWorkingHoursSheet({ day, onClose }: EditWorkingHoursSheetProps) {
  const [active, setActive] = useState(day.active);
  const [startTime, setStartTime] = useState(day.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(day.endTime ?? "17:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");
  const canSubmit = !active || Boolean(startTime && endTime);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    try {
      const response = await fetch("/api/admin/availability/working-hours", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekday: day.weekday,
          active,
          startTime: active ? startTime : undefined,
          endTime: active ? endTime : undefined,
        }),
      });
      const payload = (await response.json()) as WorkingHoursResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Working hours could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Working hours saved.");
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Working hours could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="edit-working-hours-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Working hours</p>
        <h2 id="edit-working-hours-title">{day.weekdayLabel}</h2>
        <p>Set the default weekly hours used by public requested slot generation.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <div>
          <span className="admin-choice-label">Day status</span>
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
              Closed
            </button>
          </div>
        </div>

        {active ? (
          <div className="admin-field-grid">
            <label className="admin-field">
              <span>Start time</span>
              <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </label>
            <label className="admin-field">
              <span>End time</span>
              <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </label>
          </div>
        ) : (
          <p className="admin-inline-note">This weekday will be closed by default.</p>
        )}

        <p className="admin-inline-note">
          If shorter hours affect existing approved jobs, persistence must warn before saving.
        </p>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? "Saving..." : "Save working hours"}
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
