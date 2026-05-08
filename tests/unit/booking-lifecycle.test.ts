import { describe, expect, it } from "vitest";
import { canTransitionBookingStatus } from "../../lib/booking/lifecycle";
import {
  getCustomerBookingStatusLabel,
  isCalendarBlockingStatus,
} from "../../lib/booking/statuses";

describe("booking lifecycle", () => {
  it("allows payment_hold to pending_admin_review from payment webhook", () => {
    const result = canTransitionBookingStatus("payment_hold", "pending_admin_review", {
      actor: "payment_webhook",
    });

    expect(result.allowed).toBe(true);
  });

  it("allows zone_validated to pending_admin_review for no-payment customer submissions", () => {
    const result = canTransitionBookingStatus("zone_validated", "pending_admin_review", {
      actor: "customer",
    });

    expect(result.allowed).toBe(true);
  });

  it("allows pending_admin_review to approved from admin", () => {
    const result = canTransitionBookingStatus("pending_admin_review", "approved", {
      actor: "admin",
    });

    expect(result.allowed).toBe(true);
  });

  it("blocks payment_hold to approved", () => {
    const result = canTransitionBookingStatus("payment_hold", "approved", {
      actor: "payment_webhook",
    });

    expect(result.allowed).toBe(false);
  });

  it("uses Confirmed only for approved customer status", () => {
    expect(getCustomerBookingStatusLabel("approved")).toBe("Confirmed");
  });

  it("uses Waiting for approval for pending customer status", () => {
    expect(getCustomerBookingStatusLabel("pending_admin_review")).toBe("Waiting for approval");
  });

  it("centralizes calendar blocking statuses", () => {
    expect(isCalendarBlockingStatus("payment_hold")).toBe(true);
    expect(isCalendarBlockingStatus("declined")).toBe(false);
  });
});
