"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminSignOutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Sign out failed.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      className="ghost-button admin-header__action"
      type="button"
      disabled={isSubmitting}
      onClick={handleSignOut}
    >
      {isSubmitting ? "Signing out..." : "Sign out"}
    </button>
  );
}
