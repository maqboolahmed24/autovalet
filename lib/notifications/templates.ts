import type {
  BuildTemplateInput,
  NotificationBookingSummary,
  NotificationEventType,
  NotificationTemplate,
} from "./types";

const defaultBusinessName = "AUTO VALET";

function valueOrFallback(value: string | undefined, fallback = "To be confirmed") {
  return value?.trim() || fallback;
}

function formatRequestedTime(booking: NotificationBookingSummary) {
  const date = valueOrFallback(booking.requestedDate);
  const time = valueOrFallback(booking.requestedTime);

  return `${date} at ${time}`;
}

function formatServiceLine(booking: NotificationBookingSummary) {
  const service = valueOrFallback(booking.serviceLabel, "Selected service");
  const vehicle = valueOrFallback(booking.vehicleLabel, "Vehicle details");

  return `${service} - ${vehicle}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function htmlFromText(text: string) {
  return text
    .split("\n\n")
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function buildTemplate(subject: string, preview: string, lines: string[]): NotificationTemplate {
  const text = lines.filter(Boolean).join("\n\n");

  return {
    subject,
    preview,
    text,
    html: htmlFromText(text),
  };
}

function customerGreeting(booking: NotificationBookingSummary) {
  return `Hi ${valueOrFallback(booking.customerName, "there")},`;
}

function bookingReferenceLine(booking: NotificationBookingSummary) {
  return `Booking reference:\n${booking.bookingReference}`;
}

function buildCustomerTemplate(input: BuildTemplateInput): NotificationTemplate {
  const businessName = input.businessName ?? defaultBusinessName;
  const booking = input.booking;
  const reason = input.reason?.trim();
  const actionUrl = input.actionUrl?.trim();

  switch (input.eventType) {
    case "booking_request_received":
      return buildTemplate(
        "Your AUTO VALET booking request has been received",
        "Deposit received. Your appointment is waiting for AUTO VALET review.",
        [
          customerGreeting(booking),
          "Thanks for your booking request.",
          `Requested time:\n${formatRequestedTime(booking)}`,
          `Service:\n${formatServiceLine(booking)}`,
          `Deposit paid:\n${valueOrFallback(booking.depositPaid, "Deposit received")}`,
          "Your appointment is not confirmed yet. AUTO VALET will review your location, vehicle details and requested time before approval.",
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "booking_approved":
      return buildTemplate(
        "Your AUTO VALET booking is confirmed",
        "Your AUTO VALET booking has been approved and is now confirmed.",
        [
          customerGreeting(booking),
          "Your booking has been approved and is now confirmed.",
          `Appointment:\n${formatRequestedTime(booking)}`,
          `Service:\n${valueOrFallback(booking.serviceLabel, "Selected service")}`,
          `Address:\n${valueOrFallback(booking.addressSummary, "Service address on booking")}`,
          `Deposit paid:\n${valueOrFallback(booking.depositPaid, "Recorded")}`,
          `Estimated remaining balance:\n${valueOrFallback(booking.remainingBalance, "To be confirmed")}`,
          "Please make sure the vehicle is accessible and suitable parking is available nearby.",
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "booking_declined":
      return buildTemplate(
        "Your AUTO VALET booking request update",
        "Your booking request was not approved. Deposit information is included.",
        [
          customerGreeting(booking),
          "Unfortunately, AUTO VALET is unable to approve your requested booking.",
          reason ? `Reason:\n${reason}` : "",
          "Deposit action:\nRefund or transfer information will be handled according to the deposit policy.",
          "You can contact AUTO VALET if you would like to arrange a different date or location.",
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "reschedule_suggested":
      return buildTemplate(
        "AUTO VALET has suggested a new time",
        "A new time has been suggested for your booking request.",
        [
          customerGreeting(booking),
          "Your requested time is not available, but AUTO VALET can offer a new time.",
          `Suggested time:\n${formatRequestedTime(booking)}`,
          actionUrl ? `Review the new time:\n${actionUrl}` : "",
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "booking_cancelled":
      return buildTemplate(
        "Your AUTO VALET booking has been cancelled",
        "Your booking cancellation has been recorded.",
        [
          customerGreeting(booking),
          "Your AUTO VALET booking has been cancelled.",
          reason ? `Reason:\n${reason}` : "",
          "Any deposit action will follow the published cancellation policy.",
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "deposit_refunded":
      return buildTemplate(
        "Your AUTO VALET deposit refund",
        "Your deposit refund has been recorded.",
        [
          customerGreeting(booking),
          "Your AUTO VALET deposit refund has been recorded.",
          `Deposit:\n${valueOrFallback(booking.depositPaid, "Refund amount recorded")}`,
          reason ? `Reason:\n${reason}` : "",
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "deposit_transferred":
      return buildTemplate(
        "Your AUTO VALET deposit transfer",
        "Your deposit has been transferred according to policy.",
        [
          customerGreeting(booking),
          "Your AUTO VALET deposit has been transferred to a future booking or rescheduled appointment.",
          reason ? `Reason:\n${reason}` : "",
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "payment_failed":
      return buildTemplate(
        "AUTO VALET deposit payment failed",
        "Your deposit payment could not be completed.",
        [
          customerGreeting(booking),
          "Your AUTO VALET deposit payment could not be completed.",
          "No booking request has been submitted. You can return to the booking form and choose a requested time again.",
          businessName,
        ],
      );
    case "payment_hold_expired":
      return buildTemplate(
        "Your AUTO VALET booking hold expired",
        "Your temporary booking hold has expired.",
        [
          customerGreeting(booking),
          "Your temporary payment hold has expired, so the requested slot has been released.",
          "You can start again and choose a new requested time.",
          businessName,
        ],
      );
    case "appointment_reminder":
      return buildTemplate(
        "Reminder: AUTO VALET appointment tomorrow",
        "Reminder for your confirmed AUTO VALET appointment.",
        [
          customerGreeting(booking),
          "This is a reminder for your confirmed appointment.",
          `Appointment:\n${formatRequestedTime(booking)}`,
          "Please make sure the vehicle is accessible and suitable parking is available nearby.",
          `Estimated remaining balance:\n${valueOrFallback(booking.remainingBalance, "To be confirmed")}`,
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "final_price_adjusted":
      return buildTemplate(
        "Your AUTO VALET final price has been updated",
        "Your final price has been updated after review.",
        [
          customerGreeting(booking),
          `Final pricing has been updated for booking ${booking.bookingReference}.`,
          `Remaining balance:\n${valueOrFallback(booking.remainingBalance, "To be confirmed")}`,
          reason ? `Reason:\n${reason}` : "",
          businessName,
        ],
      );
    case "balance_payment_recorded":
      return buildTemplate(
        "AUTO VALET balance payment recorded",
        "Your balance payment has been recorded.",
        [
          customerGreeting(booking),
          "Your AUTO VALET balance payment has been recorded.",
          `Remaining balance:\n${valueOrFallback(booking.remainingBalance, "Updated")}`,
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    case "no_show_recorded":
      return buildTemplate(
        "AUTO VALET booking update",
        "A no-show or access issue has been recorded.",
        [
          customerGreeting(booking),
          "AUTO VALET has recorded a no-show or access issue for this booking.",
          reason ? `Reason:\n${reason}` : "",
          "Any deposit action will follow the published policy.",
          bookingReferenceLine(booking),
          businessName,
        ],
      );
    default:
      return buildTemplate(
        "AUTO VALET booking update",
        "There is an update about your AUTO VALET booking.",
        [
          customerGreeting(booking),
          `There is an update about booking ${booking.bookingReference}.`,
          booking.statusLabel ? `Status:\n${booking.statusLabel}` : "",
          businessName,
        ],
      );
  }
}

function buildAdminTemplate(input: BuildTemplateInput): NotificationTemplate {
  const booking = input.booking;
  const actionUrl = input.actionUrl?.trim();
  const outsideZoneWarning = booking.isOutsideZoneRequest
    ? "Outside-zone request - check vehicle count and location."
    : "";

  switch (input.eventType) {
    case "admin_new_booking_request":
      return buildTemplate(
        "New AUTO VALET booking request",
        "A paid booking request is waiting for admin review.",
        [
          "New AUTO VALET booking request",
          `${valueOrFallback(booking.customerName, "Customer")} has paid a deposit and is waiting for review.`,
          `Requested time:\n${formatRequestedTime(booking)}`,
          `Service:\n${formatServiceLine(booking)}`,
          `Zone status:\n${valueOrFallback(booking.zoneStatusLabel, "Check service area")}`,
          outsideZoneWarning,
          `Deposit:\n${valueOrFallback(booking.depositPaid, "Recorded")}`,
          actionUrl ? `Review link:\n${actionUrl}` : "Review link:\nOpen admin dashboard to approve, decline or suggest a new time.",
        ],
      );
    case "manual_booking_created":
      return buildTemplate(
        "Manual booking created",
        "A manual AUTO VALET booking has been created.",
        [
          "Manual booking created",
          `Customer:\n${valueOrFallback(booking.customerName)}`,
          `Time:\n${formatRequestedTime(booking)}`,
          `Service:\n${formatServiceLine(booking)}`,
          `Status:\n${valueOrFallback(booking.statusLabel, "Pending or approved")}`,
          actionUrl ? `Open booking:\n${actionUrl}` : "",
        ],
      );
    default:
      return buildTemplate(
        "AUTO VALET admin notification",
        "There is an AUTO VALET admin update.",
        [
          "AUTO VALET admin update",
          `Booking:\n${booking.bookingReference}`,
          `Customer:\n${valueOrFallback(booking.customerName)}`,
          `Status:\n${valueOrFallback(booking.statusLabel, "Check booking")}`,
          input.reason ? `Reason:\n${input.reason}` : "",
          actionUrl ? `Open booking:\n${actionUrl}` : "",
        ],
      );
  }
}

export function buildNotificationTemplate(input: BuildTemplateInput): NotificationTemplate {
  if (input.recipientType === "admin" || input.eventType === "admin_new_booking_request") {
    return buildAdminTemplate(input);
  }

  return buildCustomerTemplate(input);
}

export const notificationEventLabels: Record<NotificationEventType, string> = {
  booking_request_received: "Booking request received",
  admin_new_booking_request: "New booking request",
  booking_approved: "Booking approved",
  booking_declined: "Booking declined",
  reschedule_suggested: "Reschedule suggested",
  booking_cancelled: "Booking cancelled",
  deposit_refunded: "Deposit refunded",
  deposit_transferred: "Deposit transferred",
  payment_failed: "Payment failed",
  payment_hold_expired: "Payment hold expired",
  appointment_reminder: "Appointment reminder",
  manual_booking_created: "Manual booking created",
  final_price_adjusted: "Final price adjusted",
  balance_payment_recorded: "Balance payment recorded",
  no_show_recorded: "No-show recorded",
};
