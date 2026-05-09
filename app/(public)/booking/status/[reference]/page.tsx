import { BookingStatusView } from "../../../../../components/booking/BookingStatusView";
import { getPublicBookingStatus } from "../../../../../lib/booking/status-lookup";
import { createPublicMetadata } from "../../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("bookingStatus");
export const dynamic = "force-dynamic";

type BookingStatusPageProps = {
  params: Promise<{
    reference: string;
  }>;
};

export default async function BookingStatusPage({ params }: BookingStatusPageProps) {
  const resolvedParams = await params;
  const booking = await getPublicBookingStatus(decodeURIComponent(resolvedParams.reference));

  return <BookingStatusView booking={booking} reference={resolvedParams.reference} />;
}
