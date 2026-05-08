import { AdminEmptyState } from "./AdminEmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import type { AdminDataRequestsData } from "../../lib/admin/data-requests";

type AdminDataRequestsPageProps = {
  data: AdminDataRequestsData;
};

export function AdminDataRequestsPage({ data }: AdminDataRequestsPageProps) {
  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Privacy"
        title="Data requests"
        description="Review customer requests for access, correction, deletion and marketing/photo consent withdrawal."
      />

      {data.requests.length > 0 ? (
        <div className="admin-request-groups">
          <section className="admin-request-group" aria-labelledby="data-requests-title">
            <h2 id="data-requests-title">Recent data requests</h2>
            <div className="admin-booking-list">
              {data.requests.map((request) => (
                <article className="booking-card booking-card--compact" key={request.id}>
                  <div className="booking-card__topline">
                    <span>{request.reference}</span>
                    <span className="status-badge status-badge--pending">{request.statusLabel}</span>
                  </div>

                  <div className="booking-card__main">
                    <div>
                      <strong>{request.fullName}</strong>
                      <span>{request.requestTypeLabel}</span>
                    </div>
                    <time>{request.createdAtLabel}</time>
                  </div>

                  <div className="booking-card__meta">
                    <span>{request.email}</span>
                    {request.phone ? <span>{request.phone}</span> : null}
                  </div>

                  {request.message ? <p className="info-card__note">{request.message}</p> : null}
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <AdminEmptyState
          title="No data requests yet."
          description="Customer privacy requests submitted from the public form will appear here."
        />
      )}
    </div>
  );
}
