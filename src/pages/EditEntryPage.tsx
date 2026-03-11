import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/tauri";
import { EntryForm } from "@/components/entries/EntryForm";
import { NoteEntryForm } from "@/components/entries/NoteEntryForm";
import { CodeBlocksPanel } from "@/components/entries/CodeBlocksPanel";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/lib/useT";
import type { CreateEntryInput, Entry } from "@/types";
import type { CodeBlockDraft } from "@/components/entries/EntryForm";

export function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loadEntries } = useAppStore();
  const t = useT();

  useEffect(() => {
    if (id) api.getEntry(id).then(setEntry).catch(console.error);
  }, [id]);

  const handleSubmit = async (input: CreateEntryInput, codeDrafts: CodeBlockDraft[]) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await api.updateEntry({ ...input, id });
      for (let i = 0; i < codeDrafts.length; i++) {
        const d = codeDrafts[i];
        await api.upsertCodeBlock({
          entryId: id,
          label: d.label || `Block ${i + 1}`,
          language: d.language,
          code: d.code,
          description: d.description || undefined,
          highlightLines: [],
          position: (entry?.codeBlocks.length ?? 0) + i,
        });
      }
      await loadEntries();
      navigate(`/entry/${id}`);
    } catch (err) {
      console.error("Failed to update entry:", err);
      alert(`Error: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!entry) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  const isNote = entry.type === "NOTE";
  const pageTitle = isNote ? t("noteEditTitle") : t("editEntryTitle");

  const sharedValues = {
    type: entry.type as never,
    title: entry.title,
    status: entry.status as never,
    description: entry.description,
    tagNames: entry.tags.map((t) => t.name),
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">{pageTitle}</h1>

      {isNote ? (
        <NoteEntryForm
          initialValues={sharedValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : (
        <EntryForm
          defaultType={entry.type as never}
          initialValues={{
            ...sharedValues,
            programName: entry.programName,
            packageName: entry.packageName,
            transportRequest: entry.transportRequest,
            sapRelease: entry.sapRelease,
            systemId: entry.systemId,
            module: entry.module as never,
            layer: entry.layer as never,
            purpose: entry.purpose,
            usage: entry.usage,
            relatedTcodes: entry.relatedTcodes,
            dependencies: entry.dependencies,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {entry.codeBlocks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border max-w-3xl">
          <p className="text-xs text-muted-foreground mb-4">{t("editCodeBlocksHint")}</p>
          <CodeBlocksPanel entryId={entry.id} initialBlocks={entry.codeBlocks} />
        </div>
      )}
    </div>
  );
}
