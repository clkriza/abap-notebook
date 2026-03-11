import { create } from "zustand";
import type { EntryListItem, SearchFilters } from "@/types";
import { api } from "@/lib/tauri";
import type { Lang } from "@/lib/i18n";

interface AppState {
  entries: EntryListItem[];
  isLoading: boolean;
  filters: SearchFilters;
  theme: "light" | "dark";
  lang: Lang;
  sidebarOpen: boolean;

  loadEntries: () => Promise<void>;
  setFilters: (filters: SearchFilters) => void;
  toggleTheme: () => void;
  removeEntry: (id: string) => void;
  setLang: (lang: Lang) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  entries: [],
  isLoading: false,
  filters: {},
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  lang: (localStorage.getItem("lang") as Lang) || "tr",
  sidebarOpen: localStorage.getItem("sidebarOpen") !== "false",

  loadEntries: async () => {
    set({ isLoading: true });
    try {
      const entries = await api.listEntries(get().filters);
      set({ entries });
    } catch (err) {
      console.error("Failed to load entries:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().loadEntries();
  },

  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  },

  removeEntry: (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  },

  setLang: (lang) => {
    localStorage.setItem("lang", lang);
    set({ lang });
  },

  toggleSidebar: () => {
    const next = !get().sidebarOpen;
    localStorage.setItem("sidebarOpen", String(next));
    set({ sidebarOpen: next });
  },
}));
