import Link from "next/link";
import { AdminEmptyState } from "./AdminEmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminRequestGroup } from "./AdminRequestGroup";
import { AdminRequestsFilterChips } from "./AdminRequestsFilterChips";
import { AdminRequestsSearch } from "./AdminRequestsSearch";
import type { AdminRequestFilter, AdminRequestsInboxData } from "../../lib/admin/requests";

type AdminRequestsInboxProps = {
  activeFilter: AdminRequestFilter;
  data: AdminRequestsInboxData;
  isMockData?: boolean;
  search?: string;
};

function getEmptyState(activeFilter: AdminRequestFilter, search?: string) {
  if (search?.trim()) {
    return {
      title: "No matching requests.",
      description: "Try a different customer name, postcode or reference.",
    };
  }

  if (activeFilter !== "needs_review") {
    return {
      title: "No requests in this view.",
      description: "Change the filter or search to check another request queue.",
    };
  }

  return {
    title: "No requests waiting.",
    description: "New booking requests will appear here.",
  };
}

export function AdminRequestsInbox({
  activeFilter,
  data,
  isMockData = false,
  search,
}: AdminRequestsInboxProps) {
  const emptyState = getEmptyState(activeFilter, search);

  return (
    <div className="admin-page admin-requests-inbox">
      <AdminPageHeader
        eyebrow="Requests"
        title="Booking requests"
        description="Review booking requests, outside-zone enquiries and reschedule decisions."
        actions={
          <Link className="ghost-button" href="/admin/bookings/new">
            Add booking
          </Link>
        }
      />

      <div className="admin-requests-inbox__controls">
        {isMockData ? (
          <div className="admin-inline-note">
            Requests data is placeholder until database persistence is connected.
          </div>
        ) : null}

        <AdminRequestsFilterChips activeFilter={activeFilter} counts={data.counts} search={search} />
        <AdminRequestsSearch activeFilter={activeFilter} defaultValue={search} />
      </div>

      {data.groups.length > 0 ? (
        <div className="admin-request-groups">
          {data.groups.map((group) => (
            <AdminRequestGroup items={group.items} key={group.label} label={group.label} />
          ))}
        </div>
      ) : (
        <AdminEmptyState title={emptyState.title} description={emptyState.description} />
      )}
    </div>
  );
}
