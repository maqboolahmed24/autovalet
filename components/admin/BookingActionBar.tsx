"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminBookingDetailData } from "../../lib/admin/booking-detail";
import { ApproveBookingSheet } from "./ApproveBookingSheet";
import { CancelBookingSheet } from "./CancelBookingSheet";
import { DeclineBookingSheet } from "./DeclineBookingSheet";
import { NoShowSheet } from "./NoShowSheet";
import { RescheduleBookingSheet } from "./RescheduleBookingSheet";

type BookingActionBarProps = {
  booking: AdminBookingDetailData;
};

type ActiveSheet = "approve" | "decline" | "reschedule" | "cancel" | "no_show" | null;

function getUnavailableReason(booking: AdminBookingDetailData) {
  if (booking.status === "payment_hold") {
    return "This hold is waiting for payment.";
  }

  if (booking.status === "declined") {
    return "This request has already been declined.";
  }

  if (booking.status === "approved") {
    return "Approval is complete. Job-day actions are available when the status allows them.";
  }

  return "No decision action is available for this booking status.";
}

export function BookingActionBar({ booking }: BookingActionBarProps) {
  const router = useRouter();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const canMarkNoShow =
    booking.status === "approved" ||
    booking.status === "on_the_way" ||
    booking.status === "arrived";
  const canOpenDecision =
    booking.actions.canApprove ||
    booking.actions.canDecline ||
    booking.actions.canReschedule ||
    booking.actions.canCancel ||
    canMarkNoShow;

  function handleActionSaved() {
    router.refresh();
  }

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

        {booking.actions.canCancel ? (
          <>
            <button className="admin-button admin-button--secondary" type="button" onClick={() => setActiveSheet("cancel")}>
              Cancel
            </button>
          </>
        ) : null}

        {canMarkNoShow ? (
          <button className="admin-button admin-button--secondary" type="button" onClick={() => setActiveSheet("no_show")}>
            Mark no-show
          </button>
        ) : null}

        {!canOpenDecision && booking.status !== "approved" ? (
          <button className="admin-button admin-button--secondary" type="button" disabled>
            Actions unavailable
          </button>
        ) : null}

        <p>
          {canOpenDecision
            ? "Actions save to the admin database and update the booking record."
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
          {activeSheet === "cancel" ? (
            <CancelBookingSheet
              bookingId={booking.id}
              defaultDepositAction={
                booking.financials.depositPaidMinor > 0 ? "keep_according_to_policy" : "no_deposit_action_required"
              }
              onClose={() => setActiveSheet(null)}
              onCancelled={handleActionSaved}
            />
          ) : null}
          {activeSheet === "no_show" ? (
            <NoShowSheet
              bookingId={booking.id}
              depositPaidMinor={booking.financials.depositPaidMinor}
              onClose={() => setActiveSheet(null)}
              onMarkedNoShow={handleActionSaved}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
