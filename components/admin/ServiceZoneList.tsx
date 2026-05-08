import { ServiceZoneCard } from "./ServiceZoneCard";
import type { AdminServiceZoneItem } from "../../lib/admin/service-zones";

type ServiceZoneListProps = {
  zones: AdminServiceZoneItem[];
  onAdd: () => void;
  onEdit: (zone: AdminServiceZoneItem) => void;
};

export function ServiceZoneList({ zones, onAdd, onEdit }: ServiceZoneListProps) {
  return (
    <section className="settings-card service-zone-list" aria-labelledby="service-zone-list-title">
      <div className="settings-card__header">
        <div>
          <p className="eyebrow">Areas</p>
          <h2 id="service-zone-list-title">Service zone list</h2>
          <p>Postcodes, districts and regions that customers can check before submitting.</p>
        </div>
        <button className="ghost-button" type="button" onClick={onAdd}>
          Add zone
        </button>
      </div>

      {zones.length > 0 ? (
        <div className="service-zone-list__items">
          {zones.map((zone) => (
            <ServiceZoneCard key={zone.id} zone={zone} onEdit={() => onEdit(zone)} />
          ))}
        </div>
      ) : (
        <div className="settings-empty-state">
          <strong>No zones yet</strong>
          <p>Add at least one service zone before launch so customers can check their area.</p>
        </div>
      )}
    </section>
  );
}
