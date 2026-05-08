import { AdminEmptyState } from "./AdminEmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import { CustomerList } from "./CustomerList";
import { CustomerSearchBar } from "./CustomerSearchBar";
import type { AdminCustomersData } from "../../lib/admin/customers";

type AdminCustomersPageProps = {
  data: AdminCustomersData;
  search?: string;
};

export function AdminCustomersPage({ data, search }: AdminCustomersPageProps) {
  return (
    <div className="admin-page customer-page">
      <AdminPageHeader
        eyebrow="Customers"
        title="Customer records"
        description="View customer details, vehicles and booking history from approved and requested jobs."
      />

      <section className="customer-notice" aria-label="Customer data notice">
        <strong>{data.isMockData ? "Placeholder customer records" : "Customer records"}</strong>
        <p>Customer data is private admin-only information. Use it only for booking and service management.</p>
      </section>

      <CustomerSearchBar search={search} />

      {data.customers.length > 0 ? (
        <CustomerList customers={data.customers} />
      ) : (
        <AdminEmptyState
          title={search ? "No matching customers." : "No customers yet."}
          description={
            search
              ? "Try a different customer name, phone, email, postcode or vehicle."
              : "Customer records will appear here once booking persistence is connected."
          }
        />
      )}
    </div>
  );
}
