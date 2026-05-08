"use client";

import { useState, type FormEvent } from "react";
import { formatMoneyGBP } from "../../lib/pricing";
import { poundsToMinor } from "../../lib/payments/balance";

type RefundDepositSheetProps = {
  bookingId: string;
  depositPaidMinor: number;
  onRefunded?: (update: { refundReference: string; amountMinor: number; status: string }) => void;
};

type RefundDepositResponse =
  | {
      success: true;
      data: {
        refundReference: string;
        amountMinor: number;
        status: string;
      };
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details: Record<string, unknown>;
      };
    };

function minorToPoundsInput(amountMinor: number) {
  return amountMinor > 0 ? String(amountMinor / 100) : "";
}

export function RefundDepositSheet({ bookingId, depositPaidMinor, onRefunded }: RefundDepositSheetProps) {
  const [amountInput, setAmountInput] = useState(minorToPoundsInput(depositPaidMinor));
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setTone("neutral");

    const amountMinor = poundsToMinor(amountInput);

    if (amountMinor === null || amountMinor <= 0) {
      setTone("warning");
      setMessage("Enter a valid refund amount.");
      return;
    }

    if (reason.trim().length < 5) {
      setTone("warning");
      setMessage("Add a refund reason.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/refund-deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountMinor,
          reason,
        }),
      });
      const payload = (await response.json()) as RefundDepositResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Refund could not be started." : payload.error.message);
      }

      setTone("success");
      setMessage("Deposit refund recorded.");
      onRefunded?.(payload.data);
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Refund could not be started.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet" aria-labelledby="refund-deposit-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Refund deposit</p>
        <h2 id="refund-deposit-title">Refund this deposit?</h2>
        <p>This action must be confirmed through the payment provider once refunds are connected.</p>
      </div>

      <div className="admin-inline-note">
        Deposit paid: <strong>{formatMoneyGBP(depositPaidMinor)}</strong>
      </div>

      <form className="admin-money-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Amount</span>
          <input
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            inputMode="decimal"
            placeholder="30"
          />
        </label>
        <label className="admin-field">
          <span>Reason</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="AUTO VALET declined before approval."
          />
        </label>
        <p className="admin-inline-note">Refunds cannot be undone once the provider processes them.</p>
        <button className="admin-button admin-button--danger" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Starting refund..." : "Confirm refund"}
        </button>
      </form>

      {message ? (
        <p className={`admin-submit-message admin-submit-message--${tone}`} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
