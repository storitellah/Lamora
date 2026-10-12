/**
 * Shared stylus state. Once an Apple Pencil or other stylus has touched the
 * screen, drawing surfaces ignore fingers ("palm rejection"), so a hand
 * resting on the iPad while writing doesn't leave marks.
 */
let penSeen = false;
export const markPen = () => { penSeen = true; };
export const isPenSeen = () => penSeen;

/** Should this pointer be allowed to draw? */
export function acceptsPointer(e: { pointerType: string }) {
  if (e.pointerType === "pen") { penSeen = true; return true; }
  return !(penSeen && e.pointerType === "touch");
}
