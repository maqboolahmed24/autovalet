import type { BookingStatus, PackageId, VehicleSize } from "../booking/types";
import { getAdminBookingStatusLabel } from "../booking/status-labels";
import { getServicePackage, vehicleSizeLabels } from "../pricing/catalog";
import { formatMoneyGBP } from "../pricing/format-money";
import { isDatabaseConfigured, query } from "../db/postgres";

export type AdminCustomersSearchInput = {
  search?: string;
};

export type AdminCustomerListItem = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  lastBookingLabel?: string;
  totalBookings: number;
  vehicleSummary?: string;
  locationSummary?: string;
  href: string;
};

export type AdminCustomersData = {
  isMockData: boolean;
  customers: AdminCustomerListItem[];
};

export type AdminCustomerVehicle = {
  id: string;
  make: string;
  model: string;
  size: VehicleSize;
  sizeLabel: string;
  lastServiceLabel?: string;
  bookingCount: number;
};

export type AdminCustomerBookingHistoryItem = {
  id: string;
  reference: string;
  status: BookingStatus;
  statusLabel: string;
  dateLabel: string;
  serviceLabel: string;
  vehicleLabel: string;
  estimatedTotalLabel: string;
  finalTotalLabel?: string;
  href: string;
};

export type AdminCustomerNote = {
  id: string;
  note: string;
  createdBy: string;
  createdAtLabel: string;
  updatedAtLabel?: string;
};

export type AdminCustomerProfileData = {
  isMockData: boolean;
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    totalBookings: number;
    lastBookingLabel?: string;
    latestLocationLabel?: string;
  };
  vehicles: AdminCustomerVehicle[];
  bookingHistory: AdminCustomerBookingHistoryItem[];
  notes: AdminCustomerNote[];
};

export type AddCustomerNoteInput = {
  customerId: string;
  note: string;
  adminId: string;
};

export type CustomerNoteMutationResult =
  | {
      success: true;
      noteId: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export type CustomerNoteMutationOptions = {
  adminAuthenticated?: boolean;
  canEditCustomers?: boolean;
  persistenceConfigured?: boolean;
};

type MockCustomerRecord = Omit<AdminCustomerProfileData, "isMockData"> & {
  searchText: string;
};

type CustomerListRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  total_bookings: string | number;
  last_requested_start_at: Date | string | null;
  latest_postcode: string | null;
  vehicle_summary: string | null;
};

type CustomerRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  total_bookings: string | number;
  last_requested_start_at: Date | string | null;
  latest_postcode: string | null;
};

type CustomerVehicleRow = {
  id: string;
  make: string;
  model: string;
  size: string;
  booking_count: string | number;
  last_package_id: string | null;
};

type CustomerBookingRow = {
  id: string;
  reference: string;
  status: string;
  package_id: string;
  requested_start_at: Date | string;
  estimated_total_minor: number;
  final_total_minor: number | null;
  vehicle_label: string | null;
};

const mockCustomers: MockCustomerRecord[] = [
  {
    customer: {
      id: "customer-sarah-wilson",
      fullName: "Sarah Wilson",
      phone: "07123 456789",
      email: "sarah@example.com",
      totalBookings: 4,
      lastBookingLabel: "18 May 2026",
      latestLocationLabel: "CR0 1AA",
    },
    vehicles: [
      {
        id: "vehicle-range-rover",
        make: "Range Rover",
        model: "Evoque",
        size: "large_4x4",
        sizeLabel: vehicleSizeLabels.large_4x4,
        lastServiceLabel: "Deep Clean",
        bookingCount: 3,
      },
      {
        id: "vehicle-mini",
        make: "Mini",
        model: "Cooper",
        size: "small",
        sizeLabel: vehicleSizeLabels.small,
        lastServiceLabel: "Maintenance",
        bookingCount: 1,
      },
    ],
    bookingHistory: [
      createBookingHistoryItem({
        id: "booking-demo-1",
        reference: "AV-2026-DEMO1",
        status: "pending_admin_review",
        dateLabel: "18 May 2026",
        serviceLabel: "Deep Clean",
        vehicleLabel: "Range Rover Evoque",
        estimatedTotalMinor: 22000,
        href: "/admin/requests/booking-demo-1",
      }),
      createBookingHistoryItem({
        id: "booking-demo-4",
        reference: "AV-2026-0042",
        status: "completed",
        dateLabel: "22 Apr 2026",
        serviceLabel: "Maintenance",
        vehicleLabel: "Mini Cooper",
        estimatedTotalMinor: 5500,
        finalTotalMinor: 5500,
        href: "/admin/bookings/booking-demo-4",
      }),
    ],
    notes: [
      {
        id: "note-sarah-1",
        note: "Prefers morning appointments where possible. Check parking restrictions before approval.",
        createdBy: "AUTO VALET Admin",
        createdAtLabel: "6 May 2026",
        updatedAtLabel: "6 May 2026",
      },
    ],
    searchText: "sarah wilson 07123 456789 sarah@example.com cr0 1aa range rover evoque mini cooper",
  },
  {
    customer: {
      id: "customer-amir-khan",
      fullName: "Amir Khan",
      phone: "07900 111222",
      email: "amir@example.com",
      totalBookings: 2,
      lastBookingLabel: "20 May 2026",
      latestLocationLabel: "BR1 2AB",
    },
    vehicles: [
      {
        id: "vehicle-bmw",
        make: "BMW",
        model: "3 Series",
        size: "medium",
        sizeLabel: vehicleSizeLabels.medium,
        lastServiceLabel: "Maintenance",
        bookingCount: 2,
      },
    ],
    bookingHistory: [
      createBookingHistoryItem({
        id: "booking-demo-2",
        reference: "AV-2026-DEMO2",
        status: "approved",
        dateLabel: "20 May 2026",
        serviceLabel: "Maintenance",
        vehicleLabel: "BMW 3 Series",
        estimatedTotalMinor: 9500,
        href: "/admin/bookings/booking-demo-2",
      }),
    ],
    notes: [],
    searchText: "amir khan 07900 111222 amir@example.com br1 2ab bmw 3 series",
  },
  {
    customer: {
      id: "customer-leah-patel",
      fullName: "Leah Patel",
      phone: "07700 900123",
      email: "leah@example.com",
      totalBookings: 1,
      lastBookingLabel: "Expired hold",
      latestLocationLabel: "SE25 5AA",
    },
    vehicles: [
      {
        id: "vehicle-audi",
        make: "Audi",
        model: "Q5",
        size: "large_4x4",
        sizeLabel: vehicleSizeLabels.large_4x4,
        lastServiceLabel: "Deep Clean",
        bookingCount: 1,
      },
    ],
    bookingHistory: [
      createBookingHistoryItem({
        id: "booking-demo-3",
        reference: "AV-2026-DEMO3",
        status: "expired",
        dateLabel: "12 May 2026",
        serviceLabel: "Deep Clean",
        vehicleLabel: "Audi Q5",
        estimatedTotalMinor: 17000,
        href: "/admin/requests/booking-demo-3",
      }),
    ],
    notes: [
      {
        id: "note-leah-1",
        note: "Asked about pet hair removal before booking. Keep any sensitive condition notes private.",
        createdBy: "AUTO VALET Admin",
        createdAtLabel: "1 May 2026",
      },
    ],
    searchText: "leah patel 07700 900123 leah@example.com se25 5aa audi q5",
  },
];

export async function getAdminCustomers(input: AdminCustomersSearchInput): Promise<AdminCustomersData> {
  if (!isDatabaseConfigured()) {
    return {
      isMockData: false,
      customers: [],
    };
  }

  const result = await query<CustomerListRow>(`
    SELECT
      c.id,
      c.full_name,
      c.phone,
      c.email,
      count(b.id) AS total_bookings,
      max(b.requested_start_at) AS last_requested_start_at,
      (array_agg(b.postcode ORDER BY b.requested_start_at DESC NULLS LAST))[1] AS latest_postcode,
      (array_agg(trim(concat_ws(' ', v.make, v.model)) ORDER BY b.requested_start_at DESC NULLS LAST))[1] AS vehicle_summary
    FROM customers c
    LEFT JOIN bookings b ON b.customer_id = c.id
    LEFT JOIN LATERAL (
      SELECT make, model
      FROM vehicles
      WHERE booking_id = b.id
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1
    ) v ON true
    GROUP BY c.id, c.full_name, c.phone, c.email, c.created_at
    ORDER BY max(b.created_at) DESC NULLS LAST, c.created_at DESC
    LIMIT 250
  `);
  const search = input.search?.trim().toLowerCase();
  const customers = result.rows.map(toDatabaseCustomerListItem).filter((customer) => {
    if (!search) return true;

    return [
      customer.fullName,
      customer.phone,
      customer.email,
      customer.vehicleSummary,
      customer.locationSummary,
    ].filter(Boolean).join(" ").toLowerCase().includes(search);
  });

  return {
    isMockData: false,
    customers,
  };
}

export async function getAdminCustomerProfile(id: string): Promise<AdminCustomerProfileData | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const customerResult = await query<CustomerRow>(
    `
      SELECT
        c.id,
        c.full_name,
        c.phone,
        c.email,
        count(b.id) AS total_bookings,
        max(b.requested_start_at) AS last_requested_start_at,
        (array_agg(b.postcode ORDER BY b.requested_start_at DESC NULLS LAST))[1] AS latest_postcode
      FROM customers c
      LEFT JOIN bookings b ON b.customer_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, c.full_name, c.phone, c.email
      LIMIT 1
    `,
    [id],
  );
  const customer = customerResult.rows[0];

  if (!customer) {
    return null;
  }

  const [vehiclesResult, bookingsResult] = await Promise.all([
    query<CustomerVehicleRow>(
      `
        SELECT
          v.id,
          v.make,
          v.model,
          v.size,
          count(DISTINCT b.id) AS booking_count,
          (array_agg(b.package_id ORDER BY b.requested_start_at DESC))[1] AS last_package_id
        FROM vehicles v
        INNER JOIN bookings b ON b.id = v.booking_id
        WHERE b.customer_id = $1
        GROUP BY v.id, v.make, v.model, v.size
        ORDER BY max(b.requested_start_at) DESC
        LIMIT 50
      `,
      [id],
    ),
    query<CustomerBookingRow>(
      `
        SELECT
          b.id,
          b.reference,
          b.status,
          b.package_id,
          b.requested_start_at,
          b.estimated_total_minor,
          b.final_total_minor,
          trim(concat_ws(' ', v.make, v.model)) AS vehicle_label
        FROM bookings b
        LEFT JOIN LATERAL (
          SELECT make, model
          FROM vehicles
          WHERE booking_id = b.id
          ORDER BY is_primary DESC, created_at ASC
          LIMIT 1
        ) v ON true
        WHERE b.customer_id = $1
        ORDER BY b.requested_start_at DESC
        LIMIT 100
      `,
      [id],
    ),
  ]);

  return {
    isMockData: false,
    customer: {
      id: customer.id,
      fullName: customer.full_name,
      phone: customer.phone,
      email: customer.email,
      totalBookings: toNumber(customer.total_bookings),
      lastBookingLabel: customer.last_requested_start_at
        ? formatDateLabel(customer.last_requested_start_at)
        : undefined,
      latestLocationLabel: customer.latest_postcode ?? undefined,
    },
    vehicles: vehiclesResult.rows.map(toDatabaseCustomerVehicle),
    bookingHistory: bookingsResult.rows.map(toDatabaseBookingHistoryItem),
    notes: [],
  };
}

export async function addCustomerNote(
  input: AddCustomerNoteInput,
  options: CustomerNoteMutationOptions = {},
): Promise<CustomerNoteMutationResult> {
  const guard = validateCustomerNoteMutationOptions(options);

  if (guard) {
    return guard;
  }

  if (!input.customerId.trim()) {
    return {
      success: false,
      code: "CUSTOMER_ID_REQUIRED",
      message: "Choose a customer before adding a note.",
    };
  }

  if (!input.note.trim()) {
    return {
      success: false,
      code: "CUSTOMER_NOTE_REQUIRED",
      message: "Add a private note before saving.",
    };
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "PERSISTENCE_NOT_CONFIGURED",
      message: "Customer notes are not connected to database persistence yet.",
    };
  }

  return {
    success: false,
    code: "PERSISTENCE_NOT_CONFIGURED",
    message: "Customer notes are not connected to database persistence yet.",
  };
}

function toCustomerListItem(record: MockCustomerRecord): AdminCustomerListItem {
  const latestVehicle = record.vehicles[0];

  return {
    id: record.customer.id,
    fullName: record.customer.fullName,
    phone: record.customer.phone,
    email: record.customer.email,
    lastBookingLabel: record.customer.lastBookingLabel,
    totalBookings: record.customer.totalBookings,
    vehicleSummary: latestVehicle ? `${latestVehicle.make} ${latestVehicle.model}` : undefined,
    locationSummary: record.customer.latestLocationLabel,
    href: `/admin/customers/${record.customer.id}`,
  };
}

function toDatabaseCustomerListItem(row: CustomerListRow): AdminCustomerListItem {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    lastBookingLabel: row.last_requested_start_at ? formatDateLabel(row.last_requested_start_at) : undefined,
    totalBookings: toNumber(row.total_bookings),
    vehicleSummary: row.vehicle_summary || undefined,
    locationSummary: row.latest_postcode ?? undefined,
    href: `/admin/customers/${encodeURIComponent(row.id)}`,
  };
}

function toDatabaseCustomerVehicle(row: CustomerVehicleRow): AdminCustomerVehicle {
  const size = toVehicleSize(row.size);

  return {
    id: row.id,
    make: row.make,
    model: row.model,
    size,
    sizeLabel: vehicleSizeLabels[size],
    lastServiceLabel: row.last_package_id ? getServicePackage(toPackageId(row.last_package_id)).label : undefined,
    bookingCount: toNumber(row.booking_count),
  };
}

function toDatabaseBookingHistoryItem(row: CustomerBookingRow): AdminCustomerBookingHistoryItem {
  const status = row.status as BookingStatus;
  const href = status === "pending_admin_review" || status === "payment_hold"
    ? `/admin/requests/${encodeURIComponent(row.id)}`
    : `/admin/bookings/${encodeURIComponent(row.id)}`;

  return {
    id: row.id,
    reference: row.reference,
    status,
    statusLabel: getAdminBookingStatusLabel(status),
    dateLabel: formatDateLabel(row.requested_start_at),
    serviceLabel: getServicePackage(toPackageId(row.package_id)).label,
    vehicleLabel: row.vehicle_label || "Vehicle",
    estimatedTotalLabel: formatMoneyGBP(row.estimated_total_minor),
    finalTotalLabel: typeof row.final_total_minor === "number"
      ? formatMoneyGBP(row.final_total_minor)
      : undefined,
    href,
  };
}

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function toVehicleSize(value: string): VehicleSize {
  if (value === "small" || value === "medium" || value === "large_4x4") {
    return value;
  }

  return "small";
}

function toPackageId(value: string): PackageId {
  return value === "deep_clean" ? "deep_clean" : "maintenance";
}

function formatDateLabel(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function createBookingHistoryItem(input: {
  id: string;
  reference: string;
  status: BookingStatus;
  dateLabel: string;
  serviceLabel: string;
  vehicleLabel: string;
  estimatedTotalMinor: number;
  finalTotalMinor?: number;
  href: string;
}): AdminCustomerBookingHistoryItem {
  return {
    id: input.id,
    reference: input.reference,
    status: input.status,
    statusLabel: getAdminBookingStatusLabel(input.status),
    dateLabel: input.dateLabel,
    serviceLabel: input.serviceLabel,
    vehicleLabel: input.vehicleLabel,
    estimatedTotalLabel: formatMoneyGBP(input.estimatedTotalMinor),
    finalTotalLabel: typeof input.finalTotalMinor === "number" ? formatMoneyGBP(input.finalTotalMinor) : undefined,
    href: input.href,
  };
}

function validateCustomerNoteMutationOptions(
  options: CustomerNoteMutationOptions,
): Extract<CustomerNoteMutationResult, { success: false }> | null {
  if (!options.adminAuthenticated) {
    return {
      success: false,
      code: "ADMIN_AUTH_REQUIRED",
      message: "Admin sign-in is required.",
    };
  }

  if (!options.canEditCustomers) {
    return {
      success: false,
      code: "ADMIN_PERMISSION_REQUIRED",
      message: "The admin account does not have permission to edit customers.",
    };
  }

  return null;
}
