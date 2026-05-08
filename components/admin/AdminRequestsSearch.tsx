import type { AdminRequestFilter } from "../../lib/admin/requests";

type AdminRequestsSearchProps = {
  activeFilter: AdminRequestFilter;
  defaultValue?: string;
};

export function AdminRequestsSearch({ activeFilter, defaultValue }: AdminRequestsSearchProps) {
  return (
    <form action="/admin/requests" className="admin-search">
      <label htmlFor="admin-request-search">Search requests</label>
      <div className="admin-search__row">
        <input
          id="admin-request-search"
          name="search"
          defaultValue={defaultValue}
          placeholder="Name, reference, postcode or vehicle"
        />
        <input name="filter" type="hidden" value={activeFilter} />
        <button className="ghost-button" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}
