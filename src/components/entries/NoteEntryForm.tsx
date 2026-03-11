import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  type Status,
  type CodeLanguage,
  type CreateEntryInput,
} from "@/types";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { useT } from "@/lib/useT";
import type { CodeBlockDraft } from "./EntryForm";

const STATUSES: Status[] = ["Draft", "Active", "Deprecated", "Review"];
const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "abap", label: "ABAP" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
];

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const selectClass = inputClass;

interface NoteEntryFormProps {
  initialValues?: Partial<CreateEntryInput>;
  onSubmit: (input: CreateEntryInput, codeDrafts: CodeBlockDraft[]) => Promise<void>;
  isSubmitting: boolean;
}

export function NoteEntryForm({ initialValues, onSubmit, isSubmitting }: NoteEntryFormProps) {
  const navigate = useNavigate();
  const t = useT();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [status, setStatus] = useState<Status>(initialValues?.status ?? "Draft");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [tagsInput, setTagsInput] = useState((initialValues?.tagNames ?? []).join(", "));
  const [codeDrafts, setCodeDrafts] = useState<CodeBlockDraft[]>([]);
  const [openDraftIdx, setOpenDraftIdx] = useState<number | null>(null);

  const addDraft = () => {
    const newIdx = codeDrafts.length;
    setCodeDrafts((prev) => [...prev, { label: "", language: "abap", code: "", description: "" }]);
    setOpenDraftIdx(newIdx);
  };

  const removeDraft = (idx: number) => {
    setCodeDrafts((prev) => prev.filter((_, i) => i !== idx));
    if (openDraftIdx === idx) setOpenDraftIdx(null);
    else if (openDraftIdx !== null && openDraftIdx > idx) setOpenDraftIdx(openDraftIdx - 1);
  };

  const updateDraft = (idx: number, patch: Partial<CodeBlockDraft>) =>
    setCodeDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      {
        type: "NOTE",
        title,
        module: "OTHER",
        layer: "Application",
        status,
        description,
        purpose: "",
        usage: "",
        relatedTcodes: [],
        dependencies: [],
        tagNames: tagsInput.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
      },
      codeDrafts.filter((d) => d.code.trim())
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {/* Title + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium mb-1">{t("formTitle")} *</label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("formTitlePlaceholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("formStatus")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={selectClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Note Content */}
      <div>
        <label className="block text-xs font-medium mb-1">{t("noteFormContent")}</label>
        <textarea
          rows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("noteFormContentPlaceholder")}
          className={`${inputClass} resize-y`}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium mb-1">{t("formTags")}</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder={t("formTagsPlaceholder")}
          className={inputClass}
        />
      </div>

      {/* Code Blocks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium">
            {t("codeBlocks")}
            {codeDrafts.length > 0 && (
              <span className="ml-1.5 text-muted-foreground font-normal">({codeDrafts.length})</span>
            )}
          </label>
          <button
            type="button"
            onClick={addDraft}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />{t("addCodeBlock")}
          </button>
        </div>

        {codeDrafts.length === 0 ? (
          <div
            onClick={addDraft}
            className="rounded-lg border border-dashed border-border p-5 text-center cursor-pointer hover:border-primary/50 transition-colors group"
          >
            <Plus className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {t("codeBlockAddHint")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {codeDrafts.map((draft, idx) => (
              <div key={idx} className="rounded-lg border border-border overflow-hidden">
                <div
                  className="flex items-center justify-between px-3 py-2 bg-muted/50 cursor-pointer select-none"
                  onClick={() => setOpenDraftIdx(openDraftIdx === idx ? null : idx)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {openDraftIdx === idx
                      ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    <span className="text-xs font-medium truncate">
                      {draft.label || `${t("codeBlocks")} ${idx + 1}`}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono uppercase shrink-0">
                      {draft.language}
                    </span>
                    {!draft.code.trim() && (
                      <span className="text-xs text-muted-foreground italic hidden sm:inline">
                        — {t("codeBlockEmpty")}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeDraft(idx); }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5 shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {openDraftIdx === idx && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3 px-3 pt-3 pb-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium mb-1">{t("codeBlockLabel")}</label>
                        <input
                          type="text"
                          value={draft.label}
                          onChange={(e) => updateDraft(idx, { label: e.target.value })}
                          placeholder={t("codeBlockLabelPlaceholder")}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="sm:w-32">
                        <label className="block text-xs font-medium mb-1">{t("codeBlockLang")}</label>
                        <select
                          value={draft.language}
                          onChange={(e) => updateDraft(idx, { language: e.target.value as CodeLanguage })}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="px-3 pb-2">
                      <label className="block text-xs font-medium mb-1">
                        {t("codeBlockDesc")}{" "}
                        <span className="text-muted-foreground font-normal">({t("optional")})</span>
                      </label>
                      <input
                        type="text"
                        value={draft.description}
                        onChange={(e) => updateDraft(idx, { description: e.target.value })}
                        placeholder={t("codeBlockDescPlaceholder")}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="border-t border-border">
                      <CodeEditor
                        value={draft.code}
                        language={draft.language}
                        onChange={(v) => updateDraft(idx, { code: v })}
                        minHeight="200px"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-md border border-border text-sm hover:bg-accent transition-colors"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
