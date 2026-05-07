import type { BookingDraft, BookingStepProps } from "../BookingStepper";

type DateOption = {
  value: string;
  label: string;
  day: string;
  month: string;
};

type AvailableSlot = {
  start: string;
  label: string;
  serviceEnd?: string;
  blockedUntil?: string;
};

type SlotStepSelectorProps = Pick<BookingDraft, "selectedDate" | "selectedSlotStart"> & {
  onChange: (patch: Partial<Pick<BookingDraft, "selectedDate" | "selectedSlotStart">>) => void;
};

const placeholderSlots: AvailableSlot[] = [
  {
    start: "09:00",
    label: "09:00",
  },
  {
    start: "11:45",
    label: "11:45",
  },
  {
    start: "14:15",
    label: "14:15",
  },
];

// TODO: Replace this placeholder source with /api/available-slots when the availability engine exists.
function getDatePart(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function createPlaceholderDates() {
  const dates: DateOption[] = [];
  const displayFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/London",
    weekday: "short",
    year: "numeric",
  });
  const valueFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/London",
    year: "numeric",
  });

  for (let index = 1; index <= 7; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() + index);

    const displayParts = displayFormatter.formatToParts(date);
    const valueParts = valueFormatter.formatToParts(date);
    const year = getDatePart(valueParts, "year");
    const monthValue = getDatePart(valueParts, "month");
    const day = getDatePart(displayParts, "day");
    const month = getDatePart(displayParts, "month");

    dates.push({
      value: `${year}-${monthValue}-${day}`,
      label: getDatePart(displayParts, "weekday"),
      day,
      month,
    });
  }

  return dates;
}

function SlotStepSelector({ selectedDate, selectedSlotStart, onChange }: SlotStepSelectorProps) {
  const dateOptions = createPlaceholderDates();

  return (
    <div className="booking-step-content">
      <div className="booking-date-strip" role="group" aria-label="Available request dates">
        {dateOptions.map((date) => {
          const isSelected = selectedDate === date.value;

          return (
            <button
              className={`booking-date-card${isSelected ? " is-selected" : ""}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange({ selectedDate: date.value, selectedSlotStart: "" })}
              key={date.value}
            >
              <span>{date.label}</span>
              <strong>{date.day}</strong>
              <small>{date.month}</small>
            </button>
          );
        })}
      </div>

      <div className="booking-slot-list" aria-label="Requested time options">
        {selectedDate ? (
          placeholderSlots.map((slot) => {
            const isSelected = selectedSlotStart === slot.start;

            return (
              <button
                className={`selectable-card booking-slot-card${isSelected ? " is-selected" : ""}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ selectedSlotStart: slot.start })}
                key={slot.start}
              >
                <strong>{slot.label}</strong>
                <span>Requested time</span>
                <p>Includes an internal travel buffer after the visit.</p>
              </button>
            );
          })
        ) : (
          <div className="empty-state">
            <h2>Select a date first.</h2>
            <p>Available requested times will appear here.</p>
          </div>
        )}
      </div>

      <p className="booking-step-note">
        Your selected time is a request. AUTO VALET will confirm after review.
      </p>

      <p className="booking-inline-note">
        Placeholder requested times are shown for now. Live availability will replace these when the slot
        engine is connected.
      </p>
    </div>
  );
}

export function SlotStep({ draft, updateDraft }: BookingStepProps) {
  const updateSlotSelection = (patch: Partial<Pick<BookingDraft, "selectedDate" | "selectedSlotStart">>) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      ...patch,
    }));
  };

  return (
    <SlotStepSelector
      selectedDate={draft.selectedDate}
      selectedSlotStart={draft.selectedSlotStart}
      onChange={updateSlotSelection}
    />
  );
}
