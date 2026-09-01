export const LAST_ROOM_KEY = "commons_room";

export function readLastRoomId(): string | null {
  try {
    return window.localStorage.getItem(LAST_ROOM_KEY);
  } catch {
    return null;
  }
}

export function writeLastRoomId(roomId: string): void {
  try {
    window.localStorage.setItem(LAST_ROOM_KEY, roomId);
  } catch {
    // private mode
  }
}

export function clearLastRoomId(): void {
  try {
    window.localStorage.removeItem(LAST_ROOM_KEY);
  } catch {
    // private mode
  }
}
