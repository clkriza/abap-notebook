import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  ENTRY_TYPE_LABELS,
  SAP_MODULES,
  type EntryType,
  type SAPModule,
  type Layer,
  type Status,
  type CodeLanguage,
  type CreateEntryInput,
} from "@/types";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { useT } from "@/lib/useT";

const LAYERS: Layer[] = ["Application", "Framework", "Utility", "Integration", "UI"];
const STATUSES: Status[] = ["Draft", "Active", "Deprecated", "Review"];
const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "abap", label: "ABAP" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
];

export interface CodeBlockDraft {
  label: string;
  language: CodeLanguage;
  code: string;
  description: string;
}

interface EntryFormProps {
  defaultType?: EntryType;
  initialValues?: Partial<CreateEntryInput>;
  onSubmit: (input: CreateEntryInput, codeDrafts: CodeBlockDraft[]) => Promise<void>;
  isSubmitting: boolean;
}

const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const selectClass = inputClass;

export function EntryForm({ defaultType = "SNIPPET", initialValues, onSubmit, isSubmitting }: EntryFormProps) {
  const navigate = useNavigate();
  const t = useT();

  const [form, setForm] = useState<CreateEntryInput>({
    type: initialValues?.type ?? defaultType,
    title: initialValues?.title ?? "",
    programName: initialValues?.programName ?? "",
    packageName: initialValues?.packageName ?? "",
    transportRequest: initialValues?.transportRequest ?? "",
    sapRelease: initialValues?.sapRelease ?? "",
    systemId: initialValues?.systemId ?? "",
    module: initialValues?.module ?? "OTHER",
    layer: initialValues?.layer ?? "Application",
    status: initialValues?.status ?? "Draft",
    description: initialValues?.description ?? "",
    purpose: initialValues?.purpose ?? "",
    usage: initialValues?.usage ?? "",
    relatedTcodes: initialValues?.relatedTcodes ?? [],
    dependencies: initialValues?.dependencies ?? [],
    tagNames: initialValues?.tagNames ?? [],
  });

  const [tcodesInput, setTcodesInput] = useState((initialValues?.relatedTcodes ?? []).join(", "));
  const [tagsInput, setTagsInput] = useState((initialValues?.tagNames ?? []).join(", "));
  const [depsInput, setDepsInput] = useState((initialValues?.dependencies ?? []).join(", "));
  const [codeDrafts, setCodeDrafts] = useState<CodeBlockDraft[]>([]);
  const [openDraftIdx, setOpenDraftIdx] = useState<number | null>(null);

  const set = (field: keyof CreateEntryInput, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

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
        ...form,
        relatedTcodes: tcodesInput.split(",").map((s) => s.trim()).filter(Boolean),
        dependencies: depsInput.split(",").map((s) => s.trim()).filter(Boolean),
        tagNames: tagsInput.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
      },
      codeDrafts.filter((d) => d.code.trim())
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {/* Type + Title */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">{t("formType")} *</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value as EntryType)} className={selectClass}>
            {(Object.keys(ENTRY_TYPE_LABELS) as EntryType[]).map((type) => (
              <option key={type} value={type}>{ENTRY_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1">{t("formTitle")} *</label>
          <input required type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder={t("formTitlePlaceholder")} className={inputClass} />
        </div>
      </div>

      {/* SAP Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">{t("formProgramName")}</label>
          <input type="text" value={form.programName ?? ""} onChange={(e) => set("programName", e.target.value)}
            placeholder={t("formProgramPlaceholder")} className={`${inputClass} font-mono`} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("formPackage")}</label>
          <input type="text" value={form.packageName ?? ""} onChange={(e) => set("packageName", e.target.value)}
            placeholder={t("formPackagePlaceholder")} className={`${inputClass} font-mono`} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("formTransport")}</label>
          <input type="text" value={form.transportRequest ?? ""} onChange={(e) => set("transportRequest", e.target.value)}
            placeholder={t("formTransportPlaceholder")} className={`${inputClass} font-mono`} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("formSapRelease")}</label>
          <input type="text" value={form.sapRelease ?? ""} onChange={(e) => set("sapRelease", e.target.value)}
            placeholder={t("formReleasePlaceholder")} className={inputClass} />
        </div>
      </div>

      {/* Classification */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">{t("formModule")} *</label>
          <select value={form.module} onChange={(e) => set("module", e.target.value as SAPModule)} className={selectClass}>
            {SAP_MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("formLayer")}</label>
          <select value={form.layer} onChange={(e) => set("layer", e.target.value as Layer)} className={selectClass}>
            {LAYERS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("formStatus")}</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value as Status)} className={selectClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Texts */}
      <div>
        <label className="block text-xs font-medium mb-1">{t("formDescription")}</label>
        <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
          placeholder={t("formDescPlaceholder")} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">{t("formPurpose")}</label>
        <textarea rows={2} value={form.purpose} onChange={(e) => set("purpose", e.target.value)}
          placeholder={t("formPurposePlaceholder")} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">{t("formUsage")}</label>
        <textarea rows={2} value={form.usage} onChange={(e) => set("usage", e.target.value)}
          placeholder={t("formUsagePlaceholder")} className={`${inputClass} resize-none`} />
      </div>

      {/* Tags & TCodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">{t("formTags")}</label>
          <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
            placeholder={t("formTagsPlaceholder")} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t("formTcodes")}</label>
          <input type="text" value={tcodesInput} onChange={(e) => setTcodesInput(e.target.value)}
            placeholder={t("formTcodesPlaceholder")} className={`${inputClass} font-mono`} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">{t("formDeps")}</label>
        <input type="text" value={depsInput} onChange={(e) => setDepsInput(e.target.value)}
          placeholder={t("formDepsPlaceholder")} className={`${inputClass} font-mono`} />
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
          <button type="button" onClick={addDraft}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-dashed border-border hover:border-primary hover:text-primary transition-colors">
            <Plus className="h-3.5 w-3.5" />{t("addCodeBlock")}
          </button>
        </div>

        {codeDrafts.length === 0 ? (
          <div onClick={addDraft}
            className="rounded-lg border border-dashed border-border p-5 text-center cursor-pointer hover:border-primary/50 transition-colors group">
            <Plus className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{t("codeBlockAddHint")}</p>
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
                    <span className="text-xs font-medium truncate">{draft.label || `${t("codeBlocks")} ${idx + 1}`}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono uppercase shrink-0">{draft.language}</span>
                    {!draft.code.trim() && (
                      <span className="text-xs text-muted-foreground italic hidden sm:inline">— {t("codeBlockEmpty")}</span>
                    )}
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeDraft(idx); }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5 shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {openDraftIdx === idx && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3 px-3 pt-3 pb-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium mb-1">{t("codeBlockLabel")}</label>
                        <input type="text" value={draft.label} onChange={(e) => updateDraft(idx, { label: e.target.value })}
                          placeholder={t("codeBlockLabelPlaceholder")}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div className="sm:w-32">
                        <label className="block text-xs font-medium mb-1">{t("codeBlockLang")}</label>
                        <select value={draft.language} onChange={(e) => updateDraft(idx, { language: e.target.value as CodeLanguage })}
                          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                          {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="px-3 pb-2">
                      <label className="block text-xs font-medium mb-1">
                        {t("codeBlockDesc")} <span className="text-muted-foreground font-normal">({t("optional")})</span>
                      </label>
                      <input type="text" value={draft.description} onChange={(e) => updateDraft(idx, { description: e.target.value })}
                        placeholder={t("codeBlockDescPlaceholder")}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div className="border-t border-border">
                      <CodeEditor value={draft.code} language={draft.language} onChange={(v) => updateDraft(idx, { code: v })} minHeight="200px" />
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
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          {isSubmitting ? t("saving") : t("save")}
        </button>
        <button type="button" onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-md border border-border text-sm hover:bg-accent transition-colors">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
