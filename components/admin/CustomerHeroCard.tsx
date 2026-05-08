import { ContactActions } from "./ContactActions";
import type { AdminCustomerProfileData } from "../../lib/admin/customers";

type CustomerHeroCardProps = {
  customer: AdminCustomerProfileData["customer"];
};

export function CustomerHeroCard({ customer }: CustomerHeroCardProps) {
  return (
    <section className="customer-hero-card" aria-labelledby="customer-profile-title">
      <p className="eyebrow">Customer profile</p>
      <h1 id="customer-profile-title">{customer.fullName}</h1>

      <div className="customer-hero-card__details">
        <p>{customer.phone}</p>
        <p>{customer.email}</p>
      </div>

      <dl className="customer-hero-card__stats">
        <div>
          <dt>Total bookings</dt>
          <dd>{customer.totalBookings}</dd>
        </div>
        <div>
          <dt>Last booking</dt>
          <dd>{customer.lastBookingLabel ?? "No bookings yet"}</dd>
        </div>
        <div>
          <dt>Latest area</dt>
          <dd>{customer.latestLocationLabel ?? "Not recorded"}</dd>
        </div>
      </dl>

      <ContactActions phone={customer.phone} email={customer.email} />
    </section>
  );
}
