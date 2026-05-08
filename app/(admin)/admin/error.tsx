"use client";

import { ErrorState } from "../../../components/ui/ErrorState";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ reset }: AdminErrorProps) {
  return (
    <ErrorState
      eyebrow="Admin"
      title="Something went wrong."
      description="Please retry the admin action. If this keeps happening, check auth, persistence and provider configuration."
      action={{
        label: "Try again",
        onClick: reset,
      }}
      secondaryAction={{
        href: "/admin",
        label: "Back to Today",
      }}
    />
  );
}
