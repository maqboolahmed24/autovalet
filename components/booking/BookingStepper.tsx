"use client";

import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { BookingProgress } from "./BookingProgress";
import { BookingStepShell } from "./BookingStepShell";
import { BookingSummary } from "./BookingSummary";
import { AddonsStep } from "./steps/AddonsStep";
import { CustomerDetailsStep } from "./steps/CustomerDetailsStep";
import { LocationStep } from "./steps/LocationStep";
import { MultiVehicleStep } from "./steps/MultiVehicleStep";
import { PackageStep } from "./steps/PackageStep";
import { ReviewPaymentStep } from "./steps/ReviewPaymentStep";
import { SlotStep } from "./steps/SlotStep";
import { VehicleStep } from "./steps/VehicleStep";

export type VehicleSize = "small" | "medium" | "large_4x4";

export type PackageId = "maintenance" | "deep_clean";

export type AddonId =
  | "engine_bay_clean"
  | "windscreen_repellent"
  | "exhaust_tips_polished"
  | "leather_deep_clean"
  | "convertible_roof_treatment"
  | "excess_pet_hair_removal"
  | "liquid_decon_clay_bar";

export type BookingVehicle = {
  id: string;
  make: string;
  model: string;
  size: VehicleSize | "";
  addons: AddonId[];
};

export type ZoneCheckStatus =
  | "unchecked"
  | "standard_zone"
  | "outside_zone_volume_allowed"
  | "outside_zone_blocked";

export type BookingDraft = {
  packageId: PackageId | "";
  vehicles: BookingVehicle[];
  postcode: string;
  fullAddress: string;
  parkingAvailable: "yes" | "no" | "unknown" | "";
  parkingNotes: string;
  accessNotes: string;
  zoneCheckStatus: ZoneCheckStatus;
  vehicleCount: number;
  selectedDate: string;
  selectedSlotStart: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  extraNotes: string;
  marketingPhotoConsent: boolean;
};

export type BookingDraftUpdate = (updater: (draft: BookingDraft) => BookingDraft) => void;

export type BookingStepProps = {
  draft: BookingDraft;
  updateDraft: BookingDraftUpdate;
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
    description: "Check the details before paying your deposit and submitting the request for approval.",
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

function validateReviewPrerequisites(draft: BookingDraft) {
  for (const stepId of reviewPrerequisiteStepIds) {
    const validationMessage = validateStep(stepId, draft);

    if (validationMessage) {
      return validationMessage;
    }
  }

  return "";
}

function validateStep(stepId: BookingStepId, draft: BookingDraft) {
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
      if (!draft.postcode.trim()) return "Enter the service postcode.";
      if (!draft.fullAddress.trim()) return "Enter the full service address.";
      if (!draft.parkingAvailable) return "Choose whether suitable parking is available.";
      return "";
    case "vehicles":
      if (draft.vehicleCount < 1) return "Choose at least one vehicle.";
      if (draft.zoneCheckStatus === "outside_zone_blocked" && draft.vehicleCount < 3) {
        return "Outside-zone requests need 3+ vehicles at the same address.";
      }
      return "";
    case "time":
      if (!draft.selectedDate) return "Choose a preferred date.";
      if (!draft.selectedSlotStart) return "Choose a preferred time.";
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

  const currentStep = bookingSteps[currentStepIndex];
  const ActiveStep = currentStep.component;
  const validationMessage = useMemo(() => validateStep(currentStep.id, draft), [currentStep.id, draft]);
  const canContinue = validationMessage.length === 0;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === bookingSteps.length - 1;

  const updateDraft: BookingDraftUpdate = (updater) => {
    setCompletionMessage("");
    setDraft((previousDraft) => updater(previousDraft));
  };

  const handleBack = () => {
    setCompletionMessage("");
    setCurrentStepIndex((stepIndex) => Math.max(stepIndex - 1, 0));
  };

  const handleContinue = () => {
    if (!canContinue) return;

    if (isLastStep) {
      setCompletionMessage("This UI shell stops before payment. No booking request has been submitted.");
      return;
    }

    setCurrentStepIndex((stepIndex) => Math.min(stepIndex + 1, bookingSteps.length - 1));
  };

  return (
    <section className="section booking-page" aria-label="AUTO VALET booking request form">
      <div className="section__inner booking-page__inner">
        <div className="booking-flow__notice" role="note">
          <span className="status-badge status-badge--warning">Booking request</span>
          <p>This is a booking request. AUTO VALET manually reviews every appointment before approval.</p>
        </div>

        <div className="booking-flow">
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
              <ActiveStep draft={draft} updateDraft={updateDraft} />
            </BookingStepShell>

            <div
              className={`booking-actions${isLastStep ? " booking-actions--review" : ""}`}
              aria-label="Booking step controls"
            >
              <button className="secondary-button" type="button" onClick={handleBack} disabled={isFirstStep}>
                Back
              </button>
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

          <BookingSummary draft={draft} />
        </div>
      </div>
    </section>
  );
}
