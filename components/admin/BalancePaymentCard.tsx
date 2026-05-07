"use client";

import { useState, type FormEvent } from "react";
import type { BookingStatus } from "../../lib/booking/types";
import { formatMoneyGBP } from "../../lib/pricing";
import {
  getPaymentDisplayStatus,
  poundsToMinor,
  type BalancePaymentMethod,
  type PaymentDisplayStatus,
} from "../../lib/payments/balance";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

type BalancePaymentCardProps = {
  bookingId: string;
  status: BookingStatus;
  estimatedTotalMinor: number;
  finalTotalMinor: number | null;
  depositPaidMinor: number;
  balanceDueMinor: number;
  balancePaidMinor: number;
  onRecorded?: (update: {
    balancePaidMinor: number;
    balanceDueMinor: number;
    paymentStatus: PaymentDisplayStatus;
  }) => void;
};

type MarkBalancePaidResponse =
  | {
      success: true;
      data: {
        bookingId: string;
        balancePaidMinor: number;
        balanceDueMinor: number;
        paymentStatus: PaymentDisplayStatus;
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

export function BalancePaymentCard({
  bookingId,
  status,
  estimatedTotalMinor,
  finalTotalMinor,
  depositPaidMinor,
  balanceDueMinor,
  balancePaidMinor,
  onRecorded,
}: BalancePaymentCardProps) {
  const [amountInput, setAmountInput] = useState(minorToPoundsInput(balanceDueMinor));
  const [paymentMethod, setPaymentMethod] = useState<BalancePaymentMethod>("cash");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");
  const paymentStatus = getPaymentDisplayStatus({
    bookingId,
    status,
    estimatedTotalMinor,
    finalTotalMinor,
    depositPaidMinor,
    balanceDueMinor,
    balancePaidMinor,
    currency: "GBP",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setTone("neutral");

    const amountPaidMinor = poundsToMinor(amountInput);

    if (amountPaidMinor === null || amountPaidMinor <= 0) {
      setTone("warning");
      setMessage("Enter a valid balance payment amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/mark-balance-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountPaidMinor,
          paymentMethod,
          note,
        }),
      });
      const payload = (await response.json()) as MarkBalancePaidResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Balance payment could not be recorded." : payload.error.message);
      }

      setTone("success");
      setMessage("Balance payment recorded.");
      onRecorded?.({
        balancePaidMinor: payload.data.balancePaidMinor,
        balanceDueMinor: payload.data.balanceDueMinor,
        paymentStatus: payload.data.paymentStatus,
      });
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Balance payment could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-money-card" aria-labelledby="balance-payment-title">
      <div className="admin-money-card__header">
        <div>
          <p className="eyebrow">Payment</p>
          <h2 id="balance-payment-title">Remaining balance</h2>
        </div>
        <PaymentStatusBadge status={paymentStatus} />
      </div>

      <div className="admin-money-card__metrics">
        <div>
          <span>Balance due</span>
          <strong>{formatMoneyGBP(balanceDueMinor)}</strong>
        </div>
        <div>
          <span>Balance paid</span>
          <strong>{formatMoneyGBP(balancePaidMinor)}</strong>
        </div>
        <div>
          <span>Deposit paid</span>
          <strong>{formatMoneyGBP(depositPaidMinor)}</strong>
        </div>
      </div>

      <form className="admin-money-form" onSubmit={handleSubmit}>
        <div className="admin-field-grid">
          <label className="admin-field">
            <span>Amount</span>
            <input
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              inputMode="decimal"
              placeholder="65"
            />
          </label>
          <label className="admin-field">
            <span>Method</span>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as BalancePaymentMethod)}
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="card_reader">Card reader</option>
              <option value="payment_link">Payment link</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <label className="admin-field">
          <span>Note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Paid on completion"
          />
        </label>
        <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Recording..." : "Mark balance paid"}
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
