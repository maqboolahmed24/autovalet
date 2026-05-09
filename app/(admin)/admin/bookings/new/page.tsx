import { AdminManualBookingForm } from "../../../../../components/admin/AdminManualBookingForm";
import { getAdminServicesPricing } from "../../../../../lib/admin/services-pricing";

export const metadata = {
  title: "Add Booking | AUTO VALET Admin",
  description: "Create a manual AUTO VALET booking from phone, WhatsApp, Instagram or referral enquiries.",
};

export const dynamic = "force-dynamic";

export default async function NewAdminBookingPage() {
  const pricingData = await getAdminServicesPricing();

  return <AdminManualBookingForm pricingData={pricingData} />;
}
