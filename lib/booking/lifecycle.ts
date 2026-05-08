import { getAdminBookingStatusLabel } from "./status-labels";
import type { BookingStatus } from "./types";

export type BookingTransitionContext = {
  actor: "customer" | "admin" | "system" | "payment_webhook";
  reason?: string;
};

export type BookingTransitionResult =
  | {
      allowed: true;
      from: BookingStatus;
      to: BookingStatus;
    }
  | {
      allowed: false;
      from: BookingStatus;
      to: BookingStatus;
      message: string;
    };

export const allowedBookingStatusTransitions: Record<BookingStatus, readonly BookingStatus[]> = {
  draft: ["zone_validated"],
  zone_validated: ["payment_hold", "pending_admin_review"],
  payment_hold: ["pending_admin_review", "expired", "payment_failed"],
  pending_admin_review: ["approved", "declined", "reschedule_requested"],
  approved: ["reschedule_requested", "on_the_way", "cancelled_by_admin", "cancelled_by_customer", "no_show"],
  declined: ["refunded"],
  reschedule_requested: ["pending_admin_review", "approved"],
  on_the_way: ["arrived", "cancelled_by_admin", "no_show"],
  arrived: ["in_progress", "cancelled_by_admin", "no_show"],
  in_progress: ["completed", "cancelled_by_admin"],
  completed: [],
  cancelled_by_customer: ["refunded"],
  cancelled_by_admin: ["refunded"],
  no_show: [],
  expired: ["draft"],
  payment_failed: ["expired"],
  refunded: [],
};

const adminReviewTargets = ["approved", "declined", "reschedule_requested"] as const;
const jobDayTargets = ["on_the_way", "arrived", "in_progress", "completed", "no_show"] as const;

function deny(from: BookingStatus, to: BookingStatus, message: string): BookingTransitionResult {
  return {
    allowed: false,
    from,
    to,
    message,
  };
}

function allow(from: BookingStatus, to: BookingStatus): BookingTransitionResult {
  return {
    allowed: true,
    from,
    to,
  };
}

function hasPolicyReason(context: BookingTransitionContext) {
  return Boolean(context.reason?.trim());
}

export function canTransitionBookingStatus(
  from: BookingStatus,
  to: BookingStatus,
  context: BookingTransitionContext,
): BookingTransitionResult {
  if (from === to) {
    return deny(from, to, `Booking is already ${getAdminBookingStatusLabel(to)}.`);
  }

  const allowedTargets = allowedBookingStatusTransitions[from];

  if (!allowedTargets.includes(to)) {
    return deny(
      from,
      to,
      `Cannot move booking from ${getAdminBookingStatusLabel(from)} to ${getAdminBookingStatusLabel(to)}.`,
    );
  }

  if (from === "payment_hold" && to === "pending_admin_review" && context.actor !== "payment_webhook") {
    return deny(from, to, "Only a verified payment webhook can mark the deposit paid.");
  }

  if (from === "zone_validated" && to === "pending_admin_review" && context.actor !== "customer") {
    return deny(from, to, "Only a customer booking request can move directly to review without payment.");
  }

  if (from === "payment_hold" && to === "payment_failed" && context.actor !== "payment_webhook") {
    return deny(from, to, "Only a payment webhook can mark the payment failed.");
  }

  if (from === "payment_hold" && to === "expired" && context.actor !== "system") {
    return deny(from, to, "Only the system expiry process can expire a payment hold.");
  }

  if (
    from === "pending_admin_review" &&
    adminReviewTargets.includes(to as (typeof adminReviewTargets)[number]) &&
    context.actor !== "admin"
  ) {
    return deny(from, to, "Only an admin can approve, decline or reschedule a pending request.");
  }

  if (to === "cancelled_by_admin" && !["admin", "system"].includes(context.actor)) {
    return deny(from, to, "Only AUTO VALET can record an admin cancellation.");
  }

  if (to === "cancelled_by_customer" && !["customer", "admin", "system"].includes(context.actor)) {
    return deny(from, to, "Customer cancellations must be recorded by the customer or AUTO VALET.");
  }

  if (to === "refunded" && !["admin", "system", "payment_webhook"].includes(context.actor)) {
    return deny(from, to, "Refund status changes must be handled by AUTO VALET or the payment system.");
  }

  if (jobDayTargets.includes(to as (typeof jobDayTargets)[number]) && !["admin", "system"].includes(context.actor)) {
    return deny(from, to, "Only AUTO VALET can update job-day status.");
  }

  if (from === "cancelled_by_customer" && to === "refunded" && !hasPolicyReason(context)) {
    return deny(from, to, "Customer cancellation refunds require a policy reason.");
  }

  if (from === "expired" && to === "draft" && !hasPolicyReason(context)) {
    return deny(from, to, "Expired bookings can only become a new draft with a new-request reason.");
  }

  return allow(from, to);
}

export function assertBookingTransition(
  from: BookingStatus,
  to: BookingStatus,
  context: BookingTransitionContext,
) {
  const result = canTransitionBookingStatus(from, to, context);

  if (!result.allowed) {
    throw new Error(result.message);
  }
}
