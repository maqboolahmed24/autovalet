import { randomBytes, randomUUID } from "node:crypto";
import { isDatabaseConfigured, transaction } from "../db/postgres";
import { dataRequestTypeLabels, dataRequestTypes, isDataRequestType } from "./data-request-types";
import type { DataRequestInput, DataRequestResult, DataRequestType } from "./types";

export type { DataRequestInput, DataRequestType } from "./types";
export { dataRequestTypeLabels, dataRequestTypes, isDataRequestType } from "./data-request-types";

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

  if (!isDatabaseConfigured()) {
    return {
      success: false,
      code: "DATA_REQUEST_STORAGE_UNAVAILABLE",
      message: "Data request storage is unavailable. Please contact AUTO VALET directly.",
    };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const requestId = randomUUID();
    const requestReference = createDataRequestReference();

    try {
      await transaction(async (client) => {
        await client.query(
          `
            INSERT INTO privacy_data_requests (
              id,
              reference,
              full_name,
              email,
              phone,
              request_type,
              message,
              status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'received')
          `,
          [
            requestId,
            requestReference,
            input.fullName.trim(),
            input.email.trim().toLowerCase(),
            input.phone?.trim() || null,
            input.requestType,
            input.message?.trim() || null,
          ],
        );
        await client.query(
          `
            INSERT INTO audit_logs (id, admin_id, entity_type, entity_id, action, metadata)
            VALUES ($1, NULL, 'privacy_data_request', $2, 'privacy_data_request_received', $3::jsonb)
          `,
          [
            randomUUID(),
            requestId,
            JSON.stringify({
              reference: requestReference,
              requestType: input.requestType,
            }),
          ],
        );
      });

      return {
        success: true,
        requestReference,
      };
    } catch (error) {
      if (isUniqueConstraintError(error) && attempt < 2) {
        continue;
      }

      return {
        success: false,
        code: "DATA_REQUEST_STORAGE_FAILED",
        message: "Data request could not be saved. Please try again.",
      };
    }
  }

  return {
    success: false,
    code: "DATA_REQUEST_STORAGE_FAILED",
    message: "Data request could not be saved. Please try again.",
  };
}

function createDataRequestReference() {
  const year = new Date().getFullYear();
  const token = randomBytes(3).toString("hex").toUpperCase();

  return `DR-${year}-${token}`;
}

function isUniqueConstraintError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "23505",
  );
}
