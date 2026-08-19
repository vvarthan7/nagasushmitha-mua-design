/* Primitives shared by more than one component, as class-name builders rather
   than CSS. This is what `composes:` in shared.module.css used to do.

   The old note there was that these had to be used verbatim and never
   overridden, because cascade order between two CSS modules could silently
   change a value. Utilities have the same hazard in a worse form — two
   conflicting classes in one attribute are decided by their order in the
   generated stylesheet, not by the order you wrote them. The fix is the same
   one either way: express the state as a branch, so the conflicting pair is
   never on the element at once. */

/** Filter chips and service tabs.
 *
 *  `compact` narrows the side padding below 768px, for a row of chips that has
 *  to wrap rather than scroll — the portfolio grid's six filters, where the
 *  longest label is "Behind the Scenes" and 12px per chip is the difference
 *  between three rows and four on a small phone. Everywhere else the row is
 *  short enough not to need it.
 *
 *  It is a parameter rather than a class the caller appends, because appending
 *  `px-3.5` next to this function's `px-5` would not work: two padding-inline
 *  utilities on one element are resolved by the order Tailwind emits them —
 *  ascending by value, so `px-5` always wins — not by the order they are
 *  written. The note at the top of this file is about exactly this. Branching
 *  here means only one of the two is ever on the element. The `md:` inside the
 *  compact branch is safe for the opposite reason: a responsive variant is
 *  emitted after the base utilities, so it reliably takes over at 768px. */
export const pill = (on: boolean, compact = false): string =>
  [
    "cursor-pointer select-none rounded-full border py-2.75",
    compact ? "px-3.5 md:px-5" : "px-5",
    "font-sans text-[10px] font-semibold tracking-[0.14em] uppercase",
    "transition-all duration-280 ease-soft",
    on
      ? "border-plum bg-plum text-white"
      : "border-border bg-transparent text-text-muted",
  ].join(" ");
