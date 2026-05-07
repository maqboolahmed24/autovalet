import { AdminManualBookingForm } from "../../../../../components/admin/AdminManualBookingForm";

export const metadata = {
  title: "Add Booking | AUTO VALET Admin",
  description: "Create a manual AUTO VALET booking from phone, WhatsApp, Instagram or referral enquiries.",
};

export default function NewAdminBookingPage() {
  return <AdminManualBookingForm />;
}
