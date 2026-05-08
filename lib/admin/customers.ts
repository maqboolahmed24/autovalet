import type { BookingStatus, VehicleSize } from "../booking/types";
import { getAdminBookingStatusLabel } from "../booking/status-labels";
import { vehicleSizeLabels } from "../pricing/catalog";
import { formatMoneyGBP } from "../pricing/format-money";

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
  // TODO: Replace mock customer search with database-backed customer, vehicle and booking queries.
  const search = input.search?.trim().toLowerCase();
  const customers = (search
    ? mockCustomers.filter((customer) => customer.searchText.includes(search))
    : mockCustomers
  ).map(toCustomerListItem);

  return {
    isMockData: true,
    customers,
  };
}

export async function getAdminCustomerProfile(id: string): Promise<AdminCustomerProfileData | null> {
  // TODO: Replace mock lookup with a database-backed customer profile query.
  const record = mockCustomers.find((customer) => customer.customer.id === id);

  if (!record) {
    return null;
  }

  return {
    isMockData: true,
    customer: record.customer,
    vehicles: record.vehicles,
    bookingHistory: record.bookingHistory,
    notes: record.notes,
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
