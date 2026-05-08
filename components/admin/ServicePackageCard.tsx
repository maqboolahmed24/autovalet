import type { AdminServicePackage } from "../../lib/admin/services-pricing";

type ServicePackageCardProps = {
  servicePackage: AdminServicePackage;
  onEdit: () => void;
};

export function ServicePackageCard({ servicePackage, onEdit }: ServicePackageCardProps) {
  return (
    <section className="settings-card service-package-card" aria-labelledby={`service-package-${servicePackage.id}`}>
      <div className="settings-card__header">
        <div>
          <p className="eyebrow">Package</p>
          <h2 id={`service-package-${servicePackage.id}`}>{servicePackage.label}</h2>
          <p>{servicePackage.description}</p>
        </div>
        <span className={`settings-badge${servicePackage.active ? " settings-badge--active" : " settings-badge--muted"}`}>
          {servicePackage.active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="pricing-row-list">
        {servicePackage.variants.map((variant) => (
          <div className="pricing-row" key={variant.vehicleSize}>
            <div>
              <strong>{variant.vehicleSizeLabel}</strong>
              <span>{variant.durationMinutes} mins</span>
            </div>
            <b>{variant.priceLabel}</b>
          </div>
        ))}
      </div>

      <p className="admin-inline-note">Package duration affects requested slot availability.</p>

      <div className="settings-card-actions">
        <button className="ghost-button" type="button" onClick={onEdit}>
          Edit package
        </button>
      </div>
    </section>
  );
}
