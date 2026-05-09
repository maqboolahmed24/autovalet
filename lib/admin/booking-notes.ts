import { randomUUID } from "node:crypto";
import { transaction } from "../db/postgres";

export type UpdateBookingAdminNotesInput = {
  bookingId: string;
  adminId: string;
  notes: string;
};

export type UpdateBookingAdminNotesResult =
  | {
      success: true;
      bookingId: string;
      notes: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export async function updateBookingAdminNotes(
  input: UpdateBookingAdminNotesInput,
): Promise<UpdateBookingAdminNotesResult> {
  if (!input.bookingId.trim()) {
    return {
      success: false,
      code: "BOOKING_ID_REQUIRED",
      message: "Booking id is required.",
    };
  }

  const notes = input.notes.trim();

  try {
    const updated = await transaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `
          UPDATE bookings
          SET admin_notes = $2,
            updated_at = now()
          WHERE id = $1
          RETURNING id
        `,
        [input.bookingId, notes || null],
      );

      if (!result.rows[0]) {
        return false;
      }

      await client.query(
        `
          INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
          VALUES ($1, $2, 'booking', $3, 'admin_notes_updated', $4::jsonb)
        `,
        [
          randomUUID(),
          input.adminId,
          input.bookingId,
          JSON.stringify({ hasNotes: Boolean(notes) }),
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
      notes,
    };
  } catch {
    return {
      success: false,
      code: "BOOKING_NOTES_PERSISTENCE_FAILED",
      message: "Admin notes could not be saved.",
    };
  }
}
