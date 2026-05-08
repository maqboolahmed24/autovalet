import type { DataRequestType } from "./types";

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
