import { AdminLoginForm } from "../../../../components/admin/AdminLoginForm";
import { isAdminSessionConfigured } from "../../../../lib/auth/session";

export const metadata = {
  title: "Admin Login | AUTO VALET",
  description: "Sign in to manage AUTO VALET bookings, requests and payments.",
};

export default function AdminLoginPage() {
  return (
    <section className="admin-login-page" aria-labelledby="admin-login-title">
      <div className="admin-login-page__card">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-login-title">Sign in to AUTO VALET.</h1>
        <p>Manage booking requests, approvals, payment records and customer operations.</p>
        <AdminLoginForm authConfigured={isAdminSessionConfigured()} />
      </div>
    </section>
  );
}
