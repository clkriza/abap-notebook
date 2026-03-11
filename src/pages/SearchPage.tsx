import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/tauri";
import { useT } from "@/lib/useT";
import { EntryCard } from "@/components/entries/EntryCard";
import type { EntryListItem } from "@/types";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntryListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const t = useT();

  const search = useCallback(async (q: string) => {
    setIsSearching(true);
    try {
      const res = await api.listEntries({ query: q });
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) search(query);
      else setResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{t("navSearch")}</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          autoFocus
          type="text"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {query && (
        <p className="text-sm text-muted-foreground mb-4">
          {isSearching
            ? t("searching")
            : `"${query}" ${t("noResultsFor").startsWith("No") ? "—" : "için"} ${results.length} ${results.length !== 1 ? t("searchResultsSuffixPlural") : t("searchResultsSuffix")}`}
        </p>
      )}

      {!query && (
        <p className="text-sm text-muted-foreground text-center mt-12">
          {t("searchHint")}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {results.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
