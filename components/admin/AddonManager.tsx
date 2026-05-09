import { AdminEmptyState } from "./AdminEmptyState";
import type { AdminAddonItem } from "../../lib/admin/services-pricing";

type AddonManagerProps = {
  addons: AdminAddonItem[];
  onEdit: (addon: AdminAddonItem) => void;
};

export function AddonManager({ addons, onEdit }: AddonManagerProps) {
  return (
    <section className="settings-card addon-manager" aria-labelledby="addon-manager-title">
      <div className="settings-card__header">
        <div>
          <p className="eyebrow">Add-ons</p>
          <h2 id="addon-manager-title">Add-ons and durations</h2>
          <p>Extras affect the booking estimate and the requested slot duration.</p>
        </div>
      </div>

      {addons.length > 0 ? (
        <div className="addon-manager__grid">
          {addons.map((addon) => (
            <article className="addon-card" key={addon.id}>
              <div>
                <span className={`settings-badge${addon.active ? " settings-badge--active" : " settings-badge--muted"}`}>
                  {addon.active ? "Active" : "Inactive"}
                </span>
                <strong>{addon.label}</strong>
              </div>
              <dl className="settings-inline-list">
                <div>
                  <dt>Price</dt>
                  <dd>{addon.priceLabel}</dd>
                </div>
                <div>
                  <dt>Extra time</dt>
                  <dd>{addon.extraDurationMinutes} mins</dd>
                </div>
              </dl>
              <button className="ghost-button" type="button" onClick={() => onEdit(addon)}>
                Edit add-on
              </button>
            </article>
          ))}
        </div>
      ) : (
        <AdminEmptyState
          title="No add-ons active"
          description="Active add-ons will appear here after they are added or re-enabled."
        />
      )}
    </section>
  );
}
