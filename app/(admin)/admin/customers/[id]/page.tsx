import { notFound } from "next/navigation";
import { CustomerProfilePage } from "../../../../../components/admin/CustomerProfilePage";
import { getAdminCustomerProfile } from "../../../../../lib/admin/customers";

export const metadata = {
  title: "Customer Profile | AUTO VALET Admin",
  description: "AUTO VALET admin customer profile with vehicles, notes and booking history.",
};

export const dynamic = "force-dynamic";

type CustomerProfileRouteProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function CustomerProfileRoute({ params }: CustomerProfileRouteProps) {
  const resolvedParams = await params;
  const data = await getAdminCustomerProfile(resolvedParams.id);

  if (!data) {
    return notFound();
  }

  return <CustomerProfilePage data={data} />;
}
