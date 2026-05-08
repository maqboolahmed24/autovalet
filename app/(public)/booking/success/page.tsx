import { BookingOutcomeCard } from "../../../../components/booking/BookingOutcomeCard";
import { createPublicMetadata } from "../../../../lib/seo/public-metadata";

export const metadata = createPublicMetadata("bookingSuccess");

type SearchParams = {
  reference?: string | string[];
};

type BookingSuccessPageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

function getReference(searchParams: SearchParams) {
  const reference = Array.isArray(searchParams.reference)
    ? searchParams.reference[0]
    : searchParams.reference;

  return reference?.trim() || "";
}

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const reference = getReference(resolvedSearchParams);
  const statusAction = reference
    ? {
        href: `/booking/status/${encodeURIComponent(reference)}`,
        label: "Check booking status",
      }
    : {
        href: "/booking",
        label: "Check booking status",
        disabled: true,
        disabledReason: "Booking reference was not returned.",
      };

  return (
    <BookingOutcomeCard
      variant="status"
      eyebrow="Booking request"
      title="Booking request received."
      primaryAction={statusAction}
      secondaryAction={{
        href: "/",
        label: "Back to home",
      }}
    >
      {reference ? <p>Reference: {reference}</p> : null}
      <p>
        Your request has been sent to AUTO VALET for manual review. No online payment has been
        taken.
      </p>
      <div className="booking-outcome__notice">
        <strong>Your appointment is not confirmed yet.</strong>
        <p>AUTO VALET must approve the request before any appointment is confirmed.</p>
      </div>
    </BookingOutcomeCard>
  );
}
