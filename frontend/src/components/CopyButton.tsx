import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return <button type="button" className="terminal-copy" onClick={copy} aria-live="polite">{copied ? "Copied" : "Copy"}</button>;
}
