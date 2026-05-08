import type { AdminCustomerVehicle } from "../../lib/admin/customers";

type CustomerVehicleListProps = {
  vehicles: AdminCustomerVehicle[];
};

export function CustomerVehicleList({ vehicles }: CustomerVehicleListProps) {
  return (
    <section className="customer-section-card" aria-labelledby="customer-vehicles-title">
      <div className="customer-section-card__header">
        <p className="eyebrow">Vehicles</p>
        <h2 id="customer-vehicles-title">Vehicle history</h2>
      </div>

      {vehicles.length > 0 ? (
        <div className="customer-vehicle-list">
          {vehicles.map((vehicle) => (
            <article className="customer-vehicle-card" key={vehicle.id}>
              <div>
                <strong>{vehicle.make} {vehicle.model}</strong>
                <span>{vehicle.sizeLabel}</span>
              </div>
              <dl>
                <div>
                  <dt>Bookings</dt>
                  <dd>{vehicle.bookingCount}</dd>
                </div>
                <div>
                  <dt>Last service</dt>
                  <dd>{vehicle.lastServiceLabel ?? "Not recorded"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p className="customer-section-card__empty">No vehicle history yet.</p>
      )}
    </section>
  );
}
