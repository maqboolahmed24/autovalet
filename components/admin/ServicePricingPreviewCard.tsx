import type { AdminServicesPricingData } from "../../lib/admin/services-pricing";

type ServicePricingPreviewCardProps = {
  preview: AdminServicesPricingData["preview"];
};

export function ServicePricingPreviewCard({ preview }: ServicePricingPreviewCardProps) {
  return (
    <aside className="settings-card pricing-preview-card" aria-labelledby="pricing-preview-title">
      <div className="settings-card__header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2 id="pricing-preview-title">Estimate preview</h2>
          <p>{preview.title}</p>
        </div>
      </div>

      <dl className="settings-inline-list settings-inline-list--stacked">
        <div>
          <dt>Estimated total</dt>
          <dd>{preview.estimatedTotalLabel}</dd>
        </div>
        <div>
          <dt>Deposit due</dt>
          <dd>{preview.depositLabel}</dd>
        </div>
        <div>
          <dt>Service duration</dt>
          <dd>{preview.serviceDurationLabel}</dd>
        </div>
        <div>
          <dt>Calendar block</dt>
          <dd>{preview.blockedDurationLabel}</dd>
        </div>
      </dl>

      <p className="admin-inline-note">Preview values are estimates. Booking records keep their own price at booking.</p>
    </aside>
  );
}
