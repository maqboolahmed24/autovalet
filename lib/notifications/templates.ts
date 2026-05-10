import type {
  BuildTemplateInput,
  NotificationBookingSummary,
  NotificationEventType,
  NotificationTemplate,
} from "./types";
import { createAbsoluteUrl } from "../seo/site-config";

const defaultBusinessName = "AUTO VALET";
const logoPath = "/media/auto-valet/logo-mark.png";

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

function isUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isBusinessSignature(value: string) {
  return value.trim().toUpperCase() === defaultBusinessName;
}

function splitLabelValue(paragraph: string) {
  const [label, ...valueParts] = paragraph.split("\n");
  const value = valueParts.join("\n").trim();

  if (!label?.endsWith(":") || !value) {
    return null;
  }

  return {
    label: label.slice(0, -1),
    value,
  };
}

function renderTextParagraph(paragraph: string) {
  return `
    <p style="margin:0 0 18px;color:#383632;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:15px;line-height:1.65;">
      ${escapeHtml(paragraph).replace(/\n/g, "<br />")}
    </p>
  `;
}

function renderDetailBlock(label: string, value: string) {
  const escapedLabel = escapeHtml(label);
  const escapedValue = escapeHtml(value).replace(/\n/g, "<br />");
  const buttonHtml = isUrl(value)
    ? `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;">
        <tr>
          <td style="border-radius:3px;background:#111111;">
            <a href="${escapedValue}" style="display:inline-block;padding:11px 16px;color:#ffffff;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0;">
              Open link
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 12px;border:1px solid #e2ddd3;border-radius:4px;background:#fbfaf7;">
      <tr>
        <td style="padding:14px 16px;">
          <div style="margin:0 0 5px;color:#8b6b32;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:11px;font-weight:700;line-height:1.3;text-transform:uppercase;letter-spacing:.08em;">
            ${escapedLabel}
          </div>
          <div style="margin:0;color:#141414;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:15px;line-height:1.55;">
            ${escapedValue}
          </div>
          ${buttonHtml}
        </td>
      </tr>
    </table>
  `;
}

function renderParagraph(paragraph: string) {
  if (isBusinessSignature(paragraph)) {
    return "";
  }

  const detail = splitLabelValue(paragraph);

  if (detail) {
    return renderDetailBlock(detail.label, detail.value);
  }

  return renderTextParagraph(paragraph);
}

function htmlFromText(text: string, subject: string, preview: string) {
  const paragraphs = text
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const logoUrl = createAbsoluteUrl(logoPath);
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" width="30" height="30" alt="AUTO VALET" style="display:block;width:30px;max-width:30px;height:30px;border:0;outline:none;text-decoration:none;" />`
    : `<div style="color:#ffffff;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;font-weight:800;letter-spacing:.04em;">AV</div>`;
  const bodyHtml = paragraphs.map(renderParagraph).join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f1ea;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(preview)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f1ea;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:30px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;border-collapse:separate;border-spacing:0;">
            <tr>
              <td style="padding:0 2px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width:46px;height:46px;border-radius:4px;background:#111111;text-align:center;vertical-align:middle;">
                      <div style="display:inline-block;width:30px;height:30px;">
                        ${logoHtml}
                      </div>
                    </td>
                    <td style="padding-left:12px;vertical-align:middle;">
                      <div style="margin:0;color:#111111;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:15px;font-weight:800;line-height:1.2;letter-spacing:.08em;">
                        AUTO VALET
                      </div>
                      <div style="margin:2px 0 0;color:#8d877c;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:11px;line-height:1.4;letter-spacing:.08em;text-transform:uppercase;">
                        Detailing
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="border:1px solid #e0d8ca;border-radius:6px;background:#ffffff;padding:30px 26px;">
                <div style="margin:0 0 8px;color:#8b6b32;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:12px;font-weight:700;line-height:1.4;text-transform:uppercase;letter-spacing:.1em;">
                  AUTO VALET
                </div>
                <h1 style="margin:0 0 20px;color:#111111;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:24px;font-weight:700;line-height:1.25;letter-spacing:0;">
                  ${escapeHtml(subject)}
                </h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 2px 0;color:#8d877c;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:12px;line-height:1.55;">
                AUTO VALET sends this email about your booking or admin account activity.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildTemplate(subject: string, preview: string, lines: string[]): NotificationTemplate {
  const text = lines.filter(Boolean).join("\n\n");

  return {
    subject,
    preview,
    text,
    html: htmlFromText(text, subject, preview),
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
        "Your appointment is waiting for AUTO VALET review.",
        [
          customerGreeting(booking),
          "Thanks for your booking request.",
          `Requested time:\n${formatRequestedTime(booking)}`,
          `Service:\n${formatServiceLine(booking)}`,
          `Estimated total:\n${valueOrFallback(booking.estimatedTotal, "To be confirmed")}`,
          `Deposit:\n${valueOrFallback(booking.depositPaid, "To be confirmed")}`,
          "Your appointment is not confirmed yet. AUTO VALET will review your location, vehicle details and requested time before approval.",
          actionUrl ? `View booking status:\n${actionUrl}` : "",
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
          actionUrl ? `View booking status:\n${actionUrl}` : "",
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
          actionUrl ? `View booking status:\n${actionUrl}` : "",
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
          actionUrl ? `View booking status:\n${actionUrl}` : "",
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
          actionUrl ? `View booking status:\n${actionUrl}` : "",
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
          actionUrl ? `View booking status:\n${actionUrl}` : "",
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
          actionUrl ? `View booking status:\n${actionUrl}` : "",
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
        "A booking request is waiting for admin review.",
        [
          "New AUTO VALET booking request",
          `${valueOrFallback(booking.customerName, "Customer")} has submitted a booking request and is waiting for review.`,
          `Customer email:\n${valueOrFallback(booking.customerEmail, "Not provided")}`,
          `Customer phone:\n${valueOrFallback(booking.customerPhone, "Not provided")}`,
          `Requested time:\n${formatRequestedTime(booking)}`,
          `Service:\n${formatServiceLine(booking)}`,
          `Zone status:\n${valueOrFallback(booking.zoneStatusLabel, "Check service area")}`,
          outsideZoneWarning,
          `Estimated total:\n${valueOrFallback(booking.estimatedTotal, "To be confirmed")}`,
          `Deposit:\n${valueOrFallback(booking.depositPaid, "To be confirmed")}`,
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
          `Customer email:\n${valueOrFallback(booking.customerEmail, "Not provided")}`,
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
