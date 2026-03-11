import { useState } from "react";
import { Plus, Pencil, Trash2, Copy, Check, X, Save } from "lucide-react";
import { api } from "@/lib/tauri";
import { useT } from "@/lib/useT";
import { CodeEditor } from "@/components/editor/CodeEditor";
import type { CodeBlock, CodeLanguage } from "@/types";

const LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: "abap", label: "ABAP" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
];

const LANG_COLORS: Record<CodeLanguage, string> = {
  abap: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  sql: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  xml: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  json: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  bash: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

interface EditState {
  id?: string;
  label: string;
  language: CodeLanguage;
  code: string;
  description: string;
}

interface Props {
  entryId: string;
  initialBlocks: CodeBlock[];
}

export function CodeBlocksPanel({ entryId, initialBlocks }: Props) {
  const [blocks, setBlocks] = useState<CodeBlock[]>(initialBlocks);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const t = useT();

  const startAdd = () => setEditing({ label: "", language: "abap", code: "", description: "" });
  const startEdit = (block: CodeBlock) =>
    setEditing({ id: block.id, label: block.label, language: block.language, code: block.code, description: block.description ?? "" });
  const cancelEdit = () => setEditing(null);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const position = editing.id
        ? (blocks.find((b) => b.id === editing.id)?.position ?? blocks.length)
        : blocks.length;
      const saved = await api.upsertCodeBlock({
        id: editing.id,
        entryId,
        label: editing.label || t("codeBlocks"),
        language: editing.language,
        code: editing.code,
        description: editing.description || undefined,
        highlightLines: [],
        position,
      });
      setBlocks((prev) =>
        editing.id ? prev.map((b) => (b.id === editing.id ? saved : b)) : [...prev, saved]
      );
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deleteCodeBlock(id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("codeBlocks")}
        </h2>
        {!editing && (
          <button
            onClick={startAdd}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-dashed border-border hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addCodeBlock")}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {blocks.map((block) =>
          editing?.id === block.id ? (
            <EditForm key={block.id} state={editing} onChange={setEditing} onSave={handleSave} onCancel={cancelEdit} saving={saving} />
          ) : (
            <div key={block.id} className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium truncate">{block.label || t("codeBlocks")}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ${LANG_COLORS[block.language as CodeLanguage] ?? ""}`}>
                    {block.language.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => copyCode(block.code, block.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                  >
                    {copiedId === block.id ? (
                      <><Check className="h-3.5 w-3.5 text-green-500" /><span className="text-green-500 hidden sm:inline">{t("copied")}</span></>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("copy")}</span></>
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(block)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("edit")}</span>
                  </button>
                  {confirmDeleteId === block.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(block.id)}
                        disabled={deletingId === block.id}
                        className="text-xs px-2 py-0.5 rounded bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {deletingId === block.id ? "…" : t("delete")}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs px-2 py-0.5 rounded border border-border hover:bg-accent transition-colors"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(block.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t("delete")}</span>
                    </button>
                  )}
                </div>
              </div>
              {block.description && (
                <div className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/30 border-b border-border">
                  {block.description}
                </div>
              )}
              <CodeEditor value={block.code} language={block.language as CodeLanguage} readOnly minHeight="120px" />
            </div>
          )
        )}

        {editing && !editing.id && (
          <EditForm state={editing} onChange={setEditing} onSave={handleSave} onCancel={cancelEdit} saving={saving} />
        )}

        {blocks.length === 0 && !editing && (
          <div
            className="rounded-lg border border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/50 transition-colors group"
            onClick={startAdd}
          >
            <Plus className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{t("addCodeBlock")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("codeBlockLangs")}</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface EditFormProps {
  state: EditState;
  onChange: (s: EditState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

function EditForm({ state, onChange, onSave, onCancel, saving }: EditFormProps) {
  const set = (patch: Partial<EditState>) => onChange({ ...state, ...patch });
  const t = useT();

  return (
    <div className="rounded-lg border border-primary/40 overflow-hidden bg-card shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border-b border-primary/20">
        <span className="text-xs font-medium text-primary">
          {state.id ? t("codeBlockEditTitle") : t("codeBlockNewTitle")}
        </span>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 px-3 pt-3 pb-2">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">{t("codeBlockLabel")}</label>
          <input
            type="text"
            value={state.label}
            onChange={(e) => set({ label: e.target.value })}
            placeholder={t("codeBlockLabelPlaceholder")}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="sm:w-32">
          <label className="block text-xs font-medium mb-1">{t("codeBlockLang")}</label>
          <select
            value={state.language}
            onChange={(e) => set({ language: e.target.value as CodeLanguage })}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="px-3 pb-2">
        <label className="block text-xs font-medium mb-1">
          {t("codeBlockDesc")} <span className="text-muted-foreground font-normal">({t("optional")})</span>
        </label>
        <input
          type="text"
          value={state.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder={t("codeBlockDescPlaceholder")}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="border-t border-border">
        <CodeEditor value={state.code} language={state.language} onChange={(v) => set({ code: v })} minHeight="220px" />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-muted/30">
        <button
          onClick={onSave}
          disabled={saving || !state.code.trim()}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? t("saving") : t("save")}
        </button>
        <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors">
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
