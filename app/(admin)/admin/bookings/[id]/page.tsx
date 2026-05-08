import { AdminBookingDetail } from "../../../../../components/admin/AdminBookingDetail";
import {
  adminBookingDetailUsesMockData,
  getAdminBookingDetail,
} from "../../../../../lib/admin/booking-detail";

export const metadata = {
  title: "Booking Detail | AUTO VALET Admin",
  description: "AUTO VALET admin booking detail.",
};

type AdminBookingDetailPageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AdminBookingDetailPage({ params }: AdminBookingDetailPageProps) {
  const resolvedParams = await params;
  const booking = await getAdminBookingDetail(resolvedParams.id);

  return (
    <AdminBookingDetail
      backHref="/admin/calendar"
      backLabel="Back to calendar"
      booking={booking}
      isMockData={adminBookingDetailUsesMockData}
    />
  );
}
