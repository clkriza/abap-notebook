import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/store/useAppStore";

export function RootLayout() {
  const { theme, loadEntries } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    loadEntries();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0 transition-all duration-200">
        <Outlet />
      </main>
    </div>
  );
}
