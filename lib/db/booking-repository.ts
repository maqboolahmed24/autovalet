import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { CalendarBlockingBooking } from "../availability";
import { calendarBlockingStatuses } from "../booking/statuses";
import type {
  AddonId,
  BookingDraft,
  BookingStatus,
  PackageId,
  ParkingAvailability,
  VehicleSize,
  ZoneStatus,
} from "../booking/types";
import type { BookingRequestSnapshot } from "../booking/requests";
import { normalizePostcode } from "../zones";
import { query, transaction } from "./postgres";

export class SlotUnavailableError extends Error {
  constructor(message = "This time is no longer available. Please choose another slot.") {
    super(message);
    this.name = "SlotUnavailableError";
  }
}

export class BookingPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingPersistenceError";
  }
}

export type CreateBookingRequestRecordInput = {
  draft: BookingDraft;
  idempotencyKey: string;
  snapshot: BookingRequestSnapshot;
  zoneStatus: ZoneStatus;
};

export type CreateBookingRequestRecordResult = {
  bookingId: string;
  bookingReference: string;
  status: "pending_admin_review";
  created: boolean;
};

export type BookingListRecord = {
  id: string;
  reference: string;
  status: BookingStatus;
  packageId: PackageId;
  requestedStartAt: string;
  serviceEndsAt: string;
  blockedUntil: string;
  serviceDurationMinutes: number;
  travelBufferMinutes: number;
  estimatedTotalMinor: number;
  finalTotalMinor: number | null;
  depositDueMinor: number;
  depositPaidMinor: number;
  balanceDueMinor: number;
  balancePaidMinor: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleSize: VehicleSize;
  vehicleCount: number;
  fullAddress: string;
  postcode: string;
  zoneStatus: ZoneStatus;
  parkingAvailable: ParkingAvailability;
  parkingNotes: string;
  accessNotes: string;
  extraNotes: string;
  marketingPhotoConsent: boolean;
  adminNotes: string;
  declineReason: string;
  declineNotes: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  declinedAt: string;
};

export type BookingDetailVehicleRecord = {
  id: string;
  make: string;
  model: string;
  size: VehicleSize;
  isPrimary: boolean;
};

export type BookingDetailAddonRecord = {
  id: AddonId;
  vehicleId: string;
};

export type BookingDetailRecord = BookingListRecord & {
  vehicles: BookingDetailVehicleRecord[];
  addons: BookingDetailAddonRecord[];
};

type BookingRow = {
  id: string;
  reference: string;
  status: string;
  package_id: string;
  requested_start_at: Date | string;
  service_ends_at: Date | string;
  blocked_until: Date | string;
  service_duration_minutes: number;
  travel_buffer_minutes: number;
  estimated_total_minor: number;
  final_total_minor: number | null;
  deposit_due_minor: number;
  deposit_paid_minor: number;
  balance_due_minor: number;
  balance_paid_minor: number;
  full_address: string;
  postcode: string;
  zone_status: string;
  vehicle_count: number;
  parking_available: string;
  parking_notes: string | null;
  access_notes: string | null;
  extra_notes: string | null;
  marketing_photo_consent: boolean;
  admin_notes: string | null;
  decline_reason: string | null;
  decline_notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  approved_at: Date | string | null;
  declined_at: Date | string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_size: string | null;
};

type BlockingBookingRow = {
  id: string;
  status: string;
  requested_start_at: Date | string;
  blocked_until: Date | string;
};

type VehicleRow = {
  id: string;
  make: string;
  model: string;
  size: string;
  is_primary: boolean;
};

type AddonRow = {
  addon_id: string;
  vehicle_id: string;
};

type ExistingBookingRow = {
  id: string;
  reference: string;
  status: string;
};

function toIsoString(value: Date | string | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function asBookingStatus(value: string): BookingStatus {
  return value as BookingStatus;
}

function asPackageId(value: string): PackageId {
  return value as PackageId;
}

function asVehicleSize(value: string | null): VehicleSize {
  if (value === "small" || value === "medium" || value === "large_4x4") {
    return value;
  }

  return "small";
}

function asParkingAvailability(value: string): ParkingAvailability {
  if (value === "yes" || value === "no" || value === "unknown") {
    return value;
  }

  return "unknown";
}

function asZoneStatus(value: string): ZoneStatus {
  if (
    value === "standard_zone" ||
    value === "outside_zone_volume_exception" ||
    value === "outside_service_area"
  ) {
    return value;
  }

  return "outside_service_area";
}

function asAddonId(value: string): AddonId {
  return value as AddonId;
}

function mapBookingRow(row: BookingRow): BookingListRecord {
  return {
    id: row.id,
    reference: row.reference,
    status: asBookingStatus(row.status),
    packageId: asPackageId(row.package_id),
    requestedStartAt: toIsoString(row.requested_start_at),
    serviceEndsAt: toIsoString(row.service_ends_at),
    blockedUntil: toIsoString(row.blocked_until),
    serviceDurationMinutes: row.service_duration_minutes,
    travelBufferMinutes: row.travel_buffer_minutes,
    estimatedTotalMinor: row.estimated_total_minor,
    finalTotalMinor: row.final_total_minor,
    depositDueMinor: row.deposit_due_minor,
    depositPaidMinor: row.deposit_paid_minor,
    balanceDueMinor: row.balance_due_minor,
    balancePaidMinor: row.balance_paid_minor,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    vehicleMake: row.vehicle_make ?? "",
    vehicleModel: row.vehicle_model ?? "",
    vehicleSize: asVehicleSize(row.vehicle_size),
    vehicleCount: row.vehicle_count,
    fullAddress: row.full_address,
    postcode: row.postcode,
    zoneStatus: asZoneStatus(row.zone_status),
    parkingAvailable: asParkingAvailability(row.parking_available),
    parkingNotes: row.parking_notes ?? "",
    accessNotes: row.access_notes ?? "",
    extraNotes: row.extra_notes ?? "",
    marketingPhotoConsent: row.marketing_photo_consent,
    adminNotes: row.admin_notes ?? "",
    declineReason: row.decline_reason ?? "",
    declineNotes: row.decline_notes ?? "",
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    approvedAt: toIsoString(row.approved_at),
    declinedAt: toIsoString(row.declined_at),
  };
}

async function writeAuditLog(
  client: PoolClient,
  input: {
    adminId?: string | null;
    entityId: string;
    action: string;
    metadata?: Record<string, unknown>;
  },
) {
  await client.query(
    `
      INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
      VALUES ($1, $2, 'booking', $3, $4, $5::jsonb)
    `,
    [
      randomUUID(),
      input.adminId ?? null,
      input.entityId,
      input.action,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
}

async function findIdempotentBooking(client: PoolClient, idempotencyKey: string) {
  const result = await client.query<ExistingBookingRow>(
    `
      SELECT id, reference, status
      FROM bookings
      WHERE idempotency_key = $1
      LIMIT 1
    `,
    [idempotencyKey],
  );
  const row = result.rows[0];

  return row
    ? {
        bookingId: row.id,
        bookingReference: row.reference,
        status: asBookingStatus(row.status),
      }
    : null;
}

export async function getBookingRequestByIdempotencyKey(idempotencyKey: string) {
  const result = await query<ExistingBookingRow>(
    `
      SELECT id, reference, status
      FROM bookings
      WHERE idempotency_key = $1
      LIMIT 1
    `,
    [idempotencyKey],
  );
  const row = result.rows[0];

  return row
    ? {
        bookingId: row.id,
        bookingReference: row.reference,
        status: asBookingStatus(row.status),
      }
    : null;
}

async function findBlockingConflict(
  client: PoolClient,
  input: {
    requestedStartAt: string;
    blockedUntil: string;
    excludeBookingId?: string;
  },
) {
  const result = await client.query<ExistingBookingRow>(
    `
      SELECT id, reference, status
      FROM bookings
      WHERE status = ANY($1::text[])
        AND ($4::text IS NULL OR id <> $4)
        AND requested_start_at < $3::timestamptz
        AND blocked_until > $2::timestamptz
      LIMIT 1
    `,
    [
      [...calendarBlockingStatuses],
      input.requestedStartAt,
      input.blockedUntil,
      input.excludeBookingId ?? null,
    ],
  );

  return result.rows[0] ?? null;
}

export async function getBlockingBookingRecords(input: { excludeBookingId?: string } = {}) {
  const result = await query<BlockingBookingRow>(
    `
      SELECT id, status, requested_start_at, blocked_until
      FROM bookings
      WHERE status = ANY($1::text[])
        AND ($2::text IS NULL OR id <> $2)
      ORDER BY requested_start_at ASC
    `,
    [[...calendarBlockingStatuses], input.excludeBookingId ?? null],
  );

  return result.rows.map(
    (row): CalendarBlockingBooking => ({
      id: row.id,
      status: row.status,
      requestedStartAt: toIsoString(row.requested_start_at),
      blockedUntil: toIsoString(row.blocked_until),
    }),
  );
}

export async function createBookingRequestRecord(
  input: CreateBookingRequestRecordInput,
): Promise<CreateBookingRequestRecordResult> {
  const { draft, idempotencyKey, snapshot, zoneStatus } = input;

  if (!draft.packageId) {
    throw new BookingPersistenceError("Booking package is required.");
  }

  return transaction(async (client) => {
    const existingBooking = await findIdempotentBooking(client, idempotencyKey);

    if (existingBooking) {
      return {
        bookingId: existingBooking.bookingId,
        bookingReference: existingBooking.bookingReference,
        status: "pending_admin_review",
        created: false,
      };
    }

    const conflict = await findBlockingConflict(client, {
      requestedStartAt: snapshot.requestedStartAt,
      blockedUntil: snapshot.blockedUntil,
    });

    if (conflict) {
      throw new SlotUnavailableError();
    }

    const customerId = randomUUID();
    const bookingId = randomUUID();

    await client.query(
      `
        INSERT INTO customers (id, full_name, phone, email)
        VALUES ($1, $2, $3, $4)
      `,
      [
        customerId,
        draft.customer.fullName.trim(),
        draft.customer.phone.trim(),
        draft.customer.email.trim().toLowerCase(),
      ],
    );

    await client.query(
      `
        INSERT INTO bookings (
          id,
          reference,
          idempotency_key,
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
          marketing_photo_consent
        )
        VALUES (
          $1, $2, $3, $4, 'pending_admin_review', 'public_booking', $5,
          $6::timestamptz, $7::timestamptz, $8::timestamptz,
          $9, $10, $11, NULL, 0, 0, $11, 0, 'GBP',
          $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )
      `,
      [
        bookingId,
        snapshot.bookingReference,
        idempotencyKey,
        customerId,
        draft.packageId,
        snapshot.requestedStartAt,
        snapshot.serviceEndsAt,
        snapshot.blockedUntil,
        snapshot.duration.serviceDurationMinutes,
        snapshot.duration.travelBufferMinutes,
        snapshot.price.estimatedTotalMinor,
        draft.fullAddress.trim(),
        draft.postcode.trim(),
        normalizePostcode(draft.postcode),
        zoneStatus,
        draft.vehicleCount,
        draft.parkingAvailable,
        draft.parkingNotes.trim(),
        draft.accessNotes.trim(),
        draft.extraNotes.trim(),
        draft.marketingPhotoConsent,
      ],
    );

    for (const [index, vehicle] of draft.vehicles.entries()) {
      const vehicleId = randomUUID();

      await client.query(
        `
          INSERT INTO vehicles (id, booking_id, make, model, size, is_primary)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          vehicleId,
          bookingId,
          vehicle.make.trim(),
          vehicle.model.trim(),
          vehicle.size,
          index === 0,
        ],
      );

      for (const addonId of vehicle.addons) {
        await client.query(
          `
            INSERT INTO booking_addons (id, booking_id, vehicle_id, addon_id)
            VALUES ($1, $2, $3, $4)
          `,
          [randomUUID(), bookingId, vehicleId, addonId],
        );
      }
    }

    await writeAuditLog(client, {
      entityId: bookingId,
      action: "booking_request_created",
      metadata: {
        reference: snapshot.bookingReference,
        source: "public_booking",
        paymentsEnabled: false,
      },
    });

    return {
      bookingId,
      bookingReference: snapshot.bookingReference,
      status: "pending_admin_review",
      created: true,
    };
  });
}

const bookingListSelect = `
  SELECT
    b.id,
    b.reference,
    b.status,
    b.package_id,
    b.requested_start_at,
    b.service_ends_at,
    b.blocked_until,
    b.service_duration_minutes,
    b.travel_buffer_minutes,
    b.estimated_total_minor,
    b.final_total_minor,
    b.deposit_due_minor,
    b.deposit_paid_minor,
    b.balance_due_minor,
    b.balance_paid_minor,
    b.full_address,
    b.postcode,
    b.zone_status,
    b.vehicle_count,
    b.parking_available,
    b.parking_notes,
    b.access_notes,
    b.extra_notes,
    b.marketing_photo_consent,
    b.admin_notes,
    b.decline_reason,
    b.decline_notes,
    b.created_at,
    b.updated_at,
    b.approved_at,
    b.declined_at,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    c.email AS customer_email,
    v.make AS vehicle_make,
    v.model AS vehicle_model,
    v.size AS vehicle_size
  FROM bookings b
  INNER JOIN customers c ON c.id = b.customer_id
  LEFT JOIN LATERAL (
    SELECT make, model, size
    FROM vehicles
    WHERE booking_id = b.id
    ORDER BY is_primary DESC, created_at ASC
    LIMIT 1
  ) v ON true
`;

export async function listBookingRecords() {
  const result = await query<BookingRow>(
    `
      ${bookingListSelect}
      ORDER BY b.created_at DESC
      LIMIT 250
    `,
  );

  return result.rows.map(mapBookingRow);
}

export async function getBookingDetailRecord(idOrReference: string): Promise<BookingDetailRecord | null> {
  const bookingResult = await query<BookingRow>(
    `
      ${bookingListSelect}
      WHERE b.id = $1 OR b.reference = $1
      LIMIT 1
    `,
    [idOrReference],
  );
  const bookingRow = bookingResult.rows[0];

  if (!bookingRow) {
    return null;
  }

  const [vehicleResult, addonResult] = await Promise.all([
    query<VehicleRow>(
      `
        SELECT id, make, model, size, is_primary
        FROM vehicles
        WHERE booking_id = $1
        ORDER BY is_primary DESC, created_at ASC
      `,
      [bookingRow.id],
    ),
    query<AddonRow>(
      `
        SELECT addon_id, vehicle_id
        FROM booking_addons
        WHERE booking_id = $1
        ORDER BY created_at ASC
      `,
      [bookingRow.id],
    ),
  ]);

  return {
    ...mapBookingRow(bookingRow),
    vehicles: vehicleResult.rows.map((row) => ({
      id: row.id,
      make: row.make,
      model: row.model,
      size: asVehicleSize(row.size),
      isPrimary: row.is_primary,
    })),
    addons: addonResult.rows.map((row) => ({
      id: asAddonId(row.addon_id),
      vehicleId: row.vehicle_id,
    })),
  };
}

export async function approveBookingRecord(bookingId: string, adminId: string) {
  return transaction(async (client) => {
    const bookingResult = await client.query<{
      id: string;
      status: string;
      requested_start_at: Date | string;
      blocked_until: Date | string;
    }>(
      `
        SELECT id, status, requested_start_at, blocked_until
        FROM bookings
        WHERE id = $1
        FOR UPDATE
      `,
      [bookingId],
    );
    const booking = bookingResult.rows[0];

    if (!booking) {
      throw new BookingPersistenceError("Booking was not found.");
    }

    if (booking.status !== "pending_admin_review") {
      throw new BookingPersistenceError("Only bookings waiting for approval can be approved.");
    }

    const conflict = await findBlockingConflict(client, {
      requestedStartAt: toIsoString(booking.requested_start_at),
      blockedUntil: toIsoString(booking.blocked_until),
      excludeBookingId: booking.id,
    });

    if (conflict) {
      throw new SlotUnavailableError("Requested time has a calendar conflict.");
    }

    const updateResult = await client.query<{ approved_at: Date | string }>(
      `
        UPDATE bookings
        SET status = 'approved',
          approved_at = now(),
          updated_at = now()
        WHERE id = $1
        RETURNING approved_at
      `,
      [bookingId],
    );

    await writeAuditLog(client, {
      adminId,
      entityId: bookingId,
      action: "booking_approved",
    });

    return {
      approvedAt: toIsoString(updateResult.rows[0]?.approved_at),
    };
  });
}

export async function declineBookingRecord(input: {
  bookingId: string;
  adminId: string;
  reason: string;
  notes?: string;
}) {
  return transaction(async (client) => {
    const bookingResult = await client.query<{ id: string; status: string }>(
      `
        SELECT id, status
        FROM bookings
        WHERE id = $1
        FOR UPDATE
      `,
      [input.bookingId],
    );
    const booking = bookingResult.rows[0];

    if (!booking) {
      throw new BookingPersistenceError("Booking was not found.");
    }

    if (booking.status !== "pending_admin_review") {
      throw new BookingPersistenceError("Only bookings waiting for approval can be declined.");
    }

    await client.query(
      `
        UPDATE bookings
        SET status = 'declined',
          declined_at = now(),
          decline_reason = $2,
          decline_notes = $3,
          updated_at = now()
        WHERE id = $1
      `,
      [input.bookingId, input.reason, input.notes?.trim() ?? ""],
    );

    await writeAuditLog(client, {
      adminId: input.adminId,
      entityId: input.bookingId,
      action: "booking_declined",
      metadata: {
        reason: input.reason,
      },
    });

    return {
      declinedAt: new Date().toISOString(),
    };
  });
}
