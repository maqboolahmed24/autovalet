"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { AdminBookingSummary } from "./AdminBookingSummary";
import { AdminManualCustomerSection } from "./AdminManualCustomerSection";
import { AdminManualLocationSection } from "./AdminManualLocationSection";
import { AdminManualPaymentSection } from "./AdminManualPaymentSection";
import { AdminManualServiceSection } from "./AdminManualServiceSection";
import { AdminManualSlotSection } from "./AdminManualSlotSection";
import { AdminManualVehicleSection } from "./AdminManualVehicleSection";
import type { CreateManualBookingInput, ManualBookingStatus } from "../../lib/admin/manual-booking";
import { buildManualBookingDraft } from "../../lib/admin/manual-booking";
import { calculateBookingDuration, formatMoneyGBP } from "../../lib/pricing";
import { addMinutesToTime } from "../../lib/availability/working-hours";
import { normalizePostcode, validateServiceZone } from "../../lib/zones";

type AdminManualBookingResponse =
  | {
      success: true;
      data: {
        bookingReference: string;
        status: string;
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

type AvailableSlotsResponse =
  | {
      success: true;
      data: {
        slots: {
          label: string;
        }[];
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

const initialManualBooking: CreateManualBookingInput = {
  source: "phone",
  status: "pending_admin_review",
  customer: {
    fullName: "",
    phone: "",
    email: "",
  },
  vehicle: {
    make: "",
    model: "",
    size: "medium",
  },
  service: {
    packageId: "maintenance",
    addons: [],
    vehicleCount: 1,
  },
  location: {
    postcode: "",
    fullAddress: "",
    parkingAvailable: "unknown",
    parkingNotes: "",
    accessNotes: "",
  },
  schedule: {
    date: "",
    startTime: "09:00",
  },
  payment: {
    depositStatus: "unpaid",
    depositPaidMinor: 0,
    paymentMethod: "bank_transfer",
    notes: "",
  },
};

function getZoneNote(booking: CreateManualBookingInput) {
  const postcode = normalizePostcode(booking.location.postcode);

  if (!postcode) {
    return "Enter a postcode to preview the service-zone result.";
  }

  try {
    const result = validateServiceZone({
      postcode,
      vehicleCount: booking.service.vehicleCount,
    });

    return result.message;
  } catch (error) {
    return error instanceof Error ? error.message : "Service zone could not be checked.";
  }
}

function getDurationLabels(booking: CreateManualBookingInput) {
  const duration = calculateBookingDuration(buildManualBookingDraft(booking));

  if (!booking.schedule.startTime || duration.serviceDurationMinutes <= 0) {
    return {
      durationLabel: "Add service details",
      bufferLabel: "Set time first",
    };
  }

  try {
    const serviceEnd = addMinutesToTime(booking.schedule.startTime, duration.serviceDurationMinutes);
    const blockedUntil = addMinutesToTime(booking.schedule.startTime, duration.blockedDurationMinutes);

    return {
      durationLabel: `${duration.serviceDurationMinutes} mins, service ends ${serviceEnd}`,
      bufferLabel: `${blockedUntil} including travel buffer`,
    };
  } catch {
    return {
      durationLabel: `${duration.serviceDurationMinutes} mins`,
      bufferLabel: `${duration.blockedDurationMinutes} mins total block`,
    };
  }
}

export function AdminManualBookingForm() {
  const [booking, setBooking] = useState<CreateManualBookingInput>(initialManualBooking);
  const [slotCheckMessage, setSlotCheckMessage] = useState("");
  const [isCheckingSlot, setIsCheckingSlot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitTone, setSubmitTone] = useState<"neutral" | "success" | "warning">("neutral");
  const zoneNote = useMemo(() => getZoneNote(booking), [booking.location.postcode, booking.service.vehicleCount]);
  const durationLabels = useMemo(() => getDurationLabels(booking), [booking]);

  function updateBooking(patch: Partial<CreateManualBookingInput>) {
    setSubmitMessage("");
    setSlotCheckMessage("");
    setBooking((previous) => ({
      ...previous,
      ...patch,
    }));
  }

  async function handleCheckSlot() {
    if (!booking.schedule.date || !booking.schedule.startTime) {
      setSlotCheckMessage("Choose a date and start time before checking conflict.");
      return;
    }

    setIsCheckingSlot(true);
    setSlotCheckMessage("");

    try {
      const response = await fetch("/api/available-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: booking.schedule.date,
          packageId: booking.service.packageId,
          vehicles: [
            {
              size: booking.vehicle.size,
              addons: booking.service.addons,
            },
          ],
          vehicleCount: booking.service.vehicleCount,
        }),
      });
      const payload = (await response.json()) as AvailableSlotsResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Slot check failed." : payload.error.message);
      }

      const selectedSlotIsAvailable = payload.data.slots.some((slot) => slot.label === booking.schedule.startTime);

      setSlotCheckMessage(
        selectedSlotIsAvailable
          ? "No placeholder conflict found. Saving will still re-check server-side before any database write."
          : "This time is not available in the current working-hours preview.",
      );
    } catch (error) {
      setSlotCheckMessage(error instanceof Error ? error.message : "Slot check could not be completed.");
    } finally {
      setIsCheckingSlot(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setSubmitTone("neutral");

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
      });
      const payload = (await response.json()) as AdminManualBookingResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Manual booking could not be created." : payload.error.message);
      }

      setSubmitTone("success");
      setSubmitMessage(`Booking ${payload.data.bookingReference} created.`);
    } catch (error) {
      setSubmitTone("warning");
      setSubmitMessage(error instanceof Error ? error.message : "Manual booking could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-manual-booking" aria-label="Create a manual booking">
      <div className="admin-page-intro">
        <p>
          Use this for phone, WhatsApp, Instagram or referral bookings. Approved and pending manual
          bookings will block public availability when persistence is connected.
        </p>
      </div>

      <div className="admin-manual-booking__notice" role="note">
        <span className="status-badge status-badge--warning">Admin only</span>
        <p>
          Manual bookings are added by the admin. They still need pricing, duration, zone and conflict
          checks before saving.
        </p>
      </div>

      <form className="admin-manual-booking__layout" onSubmit={handleSubmit}>
        <div className="admin-manual-booking__main">
          <AdminManualCustomerSection
            value={booking.customer}
            onChange={(patch) => updateBooking({ customer: { ...booking.customer, ...patch } })}
          />
          <AdminManualVehicleSection
            value={booking.vehicle}
            onChange={(patch) => updateBooking({ vehicle: { ...booking.vehicle, ...patch } })}
          />
          <AdminManualServiceSection
            value={booking.service}
            onChange={(patch) => updateBooking({ service: { ...booking.service, ...patch } })}
          />
          <AdminManualLocationSection
            value={booking.location}
            zoneNote={zoneNote}
            onChange={(patch) => updateBooking({ location: { ...booking.location, ...patch } })}
          />
          <AdminManualSlotSection
            value={booking.schedule}
            durationLabel={durationLabels.durationLabel}
            bufferLabel={durationLabels.bufferLabel}
            slotCheckMessage={slotCheckMessage}
            isCheckingSlot={isCheckingSlot}
            onChange={(patch) => updateBooking({ schedule: { ...booking.schedule, ...patch } })}
            onCheckSlot={handleCheckSlot}
          />
          <AdminManualPaymentSection
            source={booking.source}
            status={booking.status}
            value={booking.payment}
            onSourceChange={(source) => updateBooking({ source })}
            onStatusChange={(status: ManualBookingStatus) => updateBooking({ status })}
            onPaymentChange={(patch) => updateBooking({ payment: { ...booking.payment, ...patch } })}
          />

          <div className="booking-action-bar admin-manual-booking__actions">
            <button className="admin-button admin-button--secondary" type="button" disabled title="Draft saving comes later.">
              Draft later
            </button>
            <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Checking..."
                : booking.status === "approved"
                  ? "Create Approved Booking"
                  : "Create Pending Request"}
            </button>
          </div>

          {submitMessage ? (
            <p className={`admin-submit-message admin-submit-message--${submitTone}`} role="status">
              {submitMessage}
            </p>
          ) : null}
        </div>

        <AdminBookingSummary booking={booking} />
      </form>
    </section>
  );
}
