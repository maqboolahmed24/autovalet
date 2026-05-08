import { AdminBookingCard } from "./AdminBookingCard";
import type { AdminRequestListItem } from "../../lib/admin/requests";

type AdminRequestGroupProps = {
  label: string;
  items: AdminRequestListItem[];
};

function getRequestActionLabel(status: AdminRequestListItem["status"]) {
  if (status === "payment_hold") {
    return "View hold";
  }

  if (status === "approved") {
    return "Open booking";
  }

  if (status === "declined") {
    return "View details";
  }

  return "Review";
}

function getGroupId(label: string) {
  return `admin-request-group-${label.toLowerCase().replace(/\s+/g, "-")}`;
}

export function AdminRequestGroup({ label, items }: AdminRequestGroupProps) {
  const headingId = getGroupId(label);

  return (
    <section className="admin-request-group" aria-labelledby={headingId}>
      <div className="admin-request-group__heading">
        <h2 id={headingId}>{label}</h2>
        <span>{items.length} request{items.length === 1 ? "" : "s"}</span>
      </div>

      <div className="admin-booking-list">
        {items.map((item) => (
          <AdminBookingCard
            actionLabel={getRequestActionLabel(item.status)}
            booking={{
              ...item,
              requestedStartLabel: item.requestedTimeLabel,
            }}
            key={item.id}
            variant="request"
          />
        ))}
      </div>
    </section>
  );
}
