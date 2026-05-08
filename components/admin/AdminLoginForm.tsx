"use client";

import { FormEvent, useState } from "react";

type AdminLoginFormProps = {
  authConfigured: boolean;
};

type LoginState = {
  tone: "warning" | "success";
  message: string;
};

export function AdminLoginForm({ authConfigured }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<LoginState | null>(
    authConfigured
      ? null
      : {
          tone: "warning",
          message: "Admin authentication is not connected yet.",
        },
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setState(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!result.success) {
        setState({
          tone: "warning",
          message: result.error?.message ?? "Admin sign-in is not available yet.",
        });
        return;
      }

      setState({
        tone: "success",
        message: "Signed in.",
      });
      window.location.href = new URLSearchParams(window.location.search).get("next") || "/admin";
    } catch {
      setState({
        tone: "warning",
        message: "Admin sign-in could not be reached.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <label className="admin-field">
        <span>Email</span>
        <input
          autoComplete="email"
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          type="email"
          value={email}
        />
      </label>

      <label className="admin-field">
        <span>Password</span>
        <input
          autoComplete="current-password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
          type="password"
          value={password}
        />
      </label>

      <button className="primary-button" disabled={isSubmitting || !authConfigured} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="admin-login-form__helper">
        Admin access is required to manage bookings, requests and operations.
      </p>

      {state ? (
        <p className={`admin-submit-message admin-submit-message--${state.tone}`} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
