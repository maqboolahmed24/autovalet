"use client";

import { useState, type FormEvent } from "react";
import { formatMoneyGBP } from "../../lib/pricing";
import { poundsToMinor } from "../../lib/payments/balance";

type TransferDepositSheetProps = {
  bookingId: string;
  depositPaidMinor: number;
  onTransferred?: (update: { transferReference: string; amountMinor: number; status: string }) => void;
};

type TransferDepositResponse =
  | {
      success: true;
      data: {
        transferReference: string;
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

export function TransferDepositSheet({ bookingId, depositPaidMinor, onTransferred }: TransferDepositSheetProps) {
  const [amountInput, setAmountInput] = useState(minorToPoundsInput(depositPaidMinor));
  const [reason, setReason] = useState("");
  const [futureBookingReference, setFutureBookingReference] = useState("");
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
      setMessage("Enter a valid transfer amount.");
      return;
    }

    if (reason.trim().length < 5) {
      setTone("warning");
      setMessage("Add a transfer reason.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/transfer-deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountMinor,
          reason,
          futureBookingReference,
        }),
      });
      const payload = (await response.json()) as TransferDepositResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Deposit transfer could not be recorded." : payload.error.message);
      }

      setTone("success");
      setMessage("Deposit transfer recorded.");
      onTransferred?.(payload.data);
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Deposit transfer could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-action-sheet" aria-labelledby="transfer-deposit-title">
      <div className="admin-action-sheet__header">
        <p className="eyebrow">Transfer deposit</p>
        <h2 id="transfer-deposit-title">Move deposit to another booking</h2>
      </div>

      <div className="admin-inline-note">
        Deposit paid: <strong>{formatMoneyGBP(depositPaidMinor)}</strong>
      </div>

      <form className="admin-money-form" onSubmit={handleSubmit}>
        <div className="admin-field-grid">
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
            <span>Future booking reference</span>
            <input
              value={futureBookingReference}
              onChange={(event) => setFutureBookingReference(event.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>
        <label className="admin-field">
          <span>Transfer reason</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Weather reschedule agreed with customer."
          />
        </label>
        <button className="admin-button admin-button--secondary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Recording..." : "Confirm transfer"}
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
