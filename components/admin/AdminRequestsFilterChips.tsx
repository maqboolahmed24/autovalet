import Link from "next/link";
import {
  adminRequestFilterLabels,
  adminRequestFilters,
  type AdminRequestFilter,
} from "../../lib/admin/requests";

type AdminRequestsFilterChipsProps = {
  activeFilter: AdminRequestFilter;
  counts: Record<AdminRequestFilter, number>;
  search?: string;
};

function buildFilterHref(filter: AdminRequestFilter, search?: string) {
  const params = new URLSearchParams();
  params.set("filter", filter);

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return `/admin/requests?${params.toString()}`;
}

export function AdminRequestsFilterChips({
  activeFilter,
  counts,
  search,
}: AdminRequestsFilterChipsProps) {
  return (
    <nav className="admin-filter-chips" aria-label="Request filters">
      {adminRequestFilters.map((filter) => {
        const isActive = filter === activeFilter;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`admin-filter-chip${isActive ? " is-active" : ""}`}
            href={buildFilterHref(filter, search)}
            key={filter}
          >
            <span>{adminRequestFilterLabels[filter]}</span>
            <small>{counts[filter]}</small>
          </Link>
        );
      })}
    </nav>
  );
}
