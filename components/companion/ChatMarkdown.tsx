import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";

// Links in AI replies open in a new tab; raw HTML is never rendered
// (react-markdown ignores it by default).
const components: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

/** Renders an AI Companion reply (Markdown from Gemini) as formatted text. */
function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="chat-markdown">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}

export default memo(ChatMarkdown);
