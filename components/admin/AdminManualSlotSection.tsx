import type { CreateManualBookingInput } from "../../lib/admin/manual-booking";

type AdminManualSlotSectionProps = {
  value: CreateManualBookingInput["schedule"];
  durationLabel: string;
  bufferLabel: string;
  slotCheckMessage: string;
  isCheckingSlot: boolean;
  onChange: (patch: Partial<CreateManualBookingInput["schedule"]>) => void;
  onCheckSlot: () => void;
};

export function AdminManualSlotSection({
  value,
  durationLabel,
  bufferLabel,
  slotCheckMessage,
  isCheckingSlot,
  onChange,
  onCheckSlot,
}: AdminManualSlotSectionProps) {
  return (
    <section className="admin-form-card" aria-labelledby="manual-slot-title">
      <div className="admin-form-card__heading">
        <span>Date and time</span>
        <h2 id="manual-slot-title">When should this block the calendar?</h2>
      </div>

      <div className="admin-field-grid">
        <label className="admin-field">
          <span>Date</span>
          <input
            type="date"
            value={value.date}
            onChange={(event) => onChange({ date: event.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>Start time</span>
          <input
            type="time"
            step={900}
            value={value.startTime}
            onChange={(event) => onChange({ startTime: event.target.value })}
          />
        </label>
      </div>

      <div className="admin-metric-grid">
        <div>
          <span>Service duration</span>
          <strong>{durationLabel}</strong>
        </div>
        <div>
          <span>Blocked until</span>
          <strong>{bufferLabel}</strong>
        </div>
      </div>

      <button className="admin-button admin-button--secondary" type="button" onClick={onCheckSlot} disabled={isCheckingSlot}>
        {isCheckingSlot ? "Checking..." : "Check conflict"}
      </button>

      {slotCheckMessage ? <p className="admin-inline-note">{slotCheckMessage}</p> : null}
    </section>
  );
}
