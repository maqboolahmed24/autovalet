import type { ReactNode } from "react";

type InfoRowProps = {
  label: string;
  value: ReactNode;
  tone?: "default" | "warning" | "danger" | "success";
};

export function InfoRow({ label, value, tone = "default" }: InfoRowProps) {
  return (
    <div className={`info-row info-row--${tone}`}>
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}
