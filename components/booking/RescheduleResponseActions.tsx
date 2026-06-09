"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RescheduleResponseActionsProps = {
  reference: string;
};

type RescheduleAction = "accept" | "decline";

type RescheduleActionResponse =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const actionLabels: Record<RescheduleAction, string> = {
  accept: "Accept new time",
  decline: "This time does not work",
};

export function RescheduleResponseActions({ reference }: RescheduleResponseActionsProps) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<RescheduleAction | null>(null);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  async function submitAction(action: RescheduleAction) {
    setActiveAction(action);
    setMessage("");
    setTone("success");

    try {
      const response = await fetch(
        `/api/booking/status/${encodeURIComponent(reference)}/reschedule/${action}`,
        {
          method: "POST",
        },
      );
      const payload = (await response.json()) as RescheduleActionResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Response could not be saved." : payload.error.message);
      }

      setTone("success");
      setMessage(
        action === "accept"
          ? "Accepted. Your booking is now confirmed for the suggested time."
          : "Thanks. AUTO VALET will review another option.",
      );
      router.refresh();
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Response could not be saved.");
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="booking-reschedule-actions" aria-label="Respond to suggested booking time">
      <button
        className="primary-button"
        type="button"
        disabled={Boolean(activeAction)}
        onClick={() => submitAction("accept")}
      >
        {activeAction === "accept" ? "Accepting..." : actionLabels.accept}
      </button>
      <button
        className="secondary-button"
        type="button"
        disabled={Boolean(activeAction)}
        onClick={() => submitAction("decline")}
      >
        {activeAction === "decline" ? "Sending..." : actionLabels.decline}
      </button>
      {message ? (
        <p className={`booking-reschedule-actions__message booking-reschedule-actions__message--${tone}`} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
