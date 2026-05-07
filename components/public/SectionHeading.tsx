import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  titleId?: string;
  children?: ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, titleId, children, className }: SectionHeadingProps) {
  return (
    <div className={`section-heading${className ? ` ${className}` : ""}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={titleId}>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
