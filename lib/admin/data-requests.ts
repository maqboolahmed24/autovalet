import { dataRequestTypeLabels } from "../privacy/data-request-types";
import type { DataRequestType } from "../privacy/types";
import { isDatabaseConfigured, query } from "../db/postgres";

export type AdminDataRequestStatus = "received" | "in_review" | "completed" | "rejected";

export type AdminDataRequestItem = {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  phone?: string;
  requestType: DataRequestType;
  requestTypeLabel: string;
  status: AdminDataRequestStatus;
  statusLabel: string;
  message?: string;
  createdAtLabel: string;
  completedAtLabel?: string;
};

export type AdminDataRequestsData = {
  isMockData: boolean;
  requests: AdminDataRequestItem[];
};

type DataRequestRow = {
  id: string;
  reference: string;
  full_name: string;
  email: string;
  phone: string | null;
  request_type: string;
  message: string | null;
  status: string;
  created_at: Date | string;
  completed_at: Date | string | null;
};

const dataRequestStatusLabels: Record<AdminDataRequestStatus, string> = {
  received: "Received",
  in_review: "In review",
  completed: "Completed",
  rejected: "Rejected",
};

export async function getAdminDataRequests(): Promise<AdminDataRequestsData> {
  if (!isDatabaseConfigured()) {
    return {
      isMockData: false,
      requests: [],
    };
  }

  const result = await query<DataRequestRow>(`
    SELECT
      id,
      reference,
      full_name,
      email,
      phone,
      request_type,
      message,
      status,
      created_at,
      completed_at
    FROM privacy_data_requests
    ORDER BY created_at DESC
    LIMIT 250
  `);

  return {
    isMockData: false,
    requests: result.rows.map(toAdminDataRequestItem),
  };
}

function toAdminDataRequestItem(row: DataRequestRow): AdminDataRequestItem {
  const requestType = toDataRequestType(row.request_type);
  const status = toDataRequestStatus(row.status);

  return {
    id: row.id,
    reference: row.reference,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? undefined,
    requestType,
    requestTypeLabel: dataRequestTypeLabels[requestType],
    status,
    statusLabel: dataRequestStatusLabels[status],
    message: row.message ?? undefined,
    createdAtLabel: formatDateLabel(row.created_at),
    completedAtLabel: row.completed_at ? formatDateLabel(row.completed_at) : undefined,
  };
}

function toDataRequestType(value: string): DataRequestType {
  if (
    value === "access" ||
    value === "deletion" ||
    value === "correction" ||
    value === "marketing_consent_withdrawal"
  ) {
    return value;
  }

  return "access";
}

function toDataRequestStatus(value: string): AdminDataRequestStatus {
  if (value === "received" || value === "in_review" || value === "completed" || value === "rejected") {
    return value;
  }

  return "received";
}

function formatDateLabel(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
