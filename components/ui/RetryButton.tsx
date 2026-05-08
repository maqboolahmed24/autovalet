"use client";

type RetryButtonProps = {
  label?: string;
  onRetry?: () => void;
};

export function RetryButton({ label = "Try again", onRetry }: RetryButtonProps) {
  return (
    <button
      className="primary-button"
      type="button"
      onClick={() => {
        if (onRetry) {
          onRetry();
          return;
        }

        window.location.reload();
      }}
    >
      {label}
    </button>
  );
}
