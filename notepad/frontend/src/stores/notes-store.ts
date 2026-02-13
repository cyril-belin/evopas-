import { create } from "zustand";
import {
  type Note,
  type Folder,
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  duplicateNote,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  subscribeToNotes,
  unsubscribeFromNotes,
} from "@/lib/pocketbase";

interface NotesState {
  notes: Note[];
  folders: Folder[];
  activeNote: Note | null;
  activeFolder: string | null;
  viewMode: "grid" | "list";
  searchQuery: string;
  selectedTags: string[];
  saveStatus: "saved" | "saving" | "unsaved";
  sidebarOpen: boolean;
  focusMode: boolean;
  loading: boolean;

  // Actions
  fetchNotes: (userId: string, options?: { folder?: string; deleted?: boolean; search?: string; tags?: string[] }) => Promise<void>;
  fetchFolders: (userId: string) => Promise<void>;
  setActiveNote: (note: Note | null) => void;
  loadNote: (id: string) => Promise<void>;
  createNewNote: (userId: string, folderId?: string) => Promise<Note>;
  updateActiveNote: (data: Partial<Note>) => Promise<void>;
  deleteActiveNote: (permanent?: boolean) => Promise<void>;
  restoreActiveNote: () => Promise<void>;
  duplicateActiveNote: (userId: string) => Promise<Note>;
  togglePin: (noteId: string) => Promise<void>;
  setActiveFolder: (folderId: string | null) => void;
  createNewFolder: (userId: string, name: string, parentId?: string) => Promise<Folder>;
  updateExistingFolder: (id: string, data: Partial<Folder>) => Promise<void>;
  deleteExistingFolder: (id: string) => Promise<void>;
  setViewMode: (mode: "grid" | "list") => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSaveStatus: (status: "saved" | "saving" | "unsaved") => void;
  toggleSidebar: () => void;
  toggleFocusMode: () => void;
  subscribeRealtime: (userId: string) => void;
  unsubscribeRealtime: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  folders: [],
  activeNote: null,
  activeFolder: null,
  viewMode: "grid",
  searchQuery: "",
  selectedTags: [],
  saveStatus: "saved",
  sidebarOpen: true,
  focusMode: false,
  loading: false,

  fetchNotes: async (userId, options) => {
    set({ loading: true });
    try {
      const notes = await getNotes(userId, options);
      set({ notes, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchFolders: async (userId) => {
    try {
      const folders = await getFolders(userId);
      set({ folders });
    } catch {
      // silently fail
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  loadNote: async (id) => {
    try {
      const note = await getNote(id);
      set({ activeNote: note });
    } catch {
      set({ activeNote: null });
    }
  },

  createNewNote: async (userId, folderId) => {
    const note = await createNote(userId, {
      folder: folderId || "",
    });
    const { notes } = get();
    set({ notes: [note, ...notes], activeNote: note });
    return note;
  },

  updateActiveNote: async (data) => {
    const { activeNote, notes } = get();
    if (!activeNote) return;
    set({ saveStatus: "saving" });
    try {
      const updated = await updateNote(activeNote.id, data);
      set({
        activeNote: updated,
        notes: notes.map((n) => (n.id === updated.id ? updated : n)),
        saveStatus: "saved",
      });
    } catch {
      set({ saveStatus: "unsaved" });
    }
  },

  deleteActiveNote: async (permanent) => {
    const { activeNote, notes } = get();
    if (!activeNote) return;
    await deleteNote(activeNote.id, permanent);
    if (permanent) {
      set({
        notes: notes.filter((n) => n.id !== activeNote.id),
        activeNote: null,
      });
    } else {
      const updated = { ...activeNote, is_deleted: true };
      set({
        notes: notes.filter((n) => n.id !== activeNote.id),
        activeNote: null,
      });
      // Keep it in the list if we're viewing trash
      void updated;
    }
  },

  restoreActiveNote: async () => {
    const { activeNote, notes } = get();
    if (!activeNote) return;
    const restored = await restoreNote(activeNote.id);
    set({
      activeNote: restored,
      notes: notes.map((n) => (n.id === restored.id ? restored : n)),
    });
  },

  duplicateActiveNote: async (userId) => {
    const { activeNote, notes } = get();
    if (!activeNote) return activeNote as unknown as Note;
    const dup = await duplicateNote(activeNote.id, userId);
    set({ notes: [dup, ...notes] });
    return dup;
  },

  togglePin: async (noteId) => {
    const { notes } = get();
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const updated = await updateNote(noteId, {
      is_pinned: !note.is_pinned,
    });
    set({
      notes: notes.map((n) => (n.id === updated.id ? updated : n)),
      activeNote:
        get().activeNote?.id === updated.id ? updated : get().activeNote,
    });
  },

  setActiveFolder: (folderId) => set({ activeFolder: folderId }),

  createNewFolder: async (userId, name, parentId) => {
    const folder = await createFolder(userId, name, parentId);
    set({ folders: [...get().folders, folder] });
    return folder;
  },

  updateExistingFolder: async (id, data) => {
    const updated = await updateFolder(id, data);
    set({
      folders: get().folders.map((f) => (f.id === updated.id ? updated : f)),
    });
  },

  deleteExistingFolder: async (id) => {
    await deleteFolder(id);
    set({ folders: get().folders.filter((f) => f.id !== id) });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  toggleFocusMode: () => set({ focusMode: !get().focusMode }),

  subscribeRealtime: (userId) => {
    subscribeToNotes(userId, ({ action, record }) => {
      const { notes } = get();
      if (action === "create") {
        if (!notes.find((n) => n.id === record.id)) {
          set({ notes: [record, ...notes] });
        }
      } else if (action === "update") {
        set({
          notes: notes.map((n) => (n.id === record.id ? record : n)),
          activeNote:
            get().activeNote?.id === record.id ? record : get().activeNote,
        });
      } else if (action === "delete") {
        set({
          notes: notes.filter((n) => n.id !== record.id),
          activeNote:
            get().activeNote?.id === record.id ? null : get().activeNote,
        });
      }
    });
  },

  unsubscribeRealtime: () => {
    unsubscribeFromNotes();
  },
}));
