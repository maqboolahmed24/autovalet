"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";

type RescheduleBookingSheetProps = {
  booking: AdminBookingDetailData;
  onClose: () => void;
};

type AvailableSlot = {
  label: string;
  start: string;
  serviceEndsAt: string;
  blockedUntil: string;
};

type AvailableSlotsResponse =
  | {
      success: true;
      data: {
        slots: AvailableSlot[];
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

type RescheduleResponse =
  | {
      success: true;
      data: {
        bookingId: string;
        status: "reschedule_requested";
        proposedDate: string;
        proposedStartTime: string;
        customerActionUrl: string;
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

export function RescheduleBookingSheet({ booking, onClose }: RescheduleBookingSheetProps) {
  const router = useRouter();
  const [proposedDate, setProposedDate] = useState("");
  const [proposedStartTime, setProposedStartTime] = useState("");
  const [messageToCustomer, setMessageToCustomer] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotMessage, setSlotMessage] = useState("Choose a date to load available requested times.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  useEffect(() => {
    let isCurrent = true;

    async function loadSlots() {
      if (!proposedDate) {
        setSlots([]);
        setSlotMessage("Choose a date to load available requested times.");
        return;
      }

      setIsLoadingSlots(true);
      setSlotMessage("Loading available requested times...");
      setProposedStartTime("");

      try {
        const response = await fetch("/api/available-slots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: proposedDate,
            packageId: booking.packageId,
            vehicles: [
              {
                size: booking.vehicle.size,
                addons: booking.addons.map((addon) => addon.id),
              },
            ],
            vehicleCount: 1,
          }),
        });
        const payload = (await response.json()) as AvailableSlotsResponse;

        if (!isCurrent) return;

        if (!response.ok || !payload.success) {
          throw new Error(payload.success ? "Available times could not be loaded." : payload.error.message);
        }

        setSlots(payload.data.slots);
        setSlotMessage(payload.data.slots.length ? "Choose a requested time." : "No requested times available.");
      } catch (error) {
        if (!isCurrent) return;
        setSlots([]);
        setSlotMessage(error instanceof Error ? error.message : "Available times could not be loaded.");
      } finally {
        if (isCurrent) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      isCurrent = false;
    };
  }, [booking.addons, booking.packageId, booking.vehicle.size, proposedDate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setTone("neutral");

    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(booking.id)}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposedDate,
          proposedStartTime,
          message: messageToCustomer,
        }),
      });
      const payload = (await response.json()) as RescheduleResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Suggestion could not be sent." : payload.error.message);
      }

      setTone("success");
      setSubmitMessage("Reschedule suggestion sent.");
      router.refresh();
    } catch (error) {
      setTone("warning");
      setSubmitMessage(error instanceof Error ? error.message : "Suggestion could not be sent.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet admin-decision-sheet" aria-labelledby="reschedule-booking-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Reschedule</p>
        <h2 id="reschedule-booking-title">Suggest new time</h2>
        <p>Choose an available requested time and send a clear suggestion to the customer.</p>
      </div>

      <form className="admin-sheet-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Date</span>
          <input
            type="date"
            value={proposedDate}
            onChange={(event) => setProposedDate(event.target.value)}
          />
        </label>

        <div>
          <span className="admin-choice-label">Available times</span>
          <div className="admin-choice-grid admin-choice-grid--slots">
            {slots.map((slot) => (
              <button
                className={`admin-choice-card${proposedStartTime === slot.label ? " is-selected" : ""}`}
                key={slot.start}
                type="button"
                onClick={() => setProposedStartTime(slot.label)}
              >
                {slot.label}
              </button>
            ))}
          </div>
          <p className="admin-inline-note">{isLoadingSlots ? "Checking availability..." : slotMessage}</p>
        </div>

        <label className="admin-field">
          <span>Message to customer</span>
          <textarea
            value={messageToCustomer}
            onChange={(event) => setMessageToCustomer(event.target.value)}
            placeholder="This time is suggested because the original slot needs review."
          />
        </label>

        <div className="admin-sheet-actions">
          <button className="admin-button admin-button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button
            className="admin-button admin-button--primary"
            type="submit"
            disabled={isSubmitting || !proposedDate || !proposedStartTime}
          >
            {isSubmitting ? "Sending..." : "Send suggestion"}
          </button>
        </div>
      </form>

      {submitMessage ? (
        <p className={`admin-submit-message admin-submit-message--${tone}`} role="status">
          {submitMessage}
        </p>
      ) : null}
    </section>
  );
}
