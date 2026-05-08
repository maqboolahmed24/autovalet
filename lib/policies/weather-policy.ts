import type { CancellationReason, WeatherRescheduleDecision } from "./types";

export const weatherCancellationReasons: CancellationReason[] = [
  "weather",
  "access_or_parking_issue",
  "vehicle_unsuitable",
  "admin_operational_issue",
];

export function isWeatherOrOperationalReason(reason: CancellationReason) {
  return weatherCancellationReasons.includes(reason);
}

export function evaluateWeatherReschedulePolicy(reason: CancellationReason): WeatherRescheduleDecision {
  if (reason === "weather") {
    return {
      shouldReschedule: true,
      recommendedDepositAction: "transfer",
      message: "Weather can make mobile detailing unsuitable. Transfer the deposit to a new agreed date.",
    };
  }

  if (reason === "access_or_parking_issue" || reason === "vehicle_unsuitable") {
    return {
      shouldReschedule: true,
      recommendedDepositAction: "transfer",
      message: "Access, parking or vehicle suitability issues can be rescheduled when AUTO VALET approves it.",
    };
  }

  if (reason === "admin_operational_issue") {
    return {
      shouldReschedule: true,
      recommendedDepositAction: "transfer",
      message: "Operational cancellations should offer a transfer or refund.",
    };
  }

  return {
    shouldReschedule: false,
    recommendedDepositAction: "keep_according_to_policy",
    message: "Use the standard cancellation policy for this reason.",
  };
}
