"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddonId, BookingDraft, PackageId, VehicleSize } from "../../../lib/booking/types";
import type { BookingStepProps } from "../BookingStepper";

type DateOption = {
  value: string;
  label: string;
  day: string;
  month: string;
};

type AvailableSlot = {
  start: string;
  label: string;
  serviceEndsAt: string;
  blockedUntil: string;
  serviceDurationMinutes: number;
  travelBufferMinutes: number;
};

type AvailableSlotsResponse =
  | {
      success: true;
      data: {
        date: string;
        timezone: string;
        serviceDurationMinutes: number;
        travelBufferMinutes: number;
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

type SlotStepSelectorProps = {
  packageId: PackageId | "";
  primaryVehicleSize: VehicleSize | "";
  selectedAddonIds: AddonId[];
  vehicleCount: number;
  selectedDate: string;
  selectedSlotStart: string;
  onChange: (patch: Partial<Pick<BookingDraft, "selectedDate" | "selectedSlotStart">>) => void;
};

const requestDateWindowDays = 28;

function getDatePart(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function createDateOptions() {
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

  for (let index = 1; index <= requestDateWindowDays; index += 1) {
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

function getSlotFetchError(payload: AvailableSlotsResponse, fallbackMessage: string) {
  return payload.success ? fallbackMessage : payload.error.message;
}

function SlotLoadingState() {
  return (
    <div className="booking-slot-loading" role="status" aria-live="polite">
      <span>Checking available request times...</span>
      <div className="loading-skeleton" aria-hidden="true" />
      <div className="loading-skeleton" aria-hidden="true" />
      <div className="loading-skeleton" aria-hidden="true" />
    </div>
  );
}

function SlotStepSelector({
  packageId,
  primaryVehicleSize,
  selectedAddonIds,
  vehicleCount,
  selectedDate,
  selectedSlotStart,
  onChange,
}: SlotStepSelectorProps) {
  const dateOptions = useMemo(() => createDateOptions(), []);
  const addonSignature = useMemo(() => selectedAddonIds.join("|"), [selectedAddonIds]);
  const canLoadSlots = Boolean(packageId && primaryVehicleSize && selectedDate);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!selectedDate || !packageId || !primaryVehicleSize) {
      setSlots([]);
      setIsLoading(false);
      setErrorMessage("");
      return;
    }

    const abortController = new AbortController();

    async function loadSlots() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch("/api/available-slots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate,
            packageId,
            vehicles: [
              {
                size: primaryVehicleSize,
                addons: selectedAddonIds,
              },
            ],
            vehicleCount,
          }),
          cache: "no-store",
          signal: abortController.signal,
        });
        const payload = (await response.json()) as AvailableSlotsResponse;

        if (!response.ok || !payload.success) {
          throw new Error(getSlotFetchError(payload, "Available request times could not be loaded."));
        }

        setSlots(payload.data.slots);

        if (
          selectedSlotStart &&
          !payload.data.slots.some((slot) => slot.label === selectedSlotStart)
        ) {
          onChange({ selectedSlotStart: "" });
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setSlots([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Available request times could not be loaded. Please try again.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadSlots();

    return () => abortController.abort();
  }, [
    addonSignature,
    onChange,
    packageId,
    primaryVehicleSize,
    selectedAddonIds,
    selectedDate,
    selectedSlotStart,
    vehicleCount,
  ]);

  return (
    <div className="booking-step-content">
      <div className="booking-date-strip" role="group" aria-label="Available request dates for the next 4 weeks">
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
        {!selectedDate ? (
          <div className="empty-state">
            <h2>Select a date first.</h2>
            <p>Available requested times will appear here.</p>
          </div>
        ) : !canLoadSlots ? (
          <div className="empty-state">
            <h2>Complete service and vehicle details first.</h2>
            <p>Requested times depend on the selected package, vehicle size and extras.</p>
          </div>
        ) : isLoading ? (
          <SlotLoadingState />
        ) : errorMessage ? (
          <div className="error-state" role="alert">
            <h2>Request times could not be loaded.</h2>
            <p>{errorMessage}</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="empty-state">
            <h2>No request times are available for this date.</h2>
            <p>Please choose another day.</p>
          </div>
        ) : (
          slots.map((slot) => {
            const isSelected = selectedSlotStart === slot.label;

            return (
              <button
                className={`selectable-card booking-slot-card${isSelected ? " is-selected" : ""}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ selectedSlotStart: slot.label })}
                key={slot.start}
              >
                <strong>{slot.label}</strong>
                <span>Requested time</span>
                <p>
                  Service estimate: {slot.serviceDurationMinutes} mins. Internal travel buffer is
                  protected after the visit.
                </p>
              </button>
            );
          })
        )}
      </div>

      <p className="booking-step-note">
        Your selected time is a request. AUTO VALET will confirm after review.
      </p>
    </div>
  );
}

export function SlotStep({ draft, updateDraft }: BookingStepProps) {
  const primaryVehicle = draft.vehicles[0];
  const updateSlotSelection = useCallback(
    (patch: Partial<Pick<BookingDraft, "selectedDate" | "selectedSlotStart">>) => {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        ...patch,
      }));
    },
    [updateDraft],
  );

  return (
    <SlotStepSelector
      packageId={draft.packageId}
      primaryVehicleSize={primaryVehicle?.size ?? ""}
      selectedAddonIds={primaryVehicle?.addons ?? []}
      vehicleCount={draft.vehicleCount}
      selectedDate={draft.selectedDate}
      selectedSlotStart={draft.selectedSlotStart}
      onChange={updateSlotSelection}
    />
  );
}
