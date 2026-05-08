import { AdminRequestsInbox } from "../../../../components/admin/AdminRequestsInbox";
import {
  adminRequestsInboxUsesMockData,
  getAdminRequestsInboxData,
  parseAdminRequestFilter,
} from "../../../../lib/admin/requests";

export const metadata = {
  title: "Requests | AUTO VALET Admin",
  description: "AUTO VALET booking requests inbox for paid requests, holds and reschedules.",
};

type SearchParams = Record<string, string | string[] | undefined>;

type AdminRequestsPageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminRequestsPage({ searchParams }: AdminRequestsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filter = parseAdminRequestFilter(getSearchParam(resolvedSearchParams.filter));
  const search = getSearchParam(resolvedSearchParams.search)?.trim();
  const data = await getAdminRequestsInboxData({ filter, search });

  return (
    <AdminRequestsInbox
      activeFilter={filter}
      data={data}
      isMockData={adminRequestsInboxUsesMockData}
      search={search}
    />
  );
}
