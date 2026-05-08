export type DeclineReason =
  | "outside_service_area"
  | "slot_no_longer_suitable"
  | "vehicle_or_service_unsuitable"
  | "customer_requested"
  | "duplicate_request"
  | "other";

export const declineReasons = [
  "outside_service_area",
  "slot_no_longer_suitable",
  "vehicle_or_service_unsuitable",
  "customer_requested",
  "duplicate_request",
  "other",
] as const satisfies readonly DeclineReason[];

export const declineReasonLabels: Record<DeclineReason, string> = {
  outside_service_area: "Outside service area",
  slot_no_longer_suitable: "Slot no longer suitable",
  vehicle_or_service_unsuitable: "Vehicle or service unsuitable",
  customer_requested: "Customer requested",
  duplicate_request: "Duplicate request",
  other: "Other",
};

export function isDeclineReason(value: unknown): value is DeclineReason {
  return declineReasons.includes(value as DeclineReason);
}
