/** Share / join links always land as Contributor, even with an owner cookie. */
export const SHARE_AS_CONTRIBUTOR = "contributor";

export function roomShareUrl(origin: string, roomId: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/r/${roomId}?as=${SHARE_AS_CONTRIBUTOR}`;
}
