import type { BookingStatus } from "../booking/types";
import { getDepositActionForUnpaidBooking } from "./deposit-policy";
import { isWeatherOrOperationalReason } from "./weather-policy";
import type {
  CancellationPolicyDecision,
  CancellationPolicyInput,
  DepositAction,
} from "./types";

const fortyEightHoursMs = 48 * 60 * 60 * 1000;

function buildDecision({
  allowed,
  recommendedBookingStatus,
  allowedDepositActions,
  defaultDepositAction,
  message,
  requiresAdminReason = true,
}: CancellationPolicyDecision): CancellationPolicyDecision {
  return {
    allowed,
    recommendedBookingStatus,
    allowedDepositActions,
    defaultDepositAction,
    message,
    requiresAdminReason,
  };
}

function withUnpaidDepositFallback(
  depositPaidMinor: number,
  allowedDepositActions: DepositAction[],
  defaultDepositAction: DepositAction,
) {
  const unpaidAction = getDepositActionForUnpaidBooking(depositPaidMinor);

  if (!unpaidAction) {
    return {
      allowedDepositActions,
      defaultDepositAction,
    };
  }

  return {
    allowedDepositActions: [unpaidAction],
    defaultDepositAction: unpaidAction,
  };
}

function isMoreThanFortyEightHoursAway(appointmentStartAt?: string, now?: string) {
  if (!appointmentStartAt) {
    return false;
  }

  const appointmentTime = Date.parse(appointmentStartAt);
  const nowTime = now ? Date.parse(now) : Date.now();

  if (Number.isNaN(appointmentTime) || Number.isNaN(nowTime)) {
    return false;
  }

  return appointmentTime - nowTime > fortyEightHoursMs;
}

function blockedStatusDecision(status: BookingStatus): CancellationPolicyDecision {
  return buildDecision({
    allowed: false,
    recommendedBookingStatus: status,
    allowedDepositActions: ["no_deposit_action_required"],
    defaultDepositAction: "no_deposit_action_required",
    message: "Use the payment hold, failed payment, refund, or completion workflow for this booking status.",
    requiresAdminReason: true,
  });
}

export function evaluateCancellationPolicy(
  input: CancellationPolicyInput,
): CancellationPolicyDecision {
  if (input.bookingStatus === "payment_hold") {
    return blockedStatusDecision(input.bookingStatus);
  }

  if (
    input.bookingStatus === "expired" ||
    input.bookingStatus === "payment_failed" ||
    input.bookingStatus === "refunded" ||
    input.bookingStatus === "completed" ||
    input.bookingStatus === "no_show"
  ) {
    return blockedStatusDecision(input.bookingStatus);
  }

  if (input.bookingStatus === "pending_admin_review" && input.actor === "admin") {
    const deposit = withUnpaidDepositFallback(
      input.depositPaidMinor,
      ["refund", "transfer"],
      "refund",
    );

    return buildDecision({
      allowed: true,
      recommendedBookingStatus: "declined",
      ...deposit,
      message: "Decline the unapproved request and choose whether to refund or transfer the deposit.",
      requiresAdminReason: true,
    });
  }

  if (
    input.actor === "admin" &&
    isWeatherOrOperationalReason(input.reason) &&
    (input.bookingStatus === "approved" ||
      input.bookingStatus === "on_the_way" ||
      input.bookingStatus === "arrived" ||
      input.bookingStatus === "in_progress")
  ) {
    const deposit = withUnpaidDepositFallback(
      input.depositPaidMinor,
      ["refund", "transfer"],
      input.reason === "weather" ? "transfer" : "refund",
    );

    return buildDecision({
      allowed: true,
      recommendedBookingStatus: "cancelled_by_admin",
      ...deposit,
      message: "AUTO VALET can cancel for weather, access, suitability, or operational reasons.",
      requiresAdminReason: true,
    });
  }

  if (input.bookingStatus === "approved" && input.actor === "customer" && input.reason === "customer_requested") {
    const isEarlyCancellation = isMoreThanFortyEightHoursAway(input.appointmentStartAt, input.now);
    const deposit = withUnpaidDepositFallback(
      input.depositPaidMinor,
      isEarlyCancellation ? ["transfer", "keep_according_to_policy"] : ["keep_according_to_policy", "transfer"],
      isEarlyCancellation ? "transfer" : "keep_according_to_policy",
    );

    return buildDecision({
      allowed: true,
      recommendedBookingStatus: "cancelled_by_customer",
      ...deposit,
      message: isEarlyCancellation
        ? "Customer cancellation is more than 48 hours before the appointment. A one-time deposit transfer may be offered."
        : "Customer cancellation is within 48 hours or the appointment time is unknown. The deposit may be kept according to policy.",
      requiresAdminReason: true,
    });
  }

  if (input.bookingStatus === "approved" && input.actor === "admin") {
    const deposit = withUnpaidDepositFallback(
      input.depositPaidMinor,
      ["refund", "transfer", "keep_according_to_policy"],
      input.reason === "duplicate_booking" || input.reason === "payment_issue" ? "refund" : "transfer",
    );

    return buildDecision({
      allowed: true,
      recommendedBookingStatus: "cancelled_by_admin",
      ...deposit,
      message: "AUTO VALET can cancel an approved booking when the policy reason is recorded.",
      requiresAdminReason: true,
    });
  }

  if (input.bookingStatus === "cancelled_by_admin" || input.bookingStatus === "cancelled_by_customer") {
    return buildDecision({
      allowed: false,
      recommendedBookingStatus: input.bookingStatus,
      allowedDepositActions: ["refund", "transfer", "keep_according_to_policy"],
      defaultDepositAction: "keep_according_to_policy",
      message: "This booking is already cancelled. Use refund or transfer actions instead.",
      requiresAdminReason: true,
    });
  }

  return buildDecision({
    allowed: false,
    recommendedBookingStatus: input.bookingStatus,
    allowedDepositActions: ["no_deposit_action_required"],
    defaultDepositAction: "no_deposit_action_required",
    message: "Cancellation is not allowed for this booking status and reason.",
    requiresAdminReason: true,
  });
}
