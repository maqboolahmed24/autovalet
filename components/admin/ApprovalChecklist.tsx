import type { ApprovalCheck } from "../../lib/admin/booking-detail";

type ApprovalChecklistProps = {
  checks: ApprovalCheck[];
};

export function ApprovalChecklist({ checks }: ApprovalChecklistProps) {
  return (
    <section className="checklist-card" aria-labelledby="approval-checklist-title">
      <h2 id="approval-checklist-title">Approval checklist</h2>
      <div className="checklist">
        {checks.map((check) => (
          <div className={`check-row check-row--${check.state}`} key={check.label}>
            <span className="check-icon" aria-hidden="true" />
            <p>
              <strong>{check.label}</strong>
              {check.message ? <span>{check.message}</span> : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
