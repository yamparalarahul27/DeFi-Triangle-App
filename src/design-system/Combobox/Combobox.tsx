"use client";

import { Popover as RadixPopover } from "radix-ui";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ComboboxOption<T extends string> = {
  value: T;
  label: string;
  /** Right-aligned secondary text (e.g. a price or network). */
  hint?: string;
  disabled?: boolean;
};

/**
 * Typeahead select — an Input that filters a listbox as you type.
 * Pick-from-list only: the value is always a known option (validate-free
 * for consumers). Hand-rolled ARIA 1.2 combobox on Radix Popover — no
 * cmdk dependency, so the component stays registry-portable.
 * Select is for short closed lists; Combobox is for lists worth searching.
 */
export function Combobox<T extends string>({
  options,
  value,
  onValueChange,
  placeholder = "Search…",
  emptyText = "No matches",
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  options: ComboboxOption<T>[];
  value: T | undefined;
  onValueChange: (value: T) => void;
  placeholder?: string;
  /** Shown when the query matches nothing. */
  emptyText?: string;
  disabled?: boolean;
  /** Merged onto the input. */
  className?: string;
  "aria-label"?: string;
}) {
  const baseId = useId();
  const listId = `${baseId}-listbox`;
  const optId = (i: number) => `${baseId}-option-${i}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  // null query → the input mirrors the selected label (not filtering).
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const selected = options.find((o) => o.value === value);
  const text = query ?? selected?.label ?? "";
  const q = (query ?? "").trim().toLowerCase();
  const matches = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  const openList = (nextQuery: string | null) => {
    setQuery(nextQuery);
    setActive(0);
    setOpen(true);
  };
  const closeList = () => {
    setOpen(false);
    setQuery(null); // revert to the selected label — free text never sticks
  };
  const select = (opt: ComboboxOption<T>) => {
    if (opt.disabled) return;
    onValueChange(opt.value);
    closeList();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) return openList(null);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openList(null);
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && matches[active]) {
        e.preventDefault();
        select(matches[active]);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        closeList();
      }
    } else if (e.key === "Tab") {
      if (open) closeList();
    }
  };

  return (
    <RadixPopover.Root open={open} onOpenChange={(o) => (o ? setOpen(true) : closeList())}>
      <RadixPopover.Anchor asChild>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && matches[active] ? optId(active) : undefined}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          placeholder={placeholder}
          value={text}
          onChange={(e) => openList(e.target.value)}
          onClick={() => !open && openList(null)}
          onKeyDown={onKeyDown}
          className={cn(
            "h-9 w-full rounded-control border border-outline-variant bg-surface-container px-3 text-sm text-fg placeholder:text-fg-subtle",
            "transition-[border-color] duration-150 focus:border-outline",
            "disabled:pointer-events-none disabled:opacity-40",
            className,
          )}
        />
      </RadixPopover.Anchor>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side="bottom"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()} // focus stays in the input
          onInteractOutside={(e) => {
            // clicking the anchored input is not "outside"
            if (e.target === inputRef.current) e.preventDefault();
          }}
          className={cn(
            "z-[var(--z-raised)] max-h-64 w-[var(--radix-popover-trigger-width)] overflow-y-auto rounded-chip border border-outline-variant bg-surface-bright p-1 shadow-raised",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          )}
        >
          <div role="listbox" id={listId} aria-label={ariaLabel}>
            {matches.length === 0 ? (
              <p className="px-2.5 py-2 text-xs text-fg-subtle">{emptyText}</p>
            ) : (
              matches.map((opt, i) => (
                <div
                  key={opt.value}
                  role="option"
                  id={optId(i)}
                  aria-selected={opt.value === value}
                  aria-disabled={opt.disabled || undefined}
                  data-active={i === active || undefined}
                  onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                  onClick={() => select(opt)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex cursor-default select-none items-center justify-between gap-3 rounded-control px-2.5 py-1.5 text-xs",
                    "data-[active]:bg-surface-container-high",
                    opt.disabled ? "opacity-40" : "text-fg",
                    opt.value === value && "font-semibold",
                  )}
                >
                  <span className="min-w-0 truncate">{opt.label}</span>
                  {opt.hint && <span className="flex-none text-fg-subtle">{opt.hint}</span>}
                </div>
              ))
            )}
          </div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
