import { randomUUID } from "node:crypto";
import {
  createUtcDateFromBusinessTime,
  generateAvailableSlots,
  type AvailabilityOverride,
  type CalendarBlockingBooking,
  type WorkingHoursRule,
} from "../availability";
import { assertBookingTransition } from "../booking/lifecycle";
import { createBookingReference } from "../booking/references";
import { calendarBlockingStatuses } from "../booking/statuses";
import { arePaymentsEnabled } from "../config/features";
import { transaction } from "../db/postgres";
import { normalizePostcode } from "../zones/normalize-postcode";
import { validateServiceZone } from "../zones/validate-zone";
import type { ZoneValidationOptions } from "../zones/types";
import {
  calculateBookingDurationWithAdminPricing,
  calculateBookingPriceWithAdminPricing,
  type AdminServicesPricingData,
} from "./services-pricing";
import {
  buildManualBookingDraft,
  validateManualBookingInput,
  type CreateManualBookingInput,
  type CreateManualBookingResult,
  type ManualBookingPreview,
} from "./manual-booking";

export type CreateManualBookingPersistenceOptions = {
  adminAuthenticated?: boolean;
  canCreateManualBooking?: boolean;
  persistenceConfigured?: boolean;
  existingBookings?: CalendarBlockingBooking[];
  workingHoursRules?: WorkingHoursRule[];
  availabilityOverrides?: AvailabilityOverride[];
  zoneValidationOptions: ZoneValidationOptions;
  pricingData: AdminServicesPricingData;
};

function calculatePersistentManualBookingPreview(
  input: CreateManualBookingInput,
  options: CreateManualBookingPersistenceOptions,
): ManualBookingPreview {
  const draft = buildManualBookingDraft(input);
  const normalizedPostcode = normalizePostcode(input.location.postcode);
  const zoneResult = validateServiceZone({
    postcode: normalizedPostcode,
    vehicleCount: input.service.vehicleCount,
  }, options.zoneValidationOptions);
  const price = calculateBookingPriceWithAdminPricing(draft, options.pricingData);
  const duration = calculateBookingDurationWithAdminPricing(draft, options.pricingData);
  const requestedStart = createUtcDateFromBusinessTime(input.schedule.date, input.schedule.startTime);
  const serviceEndsAt = new Date(requestedStart.getTime() + duration.serviceDurationMinutes * 60_000);
  const blockedUntil = new Date(requestedStart.getTime() + duration.blockedDurationMinutes * 60_000);
  const availableSlots = generateAvailableSlots({
    date: input.schedule.date,
    serviceDurationMinutes: duration.serviceDurationMinutes,
    travelBufferMinutes: duration.travelBufferMinutes,
    workingHoursRules: options.workingHoursRules,
    overrides: options.availabilityOverrides,
    existingBookings: options.existingBookings ?? [],
  });

  return {
    bookingReference: createBookingReference(),
    normalizedPostcode,
    zoneResult,
    price,
    duration,
    requestedStartAt: requestedStart.toISOString(),
    serviceEndsAt: serviceEndsAt.toISOString(),
    blockedUntil: blockedUntil.toISOString(),
    slotAvailable: availableSlots.some((slot) => slot.label === input.schedule.startTime),
  };
}

export async function createManualBooking(
  input: CreateManualBookingInput,
  options: CreateManualBookingPersistenceOptions,
): Promise<CreateManualBookingResult> {
  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_NOT_CONFIGURED",
      message: "Admin authentication is not configured.",
    };
  }

  if (!options.canCreateManualBooking) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account cannot create manual bookings.",
    };
  }

  const validationErrors = validateManualBookingInput(input);

  if (validationErrors.length > 0) {
    return {
      success: false,
      code: "MANUAL_BOOKING_VALIDATION_FAILED",
      message: "Check the manual booking details.",
      details: { errors: validationErrors },
    };
  }

  let preview: ManualBookingPreview;

  try {
    preview = calculatePersistentManualBookingPreview(input, options);
  } catch (error) {
    return {
      success: false,
      code: "MANUAL_BOOKING_PREVIEW_FAILED",
      message: error instanceof Error ? error.message : "Manual booking preview could not be calculated.",
    };
  }

  if (!preview.zoneResult.allowed) {
    return {
      success: false,
      code: "OUTSIDE_SERVICE_AREA",
      message: preview.zoneResult.message,
      details: { zoneResult: preview.zoneResult },
    };
  }

  if (!preview.slotAvailable) {
    return {
      success: false,
      code: "SLOT_UNAVAILABLE",
      message: "This time conflicts with working hours, blocked time or another booking.",
      details: {
        requestedStartAt: preview.requestedStartAt,
        blockedUntil: preview.blockedUntil,
      },
    };
  }

  if (input.status === "approved") {
    assertBookingTransition("pending_admin_review", "approved", {
      actor: "admin",
      reason: "manual booking created as approved",
    });
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "MANUAL_BOOKING_PERSISTENCE_NOT_CONFIGURED",
      message: "Manual booking database persistence is unavailable.",
      details: { preview },
    };
  }

  try {
    const bookingReference = preview.bookingReference;
    const customerId = randomUUID();
    const bookingId = randomUUID();
    const vehicleId = randomUUID();
    const paymentsEnabled = arePaymentsEnabled();
    const depositPaidMinor = paymentsEnabled && input.payment.depositStatus === "paid"
      ? input.payment.depositPaidMinor
      : 0;
    const balanceDueMinor = Math.max(preview.price.estimatedTotalMinor - depositPaidMinor, 0);

    await transaction(async (client) => {
      const conflictResult = await client.query<{ id: string }>(
        `
          SELECT id
          FROM bookings
          WHERE status = ANY($1::text[])
            AND requested_start_at < $3::timestamptz
            AND blocked_until > $2::timestamptz
          LIMIT 1
        `,
        [[...calendarBlockingStatuses], preview.requestedStartAt, preview.blockedUntil],
      );

      if (conflictResult.rows[0]) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      await client.query(
        `
          INSERT INTO customers (id, full_name, phone, email)
          VALUES ($1, $2, $3, $4)
        `,
        [
          customerId,
          input.customer.fullName.trim(),
          input.customer.phone.trim(),
          input.customer.email.trim().toLowerCase(),
        ],
      );

      await client.query(
        `
          INSERT INTO bookings (
            id,
            reference,
            customer_id,
            status,
            source,
            package_id,
            requested_start_at,
            service_ends_at,
            blocked_until,
            service_duration_minutes,
            travel_buffer_minutes,
            estimated_total_minor,
            final_total_minor,
            deposit_due_minor,
            deposit_paid_minor,
            balance_due_minor,
            balance_paid_minor,
            currency,
            full_address,
            postcode,
            normalized_postcode,
            zone_status,
            vehicle_count,
            parking_available,
            parking_notes,
            access_notes,
            extra_notes,
            marketing_photo_consent,
            admin_notes,
            approved_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6,
            $7::timestamptz, $8::timestamptz, $9::timestamptz,
            $10, $11, $12, NULL, $13, $14, $15, 0, 'GBP',
            $16, $17, $18, $19, $20, $21, $22, $23, '', false, $24,
            CASE WHEN $4 = 'approved' THEN now() ELSE NULL END
          )
        `,
        [
          bookingId,
          bookingReference,
          customerId,
          input.status,
          input.source,
          input.service.packageId,
          preview.requestedStartAt,
          preview.serviceEndsAt,
          preview.blockedUntil,
          preview.duration.serviceDurationMinutes,
          preview.duration.travelBufferMinutes,
          preview.price.estimatedTotalMinor,
          paymentsEnabled ? preview.price.depositDueMinor : 0,
          depositPaidMinor,
          balanceDueMinor,
          input.location.fullAddress.trim(),
          input.location.postcode.trim(),
          preview.normalizedPostcode,
          preview.zoneResult.zoneStatus,
          input.service.vehicleCount,
          input.location.parkingAvailable,
          input.location.parkingNotes.trim(),
          input.location.accessNotes.trim(),
          input.payment.notes.trim() || null,
        ],
      );

      await client.query(
        `
          INSERT INTO vehicles (id, booking_id, make, model, size, is_primary)
          VALUES ($1, $2, $3, $4, $5, true)
        `,
        [
          vehicleId,
          bookingId,
          input.vehicle.make.trim(),
          input.vehicle.model.trim(),
          input.vehicle.size,
        ],
      );

      for (const addonId of input.service.addons) {
        await client.query(
          `
            INSERT INTO booking_addons (id, booking_id, vehicle_id, addon_id)
            VALUES ($1, $2, $3, $4)
          `,
          [randomUUID(), bookingId, vehicleId, addonId],
        );
      }

      await client.query(
        `
          INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
          VALUES ($1, NULL, 'booking', $2, 'manual_booking_created', $3::jsonb)
        `,
        [
          randomUUID(),
          bookingId,
          JSON.stringify({
            reference: bookingReference,
            source: input.source,
            status: input.status,
          }),
        ],
      );
    });

    return {
      success: true,
      bookingReference,
      status: input.status,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") {
      return {
        success: false,
        code: "SLOT_UNAVAILABLE",
        message: "This time conflicts with working hours, blocked time or another booking.",
        details: {
          requestedStartAt: preview.requestedStartAt,
          blockedUntil: preview.blockedUntil,
        },
      };
    }

    return {
      success: false,
      code: "MANUAL_BOOKING_PERSISTENCE_FAILED",
      message: "Manual booking could not be saved.",
    };
  }
}
