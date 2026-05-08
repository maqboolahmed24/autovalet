"use client";

import { useState, type FormEvent } from "react";
import { dataRequestTypeLabels, dataRequestTypes } from "../../lib/privacy/data-request-types";
import type { DataRequestType } from "../../lib/privacy/types";

type DataRequestResponse =
  | {
      success: true;
      data: {
        requestReference: string;
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

export function DataRequestForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestType, setRequestType] = useState<DataRequestType>("access");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"success" | "warning">("warning");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/privacy/data-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          requestType,
          message,
        }),
      });
      const payload = (await response.json()) as DataRequestResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "Data request could not be submitted." : payload.error.message);
      }

      setStatusTone("success");
      setStatusMessage(
        payload.data.requestReference
          ? `Your request has been received. Reference: ${payload.data.requestReference}.`
          : payload.message ?? "Your request has been received.",
      );
      setFullName("");
      setEmail("");
      setPhone("");
      setRequestType("access");
      setMessage("");
    } catch (error) {
      setStatusTone("warning");
      setStatusMessage(error instanceof Error ? error.message : "Data request could not be submitted. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="premium-card public-info-card data-request-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="data-request-name">Full name</label>
        <input
          id="data-request-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
        />
      </div>

      <div className="form-field">
        <label htmlFor="data-request-email">Email address</label>
        <input
          id="data-request-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="data-request-phone">Phone number, optional</label>
        <input
          id="data-request-phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      <div className="form-field">
        <label htmlFor="data-request-type">Request type</label>
        <select
          id="data-request-type"
          value={requestType}
          onChange={(event) => setRequestType(event.target.value as DataRequestType)}
        >
          {dataRequestTypes.map((type) => (
            <option key={type} value={type}>
              {dataRequestTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="data-request-message">Message, optional</label>
        <textarea
          id="data-request-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Add any detail that helps AUTO VALET identify the records."
        />
        <p className="form-field__hint">
          Do not include sensitive card or account details. AUTO VALET only needs enough information to identify the records.
        </p>
      </div>

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Checking..." : "Submit data request"}
      </button>

      {statusMessage ? (
        <p className={`data-request-form__message data-request-form__message--${statusTone}`} role="status">
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
