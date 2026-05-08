import { CustomerCard } from "./CustomerCard";
import type { AdminCustomerListItem } from "../../lib/admin/customers";

type CustomerListProps = {
  customers: AdminCustomerListItem[];
};

export function CustomerList({ customers }: CustomerListProps) {
  return (
    <section className="customer-list" aria-label="Customer list">
      {customers.map((customer) => (
        <CustomerCard customer={customer} key={customer.id} />
      ))}
    </section>
  );
}
