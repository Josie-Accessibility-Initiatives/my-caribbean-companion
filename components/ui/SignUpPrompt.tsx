import type { ReactNode } from "react";
import Link from "next/link";

type SignUpPromptProps = {
  icon: ReactNode;
  title: string;
  /** id for the heading, so a surrounding dialog/section can reference it. */
  titleId: string;
  body: ReactNode;
  /** Where signup/login should return the user afterwards. */
  redirect: string;
  /** Optional extra content under the buttons. */
  children?: ReactNode;
};

/** Icon, heading, short pitch and "Create free account" / "Log in" buttons. */
export function SignUpPrompt({ icon, title, titleId, body, redirect, children }: SignUpPromptProps) {
  const next = encodeURIComponent(redirect);
  return (
    <>
      <div className="plan-limit-icon" aria-hidden="true">
        {icon}
      </div>
      <h2 id={titleId} className="plan-limit-title">
        {title}
      </h2>
      <p className="plan-limit-body">{body}</p>
      <div className="row row--center plan-limit-actions">
        <Link href={`/signup?redirect=${next}`} className="btn-primary">
          Create free account
        </Link>
        <Link href={`/login?redirect=${next}`} className="btn-secondary">
          Log in
        </Link>
      </div>
      {children}
    </>
  );
}
