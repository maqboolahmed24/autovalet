import { notFound } from "next/navigation";
import { AdminBookingDetail } from "../../../../../components/admin/AdminBookingDetail";
import {
  adminBookingDetailUsesMockData,
  getAdminBookingDetail,
} from "../../../../../lib/admin/booking-detail";

export const metadata = {
  title: "Request Detail | AUTO VALET Admin",
  description: "AUTO VALET admin booking request detail.",
};

export const dynamic = "force-dynamic";

type AdminRequestDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminRequestDetailPage({ params }: AdminRequestDetailPageProps) {
  const resolvedParams = await params;
  const booking = await getAdminBookingDetail(resolvedParams.id);

  if (!booking) {
    return notFound();
  }

  return (
    <AdminBookingDetail
      backHref="/admin/requests"
      backLabel="Back to requests"
      booking={booking}
      isMockData={adminBookingDetailUsesMockData}
    />
  );
}
