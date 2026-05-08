import { AdminEmptyState } from "../../../../components/admin/AdminEmptyState";
import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";

export const metadata = {
  title: "Settings | AUTO VALET Admin",
  description: "AUTO VALET admin settings placeholder.",
};

export default function AdminSettingsPage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Settings"
        title="Admin settings"
        description="Profile, security and notification settings will be managed here."
      />
      <AdminEmptyState
        title="Settings controls coming next"
        description="Admin authentication, security and notification providers are foundation-level only for now."
      />

      <div className="admin-more-grid" aria-label="Settings placeholders">
        <section className="admin-more-group" id="profile">
          <h2>Admin profile</h2>
          <p className="admin-inline-note">Profile details will be editable once admin sessions are connected.</p>
        </section>
        <section className="admin-more-group" id="security">
          <h2>Security</h2>
          <p className="admin-inline-note">Password, session and two-factor controls will be added after auth setup.</p>
        </section>
        <section className="admin-more-group" id="notifications">
          <h2>Notification settings</h2>
          <p className="admin-inline-note">Email and SMS preferences will be connected after provider setup.</p>
        </section>
      </div>
    </div>
  );
}
