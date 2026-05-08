import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  variant?: "default" | "compact";
};

export function PageIntro({ eyebrow, title, children, variant = "default" }: PageIntroProps) {
  const className = `page-intro section${variant === "compact" ? " page-intro--compact" : ""}`;

  return (
    <section className={className}>
      <div className="section__inner page-intro__inner">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {children ? <p>{children}</p> : null}
      </div>
    </section>
  );
}
