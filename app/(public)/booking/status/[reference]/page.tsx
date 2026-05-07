import { BookingStatusView } from "../../../../../components/booking/BookingStatusView";
import { createPublicMetadata } from "../../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("bookingStatus");

type BookingStatusPageProps = {
  params: {
    reference: string;
  };
};

export default function BookingStatusPage({ params }: BookingStatusPageProps) {
  return <BookingStatusView reference={params.reference} />;
}
