"use client";

import { useState } from "react";
import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";
import { ApproveBookingSheet } from "./ApproveBookingSheet";
import { DeclineBookingSheet } from "./DeclineBookingSheet";
import { RescheduleBookingSheet } from "./RescheduleBookingSheet";

type BookingActionBarProps = {
  booking: AdminBookingDetailData;
};

type ActiveSheet = "approve" | "decline" | "reschedule" | null;

function getUnavailableReason(booking: AdminBookingDetailData) {
  if (booking.status === "payment_hold") {
    return "Payment is still in progress.";
  }

  if (booking.status === "declined") {
    return "This request has already been declined.";
  }

  if (booking.status === "approved") {
    return "Approval is complete. Job-day actions are connected later.";
  }

  return "No decision action is available for this booking status.";
}

export function BookingActionBar({ booking }: BookingActionBarProps) {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const canOpenDecision =
    booking.actions.canApprove ||
    booking.actions.canDecline ||
    booking.actions.canReschedule;

  return (
    <>
      <section className="booking-action-bar" aria-label="Booking actions">
        {booking.actions.canDecline ? (
          <button
            className="admin-button admin-button--secondary"
            type="button"
            onClick={() => setActiveSheet("decline")}
          >
            Decline
          </button>
        ) : null}

        {booking.actions.canReschedule ? (
          <button
            className="admin-button admin-button--secondary"
            type="button"
            onClick={() => setActiveSheet("reschedule")}
          >
            Suggest new time
          </button>
        ) : null}

        {booking.actions.canApprove ? (
          <button
            className="admin-button admin-button--primary"
            type="button"
            onClick={() => setActiveSheet("approve")}
          >
            Approve Booking
          </button>
        ) : null}

        {booking.status === "approved" ? (
          <>
            <button className="admin-button admin-button--secondary" type="button" disabled>
              Cancel
            </button>
            <button className="admin-button admin-button--secondary" type="button" disabled>
              Start job
            </button>
          </>
        ) : null}

        {!canOpenDecision && booking.status !== "approved" ? (
          <button className="admin-button admin-button--secondary" type="button" disabled>
            Actions unavailable
          </button>
        ) : null}

        <p>
          {canOpenDecision
            ? "Decision actions open review sheets and fail safely until persistence is connected."
            : getUnavailableReason(booking)}
        </p>
      </section>

      {activeSheet ? (
        <div className="admin-sheet-backdrop" role="presentation">
          {activeSheet === "approve" ? (
            <ApproveBookingSheet booking={booking} onClose={() => setActiveSheet(null)} />
          ) : null}
          {activeSheet === "decline" ? (
            <DeclineBookingSheet booking={booking} onClose={() => setActiveSheet(null)} />
          ) : null}
          {activeSheet === "reschedule" ? (
            <RescheduleBookingSheet booking={booking} onClose={() => setActiveSheet(null)} />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
