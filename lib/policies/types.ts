import type { BookingStatus } from "../booking/types";

export type CancellationActor = "customer" | "admin" | "system";

export type CancellationReason =
  | "customer_requested"
  | "weather"
  | "outside_service_area"
  | "vehicle_unsuitable"
  | "access_or_parking_issue"
  | "admin_operational_issue"
  | "duplicate_booking"
  | "payment_issue"
  | "other";

export type DepositAction =
  | "refund"
  | "transfer"
  | "keep_according_to_policy"
  | "no_deposit_action_required";

export type NoShowReason =
  | "customer_unavailable"
  | "vehicle_inaccessible"
  | "no_parking"
  | "unsafe_location"
  | "other";

export type RefundStatus =
  | "not_required"
  | "pending"
  | "completed"
  | "failed"
  | "provider_not_configured";

export type CancellationPolicyInput = {
  bookingStatus: BookingStatus;
  actor: CancellationActor;
  reason: CancellationReason;
  appointmentStartAt?: string;
  now?: string;
  depositPaidMinor: number;
};

export type CancellationPolicyDecision = {
  allowed: boolean;
  recommendedBookingStatus: BookingStatus;
  allowedDepositActions: DepositAction[];
  defaultDepositAction: DepositAction;
  message: string;
  requiresAdminReason: boolean;
};

export type WeatherRescheduleDecision = {
  shouldReschedule: boolean;
  recommendedDepositAction: DepositAction;
  message: string;
};
