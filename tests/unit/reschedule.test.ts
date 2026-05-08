import { describe, expect, it } from "vitest";
import { getAdminBookingDetail } from "../../lib/admin/booking-detail";
import { proposeReschedule } from "../../lib/admin/reschedule-booking";

describe("admin reschedule validation", () => {
  it("rejects past proposed slots", async () => {
    const booking = await getAdminBookingDetail("mock-request-5");

    if (!booking) {
      throw new Error("Expected mock booking detail");
    }

    const result = await proposeReschedule(
      {
        bookingId: booking.id,
        adminId: "admin-1",
        proposedDate: "2020-01-01",
        proposedStartTime: "09:00",
      },
      {
        adminAuthenticated: true,
        canRescheduleBooking: true,
        booking,
        existingBookings: [],
      },
    );

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected reschedule validation failure");
    expect(result.code).toBe("RESCHEDULE_VALIDATION_FAILED");
  });
});
