import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "./CopyButton";

function textOf(children: ReactNode): string {
  return Children.toArray(children).map((child) => isValidElement<{ children?: ReactNode }>(child)
    ? textOf(child.props.children) : String(child)).join("");
}

function headingId(children: ReactNode) {
  return textOf(children).toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");
}

export default function Markdown({ children }: { children: string }) {
  return <div className="prose gd-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    h1: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
    h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
    h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
    a: ({ href, children }) => <a href={href} {...(/^https?:\/\//i.test(href ?? "")
      ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>,
    pre: ({ children }) => {
      const code = Children.toArray(children).find((child) => isValidElement(child));
      const language = isValidElement<{ className?: string }>(code)
        ? code.props.className?.match(/language-([^\s]+)/)?.[1] : undefined;
      return <div className="terminal gd-code-block">
        <div className="terminal-bar"><span className="gd-code-language">{language ?? "text"}</span><CopyButton text={textOf(children)} /></div>
        <pre className="terminal-body">{children}</pre>
      </div>;
    },
  }}>{children}</ReactMarkdown></div>;
}
