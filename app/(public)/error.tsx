"use client";

import { ErrorState } from "../../components/ui/ErrorState";

type PublicErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicError({ reset }: PublicErrorProps) {
  return (
    <ErrorState
      eyebrow="AUTO VALET"
      title="Something went wrong."
      description="Please refresh the page or return to the homepage."
      action={{
        label: "Try again",
        onClick: reset,
      }}
      secondaryAction={{
        href: "/",
        label: "Back to home",
      }}
    />
  );
}
