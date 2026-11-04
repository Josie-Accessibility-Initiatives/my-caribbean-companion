import { MessageCircle } from "lucide-react";
import { SignUpPrompt } from "@/components/ui/SignUpPrompt";
import { CHAT_DAILY_LIMIT } from "@/lib/chat-limits";

const TITLE_ID = "companion-signin-title";

/** Shown on /companion to guests: the AI Companion is for signed-in users. */
export default function CompanionSignInCard() {
  return (
    <section className="planner-card companion-signin" aria-labelledby={TITLE_ID}>
      <SignUpPrompt
        icon={<MessageCircle size={22} />}
        title="Sign in to chat with your AI Companion"
        titleId={TITLE_ID}
        body={`Get answers about CSME eligibility, documents and your next steps. Free accounts get ${CHAT_DAILY_LIMIT} AI Companion messages every day.`}
        redirect="/companion"
      />
    </section>
  );
}
