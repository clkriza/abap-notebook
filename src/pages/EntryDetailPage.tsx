import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr as trLocale, enUS } from "date-fns/locale";
import { api } from "@/lib/tauri";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/lib/useT";
import { ENTRY_TYPE_ICONS, ENTRY_TYPE_LABELS } from "@/types";
import type { Entry } from "@/types";
import { CodeBlocksPanel } from "@/components/entries/CodeBlocksPanel";

const STATUS_COLORS = {
  Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Deprecated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  Review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const STATUS_LABEL_KEYS = {
  Active: "statusActive",
  Draft: "statusDraft",
  Deprecated: "statusDeprecated",
  Review: "statusReview",
} as const;

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { removeEntry, lang } = useAppStore();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      api
        .getEntry(id)
        .then((e) => { if (!e) navigate("/"); else setEntry(e); })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    if (!entry) return;
    if (!confirm(t("deleteConfirm"))) return;
    await api.deleteEntry(entry.id);
    removeEntry(entry.id);
    navigate("/");
  };

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">{t("loading")}</div>;
  if (!entry) return null;

  const typeIcon = ENTRY_TYPE_ICONS[entry.type as keyof typeof ENTRY_TYPE_ICONS];
  const typeLabel = ENTRY_TYPE_LABELS[entry.type as keyof typeof ENTRY_TYPE_LABELS];
  const locale = lang === "tr" ? trLocale : enUS;

  const paramsByDir = entry.parameters.reduce<Record<string, typeof entry.parameters>>(
    (acc, p) => { acc[p.direction] = acc[p.direction] ?? []; acc[p.direction].push(p); return acc; },
    {}
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-3xl sm:text-4xl leading-none mt-1 shrink-0">{typeIcon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-muted-foreground">{typeLabel}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{entry.module}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}`}>
                {t(STATUS_LABEL_KEYS[entry.status as keyof typeof STATUS_LABEL_KEYS])}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold break-words">{entry.title}</h1>
            {entry.programName && (
              <p className="text-sm font-mono text-muted-foreground mt-0.5 break-all">{entry.programName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => navigate(`/entry/${entry.id}/edit`)}
            className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">{t("edit")}</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t("delete")}</span>
          </button>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-6 text-xs">
        {entry.packageName && (
          <div className="rounded-md border border-border p-2">
            <p className="text-muted-foreground mb-0.5">{t("detailPackage")}</p>
            <p className="font-mono font-medium truncate">{entry.packageName}</p>
          </div>
        )}
        {entry.transportRequest && (
          <div className="rounded-md border border-border p-2">
            <p className="text-muted-foreground mb-0.5">{t("detailTransport")}</p>
            <p className="font-mono font-medium truncate">{entry.transportRequest}</p>
          </div>
        )}
        {entry.sapRelease && (
          <div className="rounded-md border border-border p-2">
            <p className="text-muted-foreground mb-0.5">{t("detailSapRelease")}</p>
            <p className="font-medium">{entry.sapRelease}</p>
          </div>
        )}
        {entry.systemId && (
          <div className="rounded-md border border-border p-2">
            <p className="text-muted-foreground mb-0.5">{t("detailSystem")}</p>
            <p className="font-mono font-medium">{entry.systemId}</p>
          </div>
        )}
        <div className="rounded-md border border-border p-2">
          <p className="text-muted-foreground mb-0.5">{t("detailLayer")}</p>
          <p className="font-medium">{entry.layer}</p>
        </div>
        <div className="rounded-md border border-border p-2">
          <p className="text-muted-foreground mb-0.5">{t("detailUpdated")}</p>
          <p className="font-medium">{formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true, locale })}</p>
        </div>
      </div>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {entry.tags.map((tag) => (
            <span key={tag.id} className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {entry.description && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("formDescription")}</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.description}</p>
        </section>
      )}

      {entry.purpose && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("formPurpose")}</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.purpose}</p>
        </section>
      )}

      {entry.usage && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("formUsage")}</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.usage}</p>
        </section>
      )}

      {/* Parameters */}
      {entry.parameters.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t("detailParameters")}</h2>
          {Object.entries(paramsByDir).map(([dir, params]) => (
            <div key={dir} className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">{dir}</p>
              <div className="rounded-md border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-xs min-w-[400px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">{t("detailParamName")}</th>
                      <th className="text-left px-3 py-2 font-medium">{t("detailParamType")}</th>
                      <th className="text-left px-3 py-2 font-medium">{t("detailParamOptional")}</th>
                      <th className="text-left px-3 py-2 font-medium">{t("formDescription")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {params.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-3 py-2 font-mono font-medium">{p.name}</td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{p.abapType}</td>
                        <td className="px-3 py-2">{p.optional ? "✓" : ""}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Related TCodes */}
      {entry.relatedTcodes.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("detailRelatedTcodes")}</h2>
          <div className="flex flex-wrap gap-1.5">
            {entry.relatedTcodes.map((tc) => (
              <span key={tc} className="text-xs px-2 py-1 rounded bg-muted font-mono">{tc}</span>
            ))}
          </div>
        </section>
      )}

      {/* Code Blocks */}
      <CodeBlocksPanel entryId={entry.id} initialBlocks={entry.codeBlocks} />
    </div>
  );
}
