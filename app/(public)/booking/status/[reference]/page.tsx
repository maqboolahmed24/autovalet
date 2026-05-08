import { BookingStatusView } from "../../../../../components/booking/BookingStatusView";
import { createPublicMetadata } from "../../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("bookingStatus");

type BookingStatusPageProps = {
  params: Promise<{
    reference: string;
  }>;
};

export default async function BookingStatusPage({ params }: BookingStatusPageProps) {
  const resolvedParams = await params;

  return <BookingStatusView reference={resolvedParams.reference} />;
}
