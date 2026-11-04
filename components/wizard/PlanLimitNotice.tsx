import Link from "next/link";
import { Lock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { GUEST_PLAN_LIMIT, USER_PLAN_LIMIT } from "@/lib/plan-limits";

type Variant = "guest" | "user";

const TITLE_ID = "plan-limit-title";

const COPY: Record<Variant, { title: string; body: string }> = {
  guest: {
    title: `You've made ${GUEST_PLAN_LIMIT} plans as a guest`,
    body: `Create a free account to save up to ${USER_PLAN_LIMIT} plans, track your checklist, and pick up where you left off on any device.`,
  },
  user: {
    title: `You have ${USER_PLAN_LIMIT} saved plans`,
    body: "That's the most you can keep at once. Delete a plan you no longer need from your dashboard, then create this one.",
  },
};

/** Pop-up shown instead of generating a plan once the guest or account limit is reached. */
export default function PlanLimitNotice({
  variant,
  onClose,
}: {
  variant: Variant;
  onClose: () => void;
}) {
  const { title, body } = COPY[variant];

  return (
    <Modal onClose={onClose} labelledBy={TITLE_ID}>
      <div className="plan-limit-icon" aria-hidden="true">
        <Lock size={22} />
      </div>
      <h2 id={TITLE_ID} className="plan-limit-title">
        {title}
      </h2>
      <p className="plan-limit-body">{body}</p>

      {variant === "guest" ? (
        <>
          <div className="row row--center plan-limit-actions">
            <Link href="/signup?redirect=/onboarding" className="btn-primary">
              Create free account
            </Link>
            <Link href="/login?redirect=/onboarding" className="btn-secondary">
              Log in
            </Link>
          </div>
          <p className="plan-limit-note">
            You can still open your current plan on the{" "}
            <Link href="/dashboard">dashboard</Link> or regenerate a plan you made before.
          </p>
        </>
      ) : (
        <div className="row row--center plan-limit-actions">
          <Link href="/dashboard" className="btn-primary">
            Manage my plans
          </Link>
        </div>
      )}
    </Modal>
  );
}
