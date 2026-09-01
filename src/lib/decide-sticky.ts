import type { Packet } from "./types";

export function canStickyDecide(packet: Packet | null | undefined): boolean {
  return Boolean(packet && packet.status === "open" && packet.options.length > 0);
}
