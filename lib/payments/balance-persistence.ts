import { randomUUID } from "node:crypto";
import type { BookingStatus } from "../booking/types";
import { transaction } from "../db/postgres";
import {
  calculateBalanceDueMinor,
  getPaymentDisplayStatus,
  validateMarkBalancePaidInput,
  type BookingBalanceSnapshot,
  type MarkBalancePaidInput,
  type MarkBalancePaidOptions,
  type MarkBalancePaidResult,
} from "./balance";

type BookingBalanceRow = {
  status: BookingStatus;
  estimated_total_minor: number;
  final_total_minor: number | null;
  deposit_paid_minor: number;
  balance_due_minor: number;
  balance_paid_minor: number;
};

export async function markBalancePaid(
  input: MarkBalancePaidInput,
  options: MarkBalancePaidOptions = {},
): Promise<MarkBalancePaidResult> {
  const validationErrors = validateMarkBalancePaidInput(input, options.booking);

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "BALANCE_PAYMENT_VALIDATION_FAILED",
      message: validationErrors.join(" "),
    };
  }

  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_NOT_CONFIGURED",
      message: "Admin authentication is not configured yet.",
    };
  }

  if (!options.canMarkBalancePaid) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot record balance payments.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "BALANCE_PAYMENT_PERSISTENCE_NOT_CONFIGURED",
      message: "Balance payment recording is not connected to database persistence yet.",
    };
  }

  try {
    return await transaction(async (client) => {
      const bookingResult = await client.query<BookingBalanceRow>(
        `
          SELECT
            status,
            estimated_total_minor,
            final_total_minor,
            deposit_paid_minor,
            balance_due_minor,
            balance_paid_minor
          FROM bookings
          WHERE id = $1
          FOR UPDATE
        `,
        [input.bookingId],
      );
      const booking = bookingResult.rows[0];

      if (!booking) {
        return {
          success: false,
          code: "BOOKING_NOT_FOUND",
          message: "Booking was not found.",
        };
      }

      const currentBooking: BookingBalanceSnapshot = {
        bookingId: input.bookingId,
        status: booking.status,
        estimatedTotalMinor: booking.estimated_total_minor,
        finalTotalMinor: booking.final_total_minor,
        depositPaidMinor: booking.deposit_paid_minor,
        balanceDueMinor: booking.balance_due_minor,
        balancePaidMinor: booking.balance_paid_minor,
        currency: "GBP",
      };
      const currentValidationErrors = validateMarkBalancePaidInput(input, currentBooking);

      if (currentValidationErrors.length > 0) {
        return {
          success: false,
          code: "BALANCE_PAYMENT_VALIDATION_FAILED",
          message: currentValidationErrors.join(" "),
        };
      }

      const nextBalancePaidMinor = currentBooking.balancePaidMinor + input.amountPaidMinor;
      const nextBalanceDueMinor = calculateBalanceDueMinor({
        finalTotalMinor: currentBooking.finalTotalMinor,
        estimatedTotalMinor: currentBooking.estimatedTotalMinor,
        depositPaidMinor: currentBooking.depositPaidMinor,
        balancePaidMinor: nextBalancePaidMinor,
      });

      await client.query(
        `
          UPDATE bookings
          SET balance_paid_minor = $2,
            balance_due_minor = $3,
            updated_at = now()
          WHERE id = $1
        `,
        [input.bookingId, nextBalancePaidMinor, nextBalanceDueMinor],
      );

      await client.query(
        `
          INSERT INTO payments (
            id,
            booking_id,
            gateway,
            amount_minor,
            currency,
            status,
            payment_type,
            paid_at
          )
          VALUES ($1, $2, $3, $4, 'GBP', 'paid', 'balance', COALESCE($5::timestamptz, now()))
        `,
        [
          randomUUID(),
          input.bookingId,
          input.paymentMethod,
          input.amountPaidMinor,
          input.paidAt || null,
        ],
      );

      await client.query(
        `
          INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
          VALUES ($1, $2, 'booking', $3, 'balance_paid', $4::jsonb)
        `,
        [
          randomUUID(),
          input.adminId,
          input.bookingId,
          JSON.stringify({
            amountPaidMinor: input.amountPaidMinor,
            paymentMethod: input.paymentMethod,
            note: input.note?.trim() || null,
            previousBalancePaidMinor: currentBooking.balancePaidMinor,
            balancePaidMinor: nextBalancePaidMinor,
            previousBalanceDueMinor: currentBooking.balanceDueMinor,
            balanceDueMinor: nextBalanceDueMinor,
          }),
        ],
      );

      return {
        success: true,
        balancePaidMinor: nextBalancePaidMinor,
        balanceDueMinor: nextBalanceDueMinor,
        paymentStatus: getPaymentDisplayStatus({
          ...currentBooking,
          balancePaidMinor: nextBalancePaidMinor,
          balanceDueMinor: nextBalanceDueMinor,
        }),
      };
    });
  } catch {
    return {
      success: false,
      code: "BALANCE_PAYMENT_PERSISTENCE_FAILED",
      message: "Balance payment could not be saved.",
    };
  }
}
