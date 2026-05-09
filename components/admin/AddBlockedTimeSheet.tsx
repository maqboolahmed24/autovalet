"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { AddBlockedTimeInput } from "../../lib/admin/availability";
import { blockedTimeReasonSuggestions } from "../../lib/admin/availability-options";

type AddBlockedTimeSheetProps = {
  defaultType: AddBlockedTimeInput["type"];
  onClose: () => void;
};

type AddBlockedTimeResponse =
  | {
      success: true;
      data: {
        overrideId: string;
        type: AddBlockedTimeInput["type"];
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

export function AddBlockedTimeSheet({ defaultType, onClose }: AddBlockedTimeSheetProps) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [type, setType] = useState<AddBlockedTimeInput["type"]>(defaultType);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");
  const isTimeRange = type === "blocked_time";
  const canSubmit = Boolean(date && reason.trim() && (!isTimeRange || (startTime && endTime)));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setTone("neutral");

    try {
      const response = await fetch("/api/admin/availability/blocked-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          type,
          startTime: isTimeRange ? startTime : undefined,
          endTime: isTimeRange ? endTime : undefined,
          reason,
        }),
      });
      const payload = (await response.json()) as AddBlockedTimeResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Blocked time could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage("Blocked time saved.");
      router.refresh();
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Blocked time could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="add-blocked-time-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Availability</p>
        <h2 id="add-blocked-time-title">Add blocked time</h2>
        <p>Use this for days off, weather closures, maintenance or unavailable time ranges.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Date</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <div>
          <span className="admin-choice-label">Block type</span>
          <div className="admin-choice-grid">
            <button
              className={`admin-choice-card${type === "closed_day" ? " is-selected" : ""}`}
              type="button"
              onClick={() => setType("closed_day")}
            >
              Full day
            </button>
            <button
              className={`admin-choice-card${type === "blocked_time" ? " is-selected" : ""}`}
              type="button"
              onClick={() => setType("blocked_time")}
            >
              Time range
            </button>
          </div>
        </div>

        {isTimeRange ? (
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
        ) : null}

        <label className="admin-field">
          <span>Reason</span>
          <input
            list="blocked-time-reasons"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Van maintenance"
          />
          <datalist id="blocked-time-reasons">
            {blockedTimeReasonSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </label>

        <p className="admin-inline-note">
          Blocked time removes matching public requested slots. Existing approved jobs stay visible separately.
        </p>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? "Saving..." : "Save blocked time"}
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
