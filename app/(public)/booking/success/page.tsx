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
      eyebrow="Payment return"
      title="Booking status unavailable."
      primaryAction={statusAction}
      secondaryAction={{
        href: "/",
        label: "Back to home",
      }}
    >
      {reference ? <p>Reference: {reference}</p> : null}
      <p>
        Online booking confirmation is not connected yet. No payment or appointment status can be
        confirmed from this page.
      </p>
      <div className="booking-outcome__notice">
        <strong>Your appointment is not confirmed yet.</strong>
        <p>AUTO VALET must verify the deposit and approve the request before any appointment is confirmed.</p>
      </div>
    </BookingOutcomeCard>
  );
}
