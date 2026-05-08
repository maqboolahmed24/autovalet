import Link from "next/link";
import { AdminAlertCard } from "./AdminAlertCard";
import { AdminBookingCard } from "./AdminBookingCard";
import { AdminEmptyState } from "./AdminEmptyState";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminSectionTitle } from "./AdminSectionTitle";
import { SummaryCard } from "./SummaryCard";
import type { AdminDashboardData } from "../../lib/admin/dashboard";
import { formatMoneyGBP } from "../../lib/pricing/format-money";

type AdminTodayDashboardProps = {
  data: AdminDashboardData;
};

export function AdminTodayDashboard({ data }: AdminTodayDashboardProps) {
  return (
    <div className="admin-page admin-dashboard">
      <AdminPageHeader
        eyebrow="Today"
        title="Today dashboard"
        description={
          data.isMockData
            ? "Placeholder operational data while database persistence is being connected."
            : "Jobs, requests and payment attention for today."
        }
      />

      <section className="admin-dashboard__section" aria-labelledby="today-summary-title">
        <AdminSectionTitle eyebrow="Overview" id="today-summary-title" title="What needs attention" />
        <div className="admin-summary-grid">
          <SummaryCard label="Pending" value={String(data.summary.pendingCount)} note="Need review" />
          <SummaryCard label="Today" value={String(data.summary.todayJobsCount)} note="Approved jobs" />
          <SummaryCard
            label="Deposits"
            value={formatMoneyGBP(data.summary.depositsThisWeekMinor)}
            note={data.isMockData ? "Mock this week" : "This week"}
          />
          <SummaryCard
            label="Estimate"
            value={formatMoneyGBP(data.summary.estimatedRevenueThisWeekMinor)}
            note={data.isMockData ? "Mock estimate" : "Estimated"}
          />
        </div>
      </section>

      <section className="admin-dashboard__section" aria-labelledby="dashboard-alerts-title">
        <AdminSectionTitle eyebrow="Alerts" id="dashboard-alerts-title" title="Needs attention" />
        <div className="admin-alert-list">
          {data.alerts.map((alert) => (
            <AdminAlertCard alert={alert} key={alert.id} />
          ))}
        </div>
      </section>

      <section className="admin-dashboard__section" aria-labelledby="next-job-title">
        <AdminSectionTitle eyebrow="Next job" id="next-job-title" title="Next job" />
        {data.nextJob ? (
          <AdminBookingCard booking={data.nextJob} />
        ) : (
          <AdminEmptyState
            title="No jobs today."
            description="Your day is clear. You can still add blocked time or check upcoming requests."
            action={{ href: "/admin/availability", label: "Block time" }}
          />
        )}
      </section>

      <section className="admin-dashboard__section" aria-labelledby="needs-review-title">
        <AdminSectionTitle
          eyebrow="Needs review"
          id="needs-review-title"
          title="Pending requests"
          action={<Link className="ghost-button" href="/admin/requests">View all</Link>}
        />
        {data.needsReview.length > 0 ? (
          <div className="admin-booking-list">
            {data.needsReview.map((booking) => (
              <AdminBookingCard booking={booking} key={booking.id} variant="compact" />
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No requests waiting."
            description="New paid booking requests will appear here."
          />
        )}
      </section>

      <section className="admin-dashboard__section" aria-labelledby="today-preview-title">
        <AdminSectionTitle
          eyebrow="Timeline"
          id="today-preview-title"
          title="Today preview"
          action={<Link className="ghost-button" href="/admin/calendar">Open calendar</Link>}
        />
        {data.todayJobs.length > 0 ? (
          <div className="admin-timeline-preview">
            {data.todayJobs.map((booking) => (
              <div className="admin-timeline-preview__item" key={booking.id}>
                <time>{booking.requestedStartLabel}</time>
                <div>
                  <strong>{booking.serviceLabel}</strong>
                  <span>{booking.vehicleLabel} · {booking.locationLabel}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No jobs today."
            description="Your day is clear. You can still add blocked time or check upcoming requests."
            action={{ href: "/admin/availability", label: "Block time" }}
          />
        )}
      </section>

      <section className="admin-dashboard__section" aria-labelledby="quick-actions-title">
        <AdminSectionTitle eyebrow="Actions" id="quick-actions-title" title="Quick actions" />
        <AdminQuickActions />
      </section>
    </div>
  );
}
