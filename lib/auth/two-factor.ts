export type VerifyTwoFactorCodeInput = {
  adminId: string;
  code: string;
};

export type VerifyTwoFactorCodeResult =
  | {
      success: true;
    }
  | {
      success: false;
      code: "TWO_FACTOR_NOT_CONFIGURED" | "INVALID_TWO_FACTOR_CODE";
      message: string;
    };

export async function verifyTwoFactorCode(
  _input: VerifyTwoFactorCodeInput,
): Promise<VerifyTwoFactorCodeResult> {
  // TODO: Add TOTP or equivalent 2FA for owner accounts before production launch.
  return {
    success: false,
    code: "TWO_FACTOR_NOT_CONFIGURED",
    message: "Two-factor authentication is not configured yet.",
  };
}
