import { describe, expect, it } from "vitest";
import { canMarkNoShowFromStatus } from "../../lib/admin/no-show";
import { evaluateCancellationPolicy } from "../../lib/policies";

describe("cancellation and deposit policy", () => {
  it("recommends refund when admin declines before approval", () => {
    const decision = evaluateCancellationPolicy({
      bookingStatus: "pending_admin_review",
      actor: "admin",
      reason: "outside_service_area",
      depositPaidMinor: 3000,
    });

    expect(decision.allowed).toBe(true);
    expect(decision.recommendedBookingStatus).toBe("declined");
    expect(decision.defaultDepositAction).toBe("refund");
  });

  it("allows refund or transfer for weather cancellations", () => {
    const decision = evaluateCancellationPolicy({
      bookingStatus: "approved",
      actor: "admin",
      reason: "weather",
      appointmentStartAt: "2026-05-18T09:00:00.000Z",
      now: "2026-05-08T09:00:00.000Z",
      depositPaidMinor: 3000,
    });

    expect(decision.allowed).toBe(true);
    expect(decision.allowedDepositActions).toContain("refund");
    expect(decision.allowedDepositActions).toContain("transfer");
  });

  it("recommends keeping according to policy inside 48 hours", () => {
    const decision = evaluateCancellationPolicy({
      bookingStatus: "approved",
      actor: "customer",
      reason: "customer_requested",
      appointmentStartAt: "2026-05-09T09:00:00.000Z",
      now: "2026-05-08T09:00:00.000Z",
      depositPaidMinor: 3000,
    });

    expect(decision.allowed).toBe(true);
    expect(decision.defaultDepositAction).toBe("keep_according_to_policy");
  });

  it("allows no-show only on active booking statuses", () => {
    expect(canMarkNoShowFromStatus("approved")).toBe(true);
    expect(canMarkNoShowFromStatus("on_the_way")).toBe(true);
    expect(canMarkNoShowFromStatus("arrived")).toBe(true);
    expect(canMarkNoShowFromStatus("pending_admin_review")).toBe(false);
  });
});
