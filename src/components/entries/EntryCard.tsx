import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { tr as trLocale, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/lib/useT";
import { ENTRY_TYPE_ICONS, ENTRY_TYPE_LABELS, type EntryListItem } from "@/types";
import type { TranslationKey } from "@/lib/i18n";

const STATUS_COLORS = {
  Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Deprecated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  Review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_KEY: Record<string, TranslationKey> = {
  Active: "statusActive",
  Draft: "statusDraft",
  Deprecated: "statusDeprecated",
  Review: "statusReview",
};

interface EntryCardProps {
  entry: EntryListItem;
}

export function EntryCard({ entry }: EntryCardProps) {
  const navigate = useNavigate();
  const { lang } = useAppStore();
  const t = useT();
  const locale = lang === "tr" ? trLocale : enUS;

  return (
    <button
      onClick={() => navigate(`/entry/${entry.id}`)}
      className="w-full text-left rounded-lg border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 leading-none mt-0.5">
          {ENTRY_TYPE_ICONS[entry.type as keyof typeof ENTRY_TYPE_ICONS]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs text-muted-foreground">
              {ENTRY_TYPE_LABELS[entry.type as keyof typeof ENTRY_TYPE_LABELS]}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs font-medium text-muted-foreground">
              {entry.module}
            </span>
            <span
              className={cn(
                "ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium",
                STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]
              )}
            >
              {t(STATUS_KEY[entry.status] ?? "statusDraft")}
            </span>
          </div>

          <h3 className="font-medium text-sm text-foreground truncate">
            {entry.title}
          </h3>

          {entry.programName && (
            <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
              {entry.programName}
            </p>
          )}

          {entry.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {entry.description}
            </p>
          )}

          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground"
                >
                  {tag.name}
                </span>
              ))}
              {entry.tags.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{entry.tags.length - 4}
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(entry.updatedAt), {
              addSuffix: true,
              locale,
            })}
          </p>
        </div>
      </div>
    </button>
  );
}
