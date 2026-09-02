import type { ActorKind } from "./types";

/** Header WebMCP tools send so actor kind cannot be dropped from the JSON body. */
export const ACTOR_VIA_HEADER = "x-commons-via";

/** Resolve human vs agent from header and/or JSON body. Header wins when set. */
export function resolveActorVia(
  headerValue: string | null | undefined,
  bodyVia: unknown,
): ActorKind {
  const fromHeader = typeof headerValue === "string" ? headerValue.trim().toLowerCase() : "";
  if (fromHeader === "agent") return "agent";
  if (fromHeader === "human") return "human";
  return bodyVia === "agent" ? "agent" : "human";
}
