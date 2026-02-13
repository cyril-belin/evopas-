import PocketBase from "pocketbase";
import type { Note } from "@/types";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090");

export default pb;

export async function getNotes(userId: string): Promise<Note[]> {
  const records = await pb.collection("notes").getFullList({
    filter: `userId = "${userId}"`,
    sort: "-updated",
  });
  return records.map(mapRecordToNote);
}

export async function getNote(id: string): Promise<Note> {
  const record = await pb.collection("notes").getOne(id);
  return mapRecordToNote(record);
}

export async function createNote(data: Partial<Note>): Promise<Note> {
  const record = await pb.collection("notes").create(data);
  return mapRecordToNote(record);
}

export async function updateNote(id: string, data: Partial<Note>): Promise<Note> {
  const record = await pb.collection("notes").update(id, data);
  return mapRecordToNote(record);
}

export async function deleteNote(id: string): Promise<void> {
  await pb.collection("notes").delete(id);
}

export async function getRecentNotes(userId: string, limit = 10): Promise<Note[]> {
  const result = await pb.collection("notes").getList(1, limit, {
    filter: `userId = "${userId}"`,
    sort: "-updated",
  });
  return result.items.map(mapRecordToNote);
}

export async function getWeekNotes(userId: string): Promise<Note[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const records = await pb.collection("notes").getFullList({
    filter: `userId = "${userId}" && updated >= "${oneWeekAgo.toISOString()}"`,
    sort: "-updated",
  });
  return records.map(mapRecordToNote);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRecordToNote(record: any): Note {
  return {
    id: record.id as string,
    title: (record.title as string) || "",
    content: (record.content as string) || "",
    tags: (record.tags as string[]) || [],
    userId: record.userId as string,
    created: record.created as string,
    updated: record.updated as string,
  };
}
