import { randomUUID } from "node:crypto";
import { canTransitionBookingStatus } from "../booking/lifecycle";
import type { BookingStatus } from "../booking/types";
import { transaction } from "../db/postgres";
import type { DepositAction, NoShowReason } from "../policies";

export type MarkNoShowInput = {
  bookingId: string;
  adminId: string;
  reason: NoShowReason;
  notes?: string;
};

export type MarkNoShowResult =
  | {
      success: true;
      bookingId: string;
      status: "no_show";
      depositAction: DepositAction;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type MarkNoShowOptions = {
  adminAuthenticated?: boolean;
  canMarkNoShow?: boolean;
  persistenceConfigured?: boolean;
  booking?: {
    id: string;
    status: BookingStatus;
    depositPaidMinor: number;
  };
};

const allowedNoShowStatuses = ["approved", "on_the_way", "arrived"] as const satisfies readonly BookingStatus[];

export function canMarkNoShowFromStatus(status: BookingStatus) {
  return (allowedNoShowStatuses as readonly BookingStatus[]).includes(status);
}

function validateMarkNoShowInput(input: MarkNoShowInput) {
  const errors: string[] = [];

  if (!input.bookingId.trim()) errors.push("Booking id is required.");
  if (!input.adminId.trim()) errors.push("Admin id is required.");
  if (!input.reason) errors.push("No-show reason is required.");

  return errors;
}

export async function markNoShow(
  input: MarkNoShowInput,
  options: MarkNoShowOptions = {},
): Promise<MarkNoShowResult> {
  const validationErrors = validateMarkNoShowInput(input);

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "NO_SHOW_VALIDATION_FAILED",
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

  if (!options.canMarkNoShow) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot mark no-show bookings.",
    };
  }

  if (!options.booking) {
    return {
      success: false,
      code: "BOOKING_LOOKUP_NOT_CONFIGURED",
      message: "Booking lookup is not connected yet.",
    };
  }

  if (!canMarkNoShowFromStatus(options.booking.status)) {
    return {
      success: false,
      code: "NO_SHOW_STATUS_NOT_ALLOWED",
      message: "No-show can only be recorded after approval and before the job starts.",
    };
  }

  const transition = canTransitionBookingStatus(options.booking.status, "no_show", {
    actor: "admin",
    reason: input.reason,
  });

  if (!transition.allowed) {
    return {
      success: false,
      code: "NO_SHOW_TRANSITION_BLOCKED",
      message: transition.message,
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "NO_SHOW_PERSISTENCE_NOT_CONFIGURED",
      message: "No-show persistence is not connected yet.",
    };
  }

  try {
    const updated = await transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `
          UPDATE bookings
          SET status = 'no_show',
            no_show_at = now(),
            no_show_reason = $2,
            no_show_notes = $3,
            updated_at = now()
          WHERE id = $1
          RETURNING id
        `,
        [input.bookingId, input.reason, input.notes?.trim() || null],
      );

      if (!result.rows[0]) {
        return false;
      }

      await client.query(
        `
          INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
          VALUES ($1, $2, 'booking', $3, 'booking_no_show', $4::jsonb)
        `,
        [
          randomUUID(),
          input.adminId,
          input.bookingId,
          JSON.stringify({
            reason: input.reason,
            depositAction: "no_deposit_action_required",
          }),
        ],
      );

      return true;
    });

    if (!updated) {
      return {
        success: false,
        code: "BOOKING_NOT_FOUND",
        message: "Booking was not found.",
      };
    }

    return {
      success: true,
      bookingId: input.bookingId,
      status: "no_show",
      depositAction: "no_deposit_action_required",
    };
  } catch {
    return {
      success: false,
      code: "NO_SHOW_PERSISTENCE_FAILED",
      message: "No-show could not be saved.",
    };
  }
}
