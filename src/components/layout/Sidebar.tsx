import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/lib/useT";
import { ENTRY_TYPE_ICONS, type EntryType } from "@/types";
import type { TranslationKey } from "@/lib/i18n";

const QUICK_TYPES: EntryType[] = [
  "PROGRAM",
  "FUNCTION_MODULE",
  "CLASS",
  "BAPI",
  "SNIPPET",
  "NOTE",
];

const TYPE_LABEL_KEYS: Record<EntryType, TranslationKey> = {
  PROGRAM: "typeProgram",
  FUNCTION_MODULE: "typeFunctionModule",
  CLASS: "typeClass",
  METHOD: "typeMethod",
  BAPI: "typeBapi",
  INCLUDE: "typeInclude",
  FORM: "typeForm",
  VIEW: "typeView",
  TABLE: "typeTable",
  SNIPPET: "typeSnippet",
  EXIT: "typeExit",
  SMARTFORM: "typeSmartform",
  NOTE: "typeNote",
};

export function Sidebar() {
  const { theme, toggleTheme, lang, setLang, sidebarOpen, toggleSidebar } =
    useAppStore();
  const navigate = useNavigate();
  const t = useT();

  const navItems = [
    { to: "/", label: t("navAll"), icon: BookOpen, end: true },
    { to: "/search", label: t("navSearch"), icon: Search },
    { to: "/settings", label: t("navSettings"), icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 shrink-0",
        sidebarOpen ? "w-56" : "w-14"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-4 border-b border-sidebar-border",
          !sidebarOpen && "justify-center px-0"
        )}
      >
        <BookOpen className="h-5 w-5 shrink-0 text-sidebar-primary" />
        {sidebarOpen && (
          <span className="font-semibold text-sidebar-foreground text-sm truncate">
            {t("appName")}
          </span>
        )}
      </div>

      {/* New Entry Button */}
      <div className={cn("px-2 py-3", !sidebarOpen && "px-2")}>
        <button
          onClick={() => navigate("/entry/new")}
          title={!sidebarOpen ? t("navNewEntry") : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium",
            sidebarOpen ? "w-full px-3 py-2" : "w-10 h-10 justify-center"
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {sidebarOpen && t("navNewEntry")}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                !sidebarOpen && "justify-center",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {sidebarOpen && label}
          </NavLink>
        ))}

        {/* Quick Add */}
        {sidebarOpen && (
          <div className="pt-4 pb-1">
            <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {t("navQuickAdd")}
            </p>
            {QUICK_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => navigate(`/entry/new?type=${type}`)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
              >
                <span className="text-base leading-none shrink-0">
                  {ENTRY_TYPE_ICONS[type]}
                </span>
                <span className="truncate">
                  {t(TYPE_LABEL_KEYS[type])}
                </span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-sidebar-border px-2 py-2 flex items-center gap-1",
          sidebarOpen ? "justify-between" : "flex-col justify-center"
        )}
      >
        {sidebarOpen && (
          <span className="text-xs text-muted-foreground">v0.1.0</span>
        )}

        {/* Lang toggle */}
        <button
          onClick={() => setLang(lang === "tr" ? "en" : "tr")}
          title={lang === "tr" ? "Switch to English" : "Türkçe'ye geç"}
          className="rounded-md px-1.5 py-1 text-xs font-mono font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          {lang === "tr" ? "EN" : "TR"}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "light" ? "Dark mode" : "Light mode"}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
