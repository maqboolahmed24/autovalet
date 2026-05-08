import { AdminServicesPricingPage } from "../../../../components/admin/AdminServicesPricingPage";
import { getAdminServicesPricing } from "../../../../lib/admin/services-pricing";

export const metadata = {
  title: "Services & Pricing | AUTO VALET Admin",
  description: "AUTO VALET services, vehicle-size pricing, add-ons and duration settings.",
};

export default async function ServicesPricingPage() {
  const data = await getAdminServicesPricing();

  return <AdminServicesPricingPage data={data} />;
}
