import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";
import { getAdminAuthStatus } from "../../../../lib/auth/session";
import { arePaymentsEnabled } from "../../../../lib/config/features";
import { isDatabaseConfigured } from "../../../../lib/db/postgres";

export const metadata = {
  title: "Settings | AUTO VALET Admin",
  description: "AUTO VALET admin configuration status.",
};

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const authStatus = getAdminAuthStatus();
  const databaseConfigured = isDatabaseConfigured();
  const paymentsEnabled = arePaymentsEnabled();

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Settings"
        title="Admin configuration"
        description="Current production switches and connection status for the admin workspace."
      />

      <div className="admin-more-grid" aria-label="Admin configuration status">
        <section className="admin-more-group" id="profile">
          <h2>Admin access</h2>
          <dl className="settings-inline-list">
            <div>
              <dt>Owner login</dt>
              <dd>{authStatus.configured ? "Configured" : "Needs environment setup"}</dd>
            </div>
            <div>
              <dt>Session cookie</dt>
              <dd>{authStatus.configured ? "HTTP-only session enabled" : authStatus.message}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-more-group" id="security">
          <h2>Database</h2>
          <dl className="settings-inline-list">
            <div>
              <dt>Postgres</dt>
              <dd>{databaseConfigured ? "Connected through DATABASE_URL" : "DATABASE_URL missing"}</dd>
            </div>
            <div>
              <dt>Admin data</dt>
              <dd>{databaseConfigured ? "Bookings, notes, zones, pricing, availability and gallery persist" : "Read-only defaults"}</dd>
            </div>
          </dl>
        </section>
        <section className="admin-more-group" id="notifications">
          <h2>Booking mode</h2>
          <dl className="settings-inline-list">
            <div>
              <dt>Payments</dt>
              <dd>{paymentsEnabled ? "Enabled" : "Disabled"}</dd>
            </div>
            <div>
              <dt>Customer flow</dt>
              <dd>{paymentsEnabled ? "Payment hold before review" : "Direct booking request for admin review"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
