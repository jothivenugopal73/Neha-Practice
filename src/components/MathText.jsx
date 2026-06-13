import katex from "katex";
import "katex/dist/katex.min.css";

// Renders text that may contain inline LaTeX wrapped in $...$ or $$...$$.
// Anything outside the dollar signs is shown as plain text.
export default function MathText({ children }) {
  const text = String(children ?? "");
  const parts = text.split(/(\$\$[^$]*\$\$|\$[^$]*\$)/g);

  return (
    <span>
      {parts.map((part, i) => {
        const isBlock = part.startsWith("$$") && part.endsWith("$$") && part.length > 3;
        const isInline = !isBlock && part.startsWith("$") && part.endsWith("$") && part.length > 1;

        if (isBlock || isInline) {
          const math = isBlock ? part.slice(2, -2) : part.slice(1, -1);
          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: isBlock,
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={i}>{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
