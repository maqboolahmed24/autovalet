import type { BookingStatus } from "../../lib/booking/types";
import {
  evaluateCancellationPolicy,
  getDepositActionLabel,
  getDepositPolicySummary,
  type CancellationActor,
  type CancellationReason,
} from "../../lib/policies";

type CancellationPolicyCardProps = {
  bookingStatus: BookingStatus;
  actor?: CancellationActor;
  reason?: CancellationReason;
  appointmentStartAt?: string;
  depositPaidMinor: number;
};

export function CancellationPolicyCard({
  bookingStatus,
  actor = "admin",
  reason = "admin_operational_issue",
  appointmentStartAt,
  depositPaidMinor,
}: CancellationPolicyCardProps) {
  const decision = evaluateCancellationPolicy({
    bookingStatus,
    actor,
    reason,
    appointmentStartAt,
    depositPaidMinor,
  });

  return (
    <section className="admin-policy-card" aria-labelledby="cancellation-policy-title">
      <div className="admin-policy-card__header">
        <p className="eyebrow">Policy</p>
        <h2 id="cancellation-policy-title">Cancellation and deposit policy</h2>
      </div>

      <div className="admin-policy-card__decision">
        <span>{decision.allowed ? "Action available" : "Action blocked"}</span>
        <strong>{getDepositActionLabel(decision.defaultDepositAction)}</strong>
        <p>{decision.message}</p>
      </div>

      <ul className="admin-policy-list">
        {getDepositPolicySummary().map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
