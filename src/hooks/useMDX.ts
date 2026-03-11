import { useState, useEffect } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { MDXModule } from "mdx/types";

export function useMDX(source: string) {
  const [Content, setContent] = useState<MDXModule["default"] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    evaluate(source, { ...(runtime as any) })
      .then((mod) => {
        if (!cancelled) setContent(() => mod.default);
      })
      .catch((err) => {
        console.error("MDX Evaluation error:", err);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [source]);

  return { Content, error };
}
