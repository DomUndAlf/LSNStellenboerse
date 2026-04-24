import * as React from "react";
import type { ReactElement, ReactNode } from "react";

interface IExternalJobLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

function ExternalJobLink({ href, children, className }: IExternalJobLinkProps): ReactElement {
  const LINK_CLASS_NAME: string = className
    ? className
    : "text-dunkelblau hover:text-orange transition-colors hover:underline";

  return (
    <a href={href} className={LINK_CLASS_NAME} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default ExternalJobLink;