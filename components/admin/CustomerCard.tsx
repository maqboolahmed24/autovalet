import Link from "next/link";
import type { AdminCustomerListItem } from "../../lib/admin/customers";

type CustomerCardProps = {
  customer: AdminCustomerListItem;
};

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <article className="customer-card">
      <div className="customer-card__header">
        <div>
          <h2>{customer.fullName}</h2>
          <p>{customer.email}</p>
          <p>{customer.phone}</p>
        </div>
        <span>{customer.totalBookings} booking{customer.totalBookings === 1 ? "" : "s"}</span>
      </div>

      <div className="customer-card__meta">
        {customer.lastBookingLabel ? <p>Last booking: {customer.lastBookingLabel}</p> : null}
        {customer.vehicleSummary ? <p>Vehicle: {customer.vehicleSummary}</p> : null}
        {customer.locationSummary ? <p>Latest area: {customer.locationSummary}</p> : null}
      </div>

      <div className="customer-card__footer">
        <Link className="ghost-button" href={customer.href}>
          Open profile
        </Link>
      </div>
    </article>
  );
}
