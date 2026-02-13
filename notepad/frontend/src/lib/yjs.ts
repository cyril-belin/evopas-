import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const YJS_WS_URL =
  process.env.NEXT_PUBLIC_YJS_WS_URL || "ws://127.0.0.1:1234";

export function createYjsProvider(noteId: string, userName: string, userColor: string) {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(YJS_WS_URL, `note-${noteId}`, ydoc);

  provider.awareness.setLocalStateField("user", {
    name: userName,
    color: userColor,
  });

  return { ydoc, provider };
}

export function getRandomColor(): string {
  const colors = [
    "#958DF1",
    "#F98181",
    "#FBBC88",
    "#FAF594",
    "#70CFF8",
    "#94FADB",
    "#B9F18D",
    "#E8A0BF",
    "#C4B5FD",
    "#67E8F9",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
