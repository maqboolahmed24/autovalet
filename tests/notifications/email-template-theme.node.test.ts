import assert from "node:assert/strict";
import { test } from "node:test";
import { buildNotificationTemplate } from "../../lib/notifications/templates";
import type { NotificationBookingSummary } from "../../lib/notifications/types";

const booking: NotificationBookingSummary = {
  bookingReference: "AV-2026-ABCDEFGH",
  customerName: "Sarah Wilson",
  customerEmail: "sarah@example.com",
  customerPhone: "07123456789",
  requestedDate: "Wed 13 May",
  requestedTime: "09:00",
  serviceLabel: "Maintenance",
  vehicleLabel: "BMW 3 Series - Medium",
  estimatedTotal: "GBP 85",
  depositPaid: "GBP 0",
  statusLabel: "Waiting for approval",
};

test("notification email HTML declares light and dark color schemes", () => {
  const template = buildNotificationTemplate({
    eventType: "booking_request_received",
    recipientType: "customer",
    booking,
    actionUrl: "https://example.com/booking/status/AV-2026-ABCDEFGH",
  });

  assert.ok(template.html);
  assert.match(template.html, /<meta name="color-scheme" content="light dark" \/>/);
  assert.match(template.html, /<meta name="supported-color-schemes" content="light dark" \/>/);
  assert.match(template.html, /@media \(prefers-color-scheme: dark\)/);
  assert.match(template.html, /\[data-ogsc\] \.email-card/);
});

test("notification email HTML keeps readable defaults for clients without dark-mode CSS", () => {
  const template = buildNotificationTemplate({
    eventType: "booking_request_received",
    recipientType: "customer",
    booking,
  });

  assert.ok(template.html);
  assert.match(template.html, /class="email-body"[^>]*background-color:#f4f1ea;color:#383632/);
  assert.match(template.html, /class="email-card"[^>]*background-color:#ffffff/);
  assert.match(template.html, /class="email-heading"[^>]*color:#111111/);
  assert.match(template.html, /class="email-copy"[^>]*color:#383632/);
  assert.match(template.html, /class="email-detail"[^>]*background-color:#fbfaf7/);
  assert.match(template.html, /class="email-detail-value"[^>]*color:#141414/);
});
