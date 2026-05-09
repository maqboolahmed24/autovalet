import { AdminCustomersPage } from "../../../../components/admin/AdminCustomersPage";
import { getAdminCustomers } from "../../../../lib/admin/customers";

export const metadata = {
  title: "Customers | AUTO VALET Admin",
  description: "AUTO VALET admin customer records, vehicles and booking history.",
};

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type AdminCustomersPageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCustomersRoute({ searchParams }: AdminCustomersPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const search = getSearchParam(resolvedSearchParams.search)?.trim();
  const data = await getAdminCustomers({ search });

  return <AdminCustomersPage data={data} search={search} />;
}
