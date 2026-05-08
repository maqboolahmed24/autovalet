export type DataRequestType =
  | "access"
  | "deletion"
  | "correction"
  | "marketing_consent_withdrawal";

export type DataRequestInput = {
  fullName: string;
  email: string;
  phone?: string;
  requestType: DataRequestType;
  message?: string;
};

export type DataRequestResult =
  | {
      success: true;
      requestReference: string;
    }
  | {
      success: false;
      code: string;
      message: string;
    };
