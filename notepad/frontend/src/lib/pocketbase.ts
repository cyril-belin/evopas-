import PocketBase, { RecordModel } from "pocketbase";

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
);

pb.autoCancellation(false);

export default pb;

// Types
export interface User extends RecordModel {
  email: string;
  name: string;
  avatar: string;
}

export interface Note extends RecordModel {
  title: string;
  content: string;
  user: string;
  tags: string[];
  is_pinned: boolean;
  is_deleted: boolean;
  folder: string;
  color: string;
  icon: string;
  word_count: number;
  last_edited_at: string;
  is_public: boolean;
  share_slug: string;
  allow_edit: boolean;
}

export interface Folder extends RecordModel {
  name: string;
  user: string;
  parent_folder: string;
  color: string;
  icon: string;
}

export interface NoteVersion extends RecordModel {
  note: string;
  content: string;
  created_by: string;
}

export interface NoteCollaborator extends RecordModel {
  note: string;
  user: string;
  role: "viewer" | "editor";
}

// Auth helpers
export function isAuthenticated(): boolean {
  return pb.authStore.isValid;
}

export function getCurrentUser(): User | null {
  if (!pb.authStore.isValid) return null;
  return pb.authStore.record as unknown as User;
}

export async function login(email: string, password: string) {
  return pb.collection("users").authWithPassword(email, password);
}

export async function register(
  email: string,
  password: string,
  name: string
) {
  const user = await pb.collection("users").create({
    email,
    password,
    passwordConfirm: password,
    name,
  });

  await pb.collection("users").authWithPassword(email, password);

  // Create welcome note
  await pb.collection("notes").create({
    title: "Welcome to Notepad! 👋",
    content: `<h2>Welcome to your new notepad!</h2>
<p>Here are some things you can do:</p>
<ul>
<li>Create and organize notes in folders</li>
<li>Use <strong>rich text editing</strong> with markdown support</li>
<li>Use <code>/</code> slash commands for quick formatting</li>
<li>Share notes publicly or with collaborators</li>
<li>Search everything with <kbd>Cmd+K</kbd></li>
<li>Pin your favorite notes</li>
</ul>
<p>Start by creating your first note! ✨</p>`,
    user: user.id,
    tags: ["getting-started"],
    is_pinned: true,
    is_deleted: false,
    color: "",
    icon: "📝",
    word_count: 45,
    last_edited_at: new Date().toISOString(),
    is_public: false,
    share_slug: "",
    allow_edit: false,
  });

  return user;
}

export async function logout() {
  pb.authStore.clear();
}

// Notes CRUD
export async function getNotes(
  userId: string,
  options?: {
    folder?: string;
    deleted?: boolean;
    search?: string;
    tags?: string[];
  }
) {
  let filter = `user = "${userId}"`;

  if (options?.deleted) {
    filter += ` && is_deleted = true`;
  } else {
    filter += ` && is_deleted = false`;
  }

  if (options?.folder) {
    filter += ` && folder = "${options.folder}"`;
  }

  if (options?.search) {
    const s = options.search.replace(/"/g, '\\"');
    filter += ` && (title ~ "${s}" || content ~ "${s}")`;
  }

  if (options?.tags && options.tags.length > 0) {
    for (const tag of options.tags) {
      filter += ` && tags ~ "${tag}"`;
    }
  }

  return pb.collection("notes").getFullList<Note>({
    filter,
    sort: "-is_pinned,-last_edited_at",
  });
}

export async function getNote(id: string) {
  return pb.collection("notes").getOne<Note>(id);
}

export async function createNote(
  userId: string,
  data?: Partial<Note>
) {
  return pb.collection("notes").create<Note>({
    title: "Untitled",
    content: "",
    user: userId,
    tags: [],
    is_pinned: false,
    is_deleted: false,
    folder: "",
    color: "",
    icon: "",
    word_count: 0,
    last_edited_at: new Date().toISOString(),
    is_public: false,
    share_slug: "",
    allow_edit: false,
    ...data,
  });
}

export async function updateNote(id: string, data: Partial<Note>) {
  return pb.collection("notes").update<Note>(id, {
    ...data,
    last_edited_at: new Date().toISOString(),
  });
}

export async function deleteNote(id: string, permanent = false) {
  if (permanent) {
    return pb.collection("notes").delete(id);
  }
  return pb.collection("notes").update<Note>(id, { is_deleted: true });
}

export async function restoreNote(id: string) {
  return pb.collection("notes").update<Note>(id, { is_deleted: false });
}

export async function duplicateNote(noteId: string, userId: string) {
  const note = await getNote(noteId);
  return createNote(userId, {
    title: `${note.title} (copy)`,
    content: note.content,
    tags: note.tags,
    folder: note.folder,
    color: note.color,
    icon: note.icon,
    word_count: note.word_count,
  });
}

// Folders CRUD
export async function getFolders(userId: string) {
  return pb.collection("folders").getFullList<Folder>({
    filter: `user = "${userId}"`,
    sort: "name",
  });
}

export async function createFolder(
  userId: string,
  name: string,
  parentFolder?: string
) {
  return pb.collection("folders").create<Folder>({
    name,
    user: userId,
    parent_folder: parentFolder || "",
    color: "",
    icon: "📁",
  });
}

export async function updateFolder(id: string, data: Partial<Folder>) {
  return pb.collection("folders").update<Folder>(id, data);
}

export async function deleteFolder(id: string) {
  return pb.collection("folders").delete(id);
}

// Versions
export async function getNoteVersions(noteId: string) {
  return pb.collection("note_versions").getFullList<NoteVersion>({
    filter: `note = "${noteId}"`,
    sort: "-created",
  });
}

export async function createNoteVersion(
  noteId: string,
  content: string,
  userId: string
) {
  return pb.collection("note_versions").create<NoteVersion>({
    note: noteId,
    content,
    created_by: userId,
  });
}

export async function restoreNoteVersion(
  noteId: string,
  versionId: string
) {
  const version = await pb
    .collection("note_versions")
    .getOne<NoteVersion>(versionId);
  return updateNote(noteId, { content: version.content });
}

// Collaborators
export async function getNoteCollaborators(noteId: string) {
  return pb.collection("note_collaborators").getFullList<NoteCollaborator>({
    filter: `note = "${noteId}"`,
    expand: "user",
  });
}

export async function addCollaborator(
  noteId: string,
  userEmail: string,
  role: "viewer" | "editor"
) {
  const users = await pb.collection("users").getFullList({
    filter: `email = "${userEmail}"`,
  });
  if (users.length === 0) throw new Error("User not found");

  return pb.collection("note_collaborators").create<NoteCollaborator>({
    note: noteId,
    user: users[0].id,
    role,
  });
}

export async function removeCollaborator(id: string) {
  return pb.collection("note_collaborators").delete(id);
}

// Sharing
export async function toggleNoteSharing(noteId: string, isPublic: boolean) {
  const data: Partial<Note> = { is_public: isPublic };
  if (isPublic) {
    const { generateSlug } = await import("./utils");
    data.share_slug = generateSlug(12);
  } else {
    data.share_slug = "";
  }
  return updateNote(noteId, data);
}

export async function getNoteBySlug(slug: string) {
  return pb.collection("notes").getFirstListItem<Note>(
    `share_slug = "${slug}" && is_public = true`
  );
}

// Realtime subscriptions
export function subscribeToNotes(
  userId: string,
  callback: (data: { action: string; record: Note }) => void
) {
  return pb.collection("notes").subscribe<Note>("*", (e) => {
    if (e.record.user === userId) {
      callback({ action: e.action, record: e.record });
    }
  });
}

export function unsubscribeFromNotes() {
  pb.collection("notes").unsubscribe("*");
}
