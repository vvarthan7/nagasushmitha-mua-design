/* Primitives shared by more than one component, as class-name builders rather
   than CSS. This is what `composes:` in shared.module.css used to do.

   The old note there was that these had to be used verbatim and never
   overridden, because cascade order between two CSS modules could silently
   change a value. Utilities have the same hazard in a worse form — two
   conflicting classes in one attribute are decided by their order in the
   generated stylesheet, not by the order you wrote them. The fix is the same
   one either way: express the state as a branch, so the conflicting pair is
   never on the element at once. */

/** Filter chips and service tabs. */
export const pill = (on: boolean): string =>
  [
    "cursor-pointer select-none rounded-full border px-5 py-2.75",
    "font-sans text-[10px] font-semibold tracking-[0.14em] uppercase",
    "transition-all duration-280 ease-soft",
    on
      ? "border-plum bg-plum text-white"
      : "border-border bg-transparent text-text-muted",
  ].join(" ");
