"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookingProgress } from "./BookingProgress";
import { BookingStepShell } from "./BookingStepShell";
import { AddonsStep } from "./steps/AddonsStep";
import { CustomerDetailsStep } from "./steps/CustomerDetailsStep";
import { LocationStep } from "./steps/LocationStep";
import { MultiVehicleStep } from "./steps/MultiVehicleStep";
import { PackageStep } from "./steps/PackageStep";
import { ReviewPaymentStep } from "./steps/ReviewPaymentStep";
import { SlotStep } from "./steps/SlotStep";
import { VehicleStep } from "./steps/VehicleStep";
import type { BookingDraft } from "../../lib/booking/types";
import { isValidDateString, isValidTimeString } from "../../lib/availability";
import { createIdempotencyKey } from "../../lib/payments/idempotency";
import { DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT } from "../../lib/zones";
import { trackAnalyticsEvent } from "../../lib/analytics/provider";

export type BookingDraftUpdate = (updater: (draft: BookingDraft) => BookingDraft) => void;

export type BookingStepProps = {
  draft: BookingDraft;
  updateDraft: BookingDraftUpdate;
  onBookingSubmit?: () => Promise<void>;
  isBookingSubmitting?: boolean;
  paymentsEnabled?: boolean;
  bookingSubmitError?: string;
};

type CreateBookingRequestResponse =
  | {
      success: true;
      data: {
        bookingReference: string;
        status: "pending_admin_review";
        statusUrl: string;
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

type BookingStepId =
  | "package"
  | "vehicle"
  | "addons"
  | "location"
  | "vehicles"
  | "time"
  | "details"
  | "review";

type BookingStepDefinition = {
  id: BookingStepId;
  label: string;
  title: string;
  description: string;
  component: ComponentType<BookingStepProps>;
};

export const initialBookingDraft: BookingDraft = {
  packageId: "",
  vehicles: [
    {
      id: "vehicle-1",
      make: "",
      model: "",
      size: "",
      addons: [],
    },
  ],
  postcode: "",
  fullAddress: "",
  parkingAvailable: "",
  accessToWaterAvailable: false,
  accessToElectricityAvailable: false,
  accessibleParkingLocation: false,
  parkingNotes: "",
  accessNotes: "",
  zoneCheckStatus: "unchecked",
  vehicleCount: 1,
  selectedDate: "",
  selectedSlotStart: "",
  customer: {
    fullName: "",
    phone: "",
    email: "",
  },
  extraNotes: "",
  marketingPhotoConsent: false,
};

const bookingSteps: BookingStepDefinition[] = [
  {
    id: "package",
    label: "Service",
    title: "What does your vehicle need?",
    description: "Choose your package first. You can add extras later.",
    component: PackageStep,
  },
  {
    id: "vehicle",
    label: "Vehicle",
    title: "Tell us about the vehicle.",
    description: "Choose the closest size and add the make and model.",
    component: VehicleStep,
  },
  {
    id: "addons",
    label: "Extras",
    title: "Add finishing extras?",
    description: "Optional focused treatments can be added to your booking request.",
    component: AddonsStep,
  },
  {
    id: "location",
    label: "Location",
    title: "Where will the vehicle be?",
    description: "Enter the service address and access details for the mobile visit.",
    component: LocationStep,
  },
  {
    id: "vehicles",
    label: "Vehicles",
    title: "How many vehicles are at this location?",
    description: "Multi-vehicle requests help us review locations outside the usual service area.",
    component: MultiVehicleStep,
  },
  {
    id: "time",
    label: "Time",
    title: "Choose a requested time.",
    description: "Pick your preferred date and time. We'll review before confirming.",
    component: SlotStep,
  },
  {
    id: "details",
    label: "Details",
    title: "How can we contact you?",
    description: "We'll use these details to review and update your booking request.",
    component: CustomerDetailsStep,
  },
  {
    id: "review",
    label: "Review",
    title: "Review your booking request.",
    description: "Check the details before submitting the request for approval.",
    component: ReviewPaymentStep,
  },
];

const reviewPrerequisiteStepIds: BookingStepId[] = [
  "package",
  "vehicle",
  "addons",
  "location",
  "vehicles",
  "time",
  "details",
];

function getPrimaryVehicle(draft: BookingDraft) {
  return draft.vehicles[0];
}

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function validateReviewPrerequisites(draft: BookingDraft): string {
  for (const stepId of reviewPrerequisiteStepIds) {
    const validationMessage = validateStep(stepId, draft);

    if (validationMessage) {
      return validationMessage;
    }
  }

  return "";
}

function validateStep(stepId: BookingStepId, draft: BookingDraft): string {
  const vehicle = getPrimaryVehicle(draft);

  switch (stepId) {
    case "package":
      return draft.packageId ? "" : "Choose Maintenance or Deep Clean to continue.";
    case "vehicle":
      if (!vehicle?.make.trim()) return "Enter the vehicle make.";
      if (!vehicle.model.trim()) return "Enter the vehicle model.";
      if (!vehicle.size) return "Choose the closest vehicle size.";
      return "";
    case "addons":
      return "";
    case "location":
      if (!draft.postcode.trim()) return "Enter the service postcode or area.";
      if (draft.zoneCheckStatus === "unchecked") return "Check the service area before continuing.";
      if (!draft.fullAddress.trim()) return "Enter the full service address.";
      if (!draft.parkingAvailable) return "Choose whether suitable parking is available.";
      if (!draft.accessToElectricityAvailable) return "Confirm electricity access is available.";
      if (!draft.accessibleParkingLocation) return "Confirm the vehicle is in an accessible parking location.";
      return "";
    case "vehicles":
      if (draft.vehicleCount < 1) return "Choose at least one vehicle.";
      if (
        (draft.zoneCheckStatus === "outside_zone_blocked" ||
          draft.zoneCheckStatus === "outside_zone_volume_allowed") &&
        draft.vehicleCount < DEFAULT_MIN_OUTSIDE_ZONE_VEHICLE_COUNT
      ) {
        return "Outside-zone requests need 3+ vehicles at the same address.";
      }
      return "";
    case "time":
      if (!draft.selectedDate) return "Choose a preferred date.";
      if (!isValidDateString(draft.selectedDate)) return "Choose a valid preferred date.";
      if (!draft.selectedSlotStart) return "Choose a preferred time.";
      if (!isValidTimeString(draft.selectedSlotStart)) return "Choose a valid preferred time.";
      return "";
    case "details":
      if (!draft.customer.fullName.trim()) return "Enter your full name.";
      if (!draft.customer.phone.trim()) return "Enter your phone number.";
      if (!draft.customer.email.trim()) return "Enter your email address.";
      if (!isValidEmail(draft.customer.email)) return "Enter a valid email address.";
      return "";
    case "review":
      return validateReviewPrerequisites(draft);
    default:
      return "";
  }
}

export function BookingStepper() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [draft, setDraft] = useState<BookingDraft>(initialBookingDraft);
  const [completionMessage, setCompletionMessage] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingSubmitError, setBookingSubmitError] = useState("");
  const [isBookingWindowOpen, setIsBookingWindowOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const bookingStartedTrackedRef = useRef(false);
  const customerDetailsTrackedRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  const currentStep = bookingSteps[currentStepIndex];
  const ActiveStep = currentStep.component;
  const validationMessage = useMemo(() => validateStep(currentStep.id, draft), [currentStep.id, draft]);
  const canContinue = validationMessage.length === 0;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === bookingSteps.length - 1;
  const paymentsEnabled = false;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOpenBookingWindow = () => {
    setIsBookingWindowOpen(true);

    if (!bookingStartedTrackedRef.current) {
      bookingStartedTrackedRef.current = true;
      trackAnalyticsEvent("booking_started", {
        pagePath: "/booking",
        bookingFlowStep: "start",
      });
    }
  };

  const handleCloseBookingWindow = useCallback(() => {
    setIsBookingWindowOpen(false);

    window.requestAnimationFrame(() => {
      startButtonRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!isBookingWindowOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;

      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseBookingWindow();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("aria-hidden"));

      if (!focusableElements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCloseBookingWindow, isBookingWindowOpen]);

  const updateDraft: BookingDraftUpdate = (updater) => {
    setCompletionMessage("");
    setBookingSubmitError("");
    setDraft((previousDraft) => {
      const nextDraft = updater(previousDraft);
      const previousVehicle = getPrimaryVehicle(previousDraft);
      const nextVehicle = getPrimaryVehicle(nextDraft);

      if (previousDraft.packageId !== nextDraft.packageId && nextDraft.packageId) {
        trackAnalyticsEvent("package_selected", {
          serviceType: nextDraft.packageId,
          bookingFlowStep: "package",
        });
      }

      if (previousVehicle?.size !== nextVehicle?.size && nextVehicle?.size) {
        trackAnalyticsEvent("vehicle_size_selected", {
          vehicleSize: nextVehicle.size,
          bookingFlowStep: "vehicle",
        });
      }

      if (previousVehicle?.addons.length !== nextVehicle?.addons.length) {
        trackAnalyticsEvent("addons_selected", {
          addonCount: nextVehicle?.addons.length ?? 0,
          bookingFlowStep: "addons",
        });
      }

      if (previousDraft.selectedSlotStart !== nextDraft.selectedSlotStart && nextDraft.selectedSlotStart) {
        trackAnalyticsEvent("slot_selected", {
          bookingFlowStep: "time",
        });
      }

      if (!customerDetailsTrackedRef.current && validateStep("details", nextDraft) === "") {
        customerDetailsTrackedRef.current = true;
        trackAnalyticsEvent("customer_details_completed", {
          bookingFlowStep: "details",
        });
      }

      return nextDraft;
    });
  };

  const handleBack = () => {
    setCompletionMessage("");
    setBookingSubmitError("");
    setCurrentStepIndex((stepIndex) => Math.max(stepIndex - 1, 0));
  };

  const handleContinue = () => {
    if (!canContinue) return;

    if (isLastStep) {
      setCompletionMessage("Use the submit button to send the booking request.");
      return;
    }

    setCurrentStepIndex((stepIndex) => Math.min(stepIndex + 1, bookingSteps.length - 1));
  };

  const handleBookingSubmit = async () => {
    const reviewValidationMessage = validateStep("review", draft);

    if (reviewValidationMessage) {
      setBookingSubmitError(reviewValidationMessage);
      return;
    }

    setIsBookingSubmitting(true);
    setBookingSubmitError("");
    setCompletionMessage("");
    trackAnalyticsEvent("booking_request_created", {
      serviceType: draft.packageId || undefined,
      vehicleSize: getPrimaryVehicle(draft)?.size || undefined,
      addonCount: getPrimaryVehicle(draft)?.addons.length ?? 0,
      bookingFlowStep: "review",
    });

    try {
      const response = await fetch("/api/create-booking-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft,
          idempotencyKey: createIdempotencyKey("booking_request"),
        }),
      });
      const payload = (await response.json()) as CreateBookingRequestResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Booking request could not be submitted." : payload.error.message);
      }

      window.location.href = `/booking/success?reference=${encodeURIComponent(payload.data.bookingReference)}`;
    } catch (error) {
      setBookingSubmitError(
        error instanceof Error
          ? error.message
          : "Booking request could not be submitted. Please try again.",
      );
      setIsBookingSubmitting(false);
    }
  };

  const bookingWindow =
    isBookingWindowOpen && isMounted
      ? createPortal(
          <div className="booking-window" role="presentation">
            <div className="booking-window__backdrop" aria-hidden="true" />
            <div
              className="booking-window__panel"
              id="booking-window"
              role="dialog"
              aria-modal="true"
              aria-label="AUTO VALET booking request form"
              tabIndex={-1}
              ref={dialogRef}
            >
              <div className="booking-window__bar">
                <span>Booking request</span>
                <button className="ghost-button booking-window__close" type="button" onClick={handleCloseBookingWindow}>
                  Close
                </button>
              </div>

              <div className="booking-flow booking-flow--focused">
                <div className="booking-flow__main">
                  <BookingProgress
                    currentStepIndex={currentStepIndex}
                    currentLabel={currentStep.label}
                    totalSteps={bookingSteps.length}
                  />

                  <BookingStepShell
                    eyebrow={currentStep.label}
                    title={currentStep.title}
                    titleId={`booking-step-${currentStep.id}`}
                    description={currentStep.description}
                  >
                    <ActiveStep
                      draft={draft}
                      updateDraft={updateDraft}
                      onBookingSubmit={handleBookingSubmit}
                      isBookingSubmitting={isBookingSubmitting}
                      paymentsEnabled={paymentsEnabled}
                      bookingSubmitError={bookingSubmitError}
                    />
                  </BookingStepShell>

                  <div
                    className={`booking-actions${isLastStep ? " booking-actions--review" : ""}`}
                    aria-label="Booking step controls"
                  >
                    {!isLastStep ? (
                      <button
                        className="primary-button"
                        type="button"
                        onClick={handleContinue}
                        disabled={!canContinue}
                        aria-describedby={!canContinue ? "booking-step-error" : undefined}
                        title={validationMessage || undefined}
                      >
                        Continue
                      </button>
                    ) : null}
                    <button className="secondary-button" type="button" onClick={handleBack} disabled={isFirstStep}>
                      Back
                    </button>
                  </div>

                  {!canContinue ? (
                    <p className="form-field__error booking-step-error" id="booking-step-error">
                      {validationMessage}
                    </p>
                  ) : null}

                  {completionMessage ? (
                    <p className="booking-step-success" role="status">
                      {completionMessage}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <section className="section booking-page" aria-label="Booking request">
        <div className="section__inner booking-page__inner">
          <div className="premium-card booking-launch booking-launch--minimal">
            <div className="booking-launch__actions">
              <button
                className="primary-button booking-launch__start"
                type="button"
                onClick={handleOpenBookingWindow}
                aria-haspopup="dialog"
                aria-controls="booking-window"
                ref={startButtonRef}
              >
                Start Booking
              </button>
              <p>No online payment is taken. AUTO VALET reviews every request before confirming.</p>
            </div>
          </div>
        </div>
      </section>
      {bookingWindow}
    </>
  );
}
