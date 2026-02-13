import { create } from "zustand";
import pb, {
  type User,
  login as pbLogin,
  register as pbRegister,
  logout as pbLogout,
  getCurrentUser,
} from "@/lib/pocketbase";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  init: () => {
    const user = getCurrentUser();
    set({ user, initialized: true });

    pb.authStore.onChange(() => {
      const user = getCurrentUser();
      set({ user });
    });
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      await pbLogin(email, password);
      set({ user: getCurrentUser(), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (email, password, name) => {
    set({ loading: true });
    try {
      await pbRegister(email, password, name);
      set({ user: getCurrentUser(), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    pbLogout();
    set({ user: null });
  },
}));
