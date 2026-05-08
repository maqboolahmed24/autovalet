import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  onClick?: () => void;
  variant?: "inline" | "wordmark";
};

export function BrandLogo({ className, onClick, variant = "inline" }: BrandLogoProps) {
  const classNames = ["brand-logo", `brand-logo--${variant}`, className].filter(Boolean).join(" ");

  return (
    <Link aria-label="AUTO VALET home" className={classNames} href="/" onClick={onClick}>
      {variant === "wordmark" ? (
        <img
          alt=""
          className="brand-logo__wordmark"
          height="858"
          src="/media/auto-valet/logo-wordmark.webp"
          width="1121"
        />
      ) : (
        <>
          <img alt="" className="brand-logo__mark" height="782" src="/media/auto-valet/logo-mark.webp" width="782" />
          <span className="brand-logo__text">AUTO VALET</span>
        </>
      )}
    </Link>
  );
}
