import {
  defaultDepositSettings,
  isDepositType,
  updateDepositSettings as validateDepositSettingsUpdate,
  type DepositSettings,
  type DepositSettingsMutationOptions,
  type DepositSettingsMutationResult,
} from "./deposit-settings";
import { isDatabaseConfigured, query } from "../db/postgres";

export async function getPersistedDepositSettings(): Promise<DepositSettings> {
  if (!isDatabaseConfigured()) {
    return defaultDepositSettings;
  }

  const result = await query<{
    deposit_type: string;
    fixed_amount_minor: number;
    percentage: string | number;
    per_vehicle_amount_minor: number;
    minimum_deposit_minor: number;
    maximum_deposit_minor: number | null;
    transfer_allowed: boolean;
    policy_text: string;
  }>(
    `
      SELECT
        deposit_type,
        fixed_amount_minor,
        percentage,
        per_vehicle_amount_minor,
        minimum_deposit_minor,
        maximum_deposit_minor,
        transfer_allowed,
        policy_text
      FROM deposit_settings
      WHERE id = 'default'
      LIMIT 1
    `,
  );
  const row = result.rows[0];

  if (!row || !isDepositType(row.deposit_type)) {
    return defaultDepositSettings;
  }

  return {
    depositType: row.deposit_type,
    fixedAmountMinor: row.fixed_amount_minor,
    percentage: Number(row.percentage),
    perVehicleAmountMinor: row.per_vehicle_amount_minor,
    minimumDepositMinor: row.minimum_deposit_minor,
    maximumDepositMinor: row.maximum_deposit_minor ?? undefined,
    transferAllowed: row.transfer_allowed,
    policyText: row.policy_text,
  };
}

export async function updatePersistedDepositSettings(
  input: DepositSettings,
  options: DepositSettingsMutationOptions = {},
): Promise<DepositSettingsMutationResult> {
  const validation = await validateDepositSettingsUpdate(input, {
    ...options,
    persistenceConfigured: true,
  });

  if (!validation.success && validation.code !== "PERSISTENCE_NOT_CONFIGURED") {
    return validation;
  }

  if (!options.persistenceConfigured) {
    return {
      success: false,
      code: "PERSISTENCE_NOT_CONFIGURED",
      message: "Admin-managed deposit settings database persistence is unavailable.",
    };
  }

  await query(
    `
      INSERT INTO deposit_settings (
        id,
        deposit_type,
        fixed_amount_minor,
        percentage,
        per_vehicle_amount_minor,
        minimum_deposit_minor,
        maximum_deposit_minor,
        transfer_allowed,
        policy_text,
        updated_at
      )
      VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8, now())
      ON CONFLICT (id)
      DO UPDATE SET
        deposit_type = EXCLUDED.deposit_type,
        fixed_amount_minor = EXCLUDED.fixed_amount_minor,
        percentage = EXCLUDED.percentage,
        per_vehicle_amount_minor = EXCLUDED.per_vehicle_amount_minor,
        minimum_deposit_minor = EXCLUDED.minimum_deposit_minor,
        maximum_deposit_minor = EXCLUDED.maximum_deposit_minor,
        transfer_allowed = EXCLUDED.transfer_allowed,
        policy_text = EXCLUDED.policy_text,
        updated_at = now()
    `,
    [
      input.depositType,
      input.fixedAmountMinor,
      input.percentage,
      input.perVehicleAmountMinor,
      input.minimumDepositMinor,
      input.maximumDepositMinor ?? null,
      input.transferAllowed,
      input.policyText.trim(),
    ],
  );

  return {
    success: true,
    settings: input,
  };
}
