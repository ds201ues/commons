export function roomShareUrl(origin: string, roomId: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/r/${roomId}`;
}
