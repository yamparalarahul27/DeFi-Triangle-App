"use client";

import { useState } from "react";
import type { AssetProfile } from "@/lib/tokens-xyz-types";

export function AboutSection({ profile }: { profile: AssetProfile }) {
  const [expanded, setExpanded] = useState(false);
  const description = profile.description ?? "";
  const MAX = 320;
  const needsTruncation = description.length > MAX;
  const displayed =
    !expanded && needsTruncation
      ? description.slice(0, MAX).trim() + "…"
      : description;

  return (
    <section className="bg-surface-container rounded-sm border border-outline-variant p-4 sm:p-6">
      <div className="text-[10px] uppercase tracking-wider text-fg-muted mb-3">
        About
      </div>
      <p className="text-sm text-fg whitespace-pre-line leading-relaxed [text-wrap:pretty]">
        {displayed}
      </p>
      {needsTruncation && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-brand hover:text-brand-hover mt-2 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
      {profile.links && Object.keys(profile.links).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(profile.links).map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 rounded-sm bg-surface-page text-fg hover:bg-surface-container-high transition-colors capitalize"
            >
              {key} ↗
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
