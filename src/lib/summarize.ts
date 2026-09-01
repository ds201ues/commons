const MAX_CHARS = 1500;

export function trimToolOutput(value: unknown): string {
  const text = JSON.stringify(value);
  if (text.length <= MAX_CHARS) return text;
  return `${text.slice(0, MAX_CHARS - 15)}…[truncated]`;
}
