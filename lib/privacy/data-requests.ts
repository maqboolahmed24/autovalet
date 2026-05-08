import type { DataRequestInput, DataRequestResult, DataRequestType } from "./types";

export type { DataRequestInput, DataRequestType } from "./types";

export const dataRequestTypes: DataRequestType[] = [
  "access",
  "deletion",
  "correction",
  "marketing_consent_withdrawal",
];

export const dataRequestTypeLabels: Record<DataRequestType, string> = {
  access: "Access my data",
  deletion: "Delete my data",
  correction: "Correct my data",
  marketing_consent_withdrawal: "Withdraw marketing/photo consent",
};

export function isDataRequestType(value: unknown): value is DataRequestType {
  return typeof value === "string" && dataRequestTypes.includes(value as DataRequestType);
}

export function isValidDataRequestEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export function validateDataRequestInput(input: DataRequestInput): DataRequestResult | null {
  if (!input.fullName.trim()) {
    return {
      success: false,
      code: "DATA_REQUEST_NAME_REQUIRED",
      message: "Full name is required.",
    };
  }

  if (!isValidDataRequestEmail(input.email)) {
    return {
      success: false,
      code: "DATA_REQUEST_EMAIL_INVALID",
      message: "A valid email address is required.",
    };
  }

  if (!isDataRequestType(input.requestType)) {
    return {
      success: false,
      code: "DATA_REQUEST_TYPE_REQUIRED",
      message: "Choose a valid data request type.",
    };
  }

  return null;
}

export async function submitDataRequest(input: DataRequestInput): Promise<DataRequestResult> {
  const validation = validateDataRequestInput(input);

  if (validation) return validation;

  // TODO: Store the request and notify AUTO VALET once persistence/notification delivery is configured.
  return {
    success: false,
    code: "DATA_REQUEST_HANDLING_NOT_CONFIGURED",
    message: "Data request handling is not configured yet.",
  };
}
