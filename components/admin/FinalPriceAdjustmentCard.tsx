"use client";

import { useState, type FormEvent } from "react";
import type { BookingStatus } from "../../lib/booking/types";
import { getAdminBookingStatusLabel } from "../../lib/booking/status-labels";
import { formatMoneyGBP } from "../../lib/pricing";
import { poundsToMinor } from "../../lib/payments/balance";

type FinalPriceAdjustmentCardProps = {
  bookingId: string;
  status: BookingStatus;
  estimatedTotalMinor: number;
  finalTotalMinor: number | null;
  depositPaidMinor: number;
  balancePaidMinor: number;
  balanceDueMinor: number;
  paymentsEnabled?: boolean;
  onUpdated?: (update: { finalTotalMinor: number; balanceDueMinor: number }) => void;
};

type AdjustFinalPriceResponse =
  | {
      success: true;
      data: {
        bookingId: string;
        finalTotalMinor: number;
        balanceDueMinor: number;
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
  return String(amountMinor / 100);
}

export function FinalPriceAdjustmentCard({
  bookingId,
  status,
  estimatedTotalMinor,
  finalTotalMinor,
  depositPaidMinor,
  balancePaidMinor,
  balanceDueMinor,
  paymentsEnabled = false,
  onUpdated,
}: FinalPriceAdjustmentCardProps) {
  const currentFinalTotalMinor = finalTotalMinor ?? estimatedTotalMinor;
  const [isEditing, setIsEditing] = useState(false);
  const [finalPriceInput, setFinalPriceInput] = useState(minorToPoundsInput(currentFinalTotalMinor));
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"neutral" | "success" | "warning">("neutral");
  const parsedFinalTotalMinor = poundsToMinor(finalPriceInput);
  const enteredPriceIsBelowDeposit =
    paymentsEnabled && parsedFinalTotalMinor !== null && parsedFinalTotalMinor < depositPaidMinor;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setTone("neutral");

    const finalTotalMinorValue = poundsToMinor(finalPriceInput);

    if (finalTotalMinorValue === null || finalTotalMinorValue < 0) {
      setTone("warning");
      setMessage("Enter a valid final price.");
      return;
    }

    if (reason.trim().length < 5) {
      setTone("warning");
      setMessage("Add a reason for the adjustment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/adjust-final-price`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          finalTotalMinor: finalTotalMinorValue,
          reason,
        }),
      });
      const payload = (await response.json()) as AdjustFinalPriceResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Final price could not be updated." : payload.error.message);
      }

      setTone("success");
      setMessage("Final price updated.");
      setIsEditing(false);
      onUpdated?.({
        finalTotalMinor: payload.data.finalTotalMinor,
        balanceDueMinor: payload.data.balanceDueMinor,
      });
    } catch (error) {
      setTone("warning");
      setMessage(error instanceof Error ? error.message : "Final price could not be updated.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-money-card" aria-labelledby="final-price-title">
      <div className="admin-money-card__header">
        <div>
          <p className="eyebrow">Final price</p>
          <h2 id="final-price-title">Adjust final price</h2>
        </div>
        <span className="status-badge status-badge--pending">{getAdminBookingStatusLabel(status)}</span>
      </div>

      <div className="admin-money-card__metrics">
        <div>
          <span>Estimated total</span>
          <strong>{formatMoneyGBP(estimatedTotalMinor)}</strong>
        </div>
        <div>
          <span>Final price</span>
          <strong>{finalTotalMinor === null ? "Not set" : formatMoneyGBP(finalTotalMinor)}</strong>
        </div>
        {paymentsEnabled ? (
          <div>
            <span>Deposit paid</span>
            <strong>{formatMoneyGBP(depositPaidMinor)}</strong>
          </div>
        ) : null}
        {paymentsEnabled ? (
          <div>
            <span>Balance paid</span>
            <strong>{formatMoneyGBP(balancePaidMinor)}</strong>
          </div>
        ) : null}
        <div>
          <span>Balance due</span>
          <strong>{formatMoneyGBP(balanceDueMinor)}</strong>
        </div>
      </div>

      {!isEditing ? (
        <button className="admin-button admin-button--secondary" type="button" onClick={() => setIsEditing(true)}>
          Adjust final price
        </button>
      ) : (
        <form className="admin-money-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>Final price</span>
            <input
              value={finalPriceInput}
              onChange={(event) => setFinalPriceInput(event.target.value)}
              inputMode="decimal"
              placeholder="95"
            />
          </label>
          <label className="admin-field">
            <span>Reason for adjustment</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Heavy pet hair and staining required additional time."
            />
          </label>

          {enteredPriceIsBelowDeposit ? (
            <p className="admin-inline-note">
              Final price is lower than the deposit paid. Use a refund flow or admin override before saving.
            </p>
          ) : null}

          <div className="admin-money-form__actions">
            <button className="admin-button admin-button--secondary" type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className="admin-button admin-button--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save final price"}
            </button>
          </div>
        </form>
      )}

      {message ? (
        <p className={`admin-submit-message admin-submit-message--${tone}`} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
