import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "compact";
};

export function PageIntro({ eyebrow, title, children, className, variant = "default" }: PageIntroProps) {
  const introClassName = [
    "page-intro section",
    variant === "compact" ? "page-intro--compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={introClassName}>
      <div className="section__inner page-intro__inner">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {children ? <p>{children}</p> : null}
      </div>
    </section>
  );
}
