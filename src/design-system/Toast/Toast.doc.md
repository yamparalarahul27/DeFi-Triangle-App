# Toast

Status: stable
Version: 1.0.0
App-level notifications: ToastProvider + useToast(), on Radix Toast.

## Usage

```tsx
import { ToastProvider, useToast } from "@/design-system";

// app root: <ToastProvider>{children}</ToastProvider>
const toast = useToast();
toast({ title: "Watchlist updated", tone: "buy" });
```

## Anatomy

```
+| Title                x +  <- tone bar (buy/sell/warning/neutral)
|  description            |     surface-bright, shadow-raised
+-------------------------+     viewport: bottom-center, z-toast
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `ToastProvider` | wraps the app | -- | Renders the Radix provider + viewport. |
| `useToast()` | `(t) => void` | -- | `{title, description?, tone?}`; throws outside the provider. |
| `tone` | `"neutral" \| "buy" \| "sell" \| "warning"` | `"neutral"` | Tone bar only -- text stays fg. |

## Tokens

- `--surface-bright` - `--elevation-2` - `--z-toast` (the ladder's top, first consumer) - tone tokens for the bar

## States

enter - visible (5s) - dismiss (auto / x / swipe-down).

## Motion

slide-in-from-bottom + fade on enter, fade on exit (Radix presets); reduced-motion collapses.

## A11y

- Radix Toast: polite live-region announcements, F8 reaches the viewport, swipe + Escape dismiss.
- Tone is reinforced by the title text, never color alone.
