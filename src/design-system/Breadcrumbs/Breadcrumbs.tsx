import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  /** Omit on the last item (current page) — it renders as text, not a link. */
  href?: string;
};

/**
 * Path navigation for docs/console surfaces. Renders plain anchors to
 * stay portable; in a Next.js app, client-side navigation still works
 * for internal paths via the browser (or wrap the page in a route
 * group that prefetches). Last item is the current page.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {last || !item.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn("truncate", last ? "font-medium text-fg" : "text-fg-muted")}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="truncate text-fg-muted transition-colors duration-150 hover:text-fg"
                >
                  {item.label}
                </a>
              )}
              {!last && (
                <span aria-hidden="true" className="text-fg-subtle">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
