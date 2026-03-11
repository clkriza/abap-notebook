import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/lib/useT";
import { EntryCard } from "@/components/entries/EntryCard";
import { ENTRY_TYPE_LABELS, SAP_MODULES, type EntryType, type SAPModule } from "@/types";

export function HomePage() {
  const { entries, isLoading, filters, setFilters, loadEntries } = useAppStore();
  const navigate = useNavigate();
  const t = useT();
  const [filterOpen, setFilterOpen] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const hasFilters = !!(filters.types?.length || filters.modules?.length);

  return (
    <div className="flex h-full">
      {filterOpen && (
        <aside className="w-44 shrink-0 border-r border-border p-3 space-y-4 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {t("filterType")}
            </p>
            <div className="space-y-0.5">
              {(Object.keys(ENTRY_TYPE_LABELS) as EntryType[]).map((type) => {
                const active = filters.types?.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => {
                      const cur = filters.types ?? [];
                      setFilters({
                        ...filters,
                        types: active ? cur.filter((t) => t !== type) : [...cur, type],
                      });
                    }}
                    className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    {ENTRY_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {t("filterModule")}
            </p>
            <div className="space-y-0.5">
              {SAP_MODULES.map((mod) => {
                const active = filters.modules?.includes(mod);
                return (
                  <button
                    key={mod}
                    onClick={() => {
                      const cur = filters.modules ?? [];
                      setFilters({
                        ...filters,
                        modules: active ? cur.filter((m) => m !== mod) : [...cur, mod as SAPModule],
                      });
                    }}
                    className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    {mod}
                  </button>
                );
              })}
            </div>
          </div>

          {hasFilters && (
            <button onClick={() => setFilters({})} className="text-xs text-muted-foreground hover:text-foreground underline">
              {t("clearFilters")}
            </button>
          )}
        </aside>
      )}

      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setFilterOpen((v) => !v)}
              title={filterOpen ? "Hide filters" : "Show filters"}
              className={`p-1.5 rounded-md transition-colors shrink-0 ${filterOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"}`}
            >
              {filterOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
            </button>
            <h1 className="text-sm font-semibold truncate">
              {t("allEntries")}
              {entries.length > 0 && (
                <span className="ml-1.5 font-normal text-muted-foreground">({entries.length})</span>
              )}
            </h1>
            {hasFilters && (
              <button onClick={() => setFilters({})} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0">
                <X className="h-3 w-3" />{t("clearFilters")}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={loadEntries} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground" title={t("refresh")}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => navigate("/entry/new")}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t("new")}
            </button>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">{t("loading")}</div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <p className="text-4xl mb-4">📒</p>
              <h2 className="text-lg font-medium mb-1">{t("emptyTitle")}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t("emptyDesc")}</p>
              <button
                onClick={() => navigate("/entry/new")}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />{t("emptyCta")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
