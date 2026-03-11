import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/tauri";
import { EntryForm } from "@/components/entries/EntryForm";
import { NoteEntryForm } from "@/components/entries/NoteEntryForm";
import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/lib/useT";
import type { CreateEntryInput, EntryType } from "@/types";
import type { CodeBlockDraft } from "@/components/entries/EntryForm";

export function NewEntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loadEntries } = useAppStore();
  const t = useT();

  const defaultType = (searchParams.get("type") as EntryType) ?? "SNIPPET";

  const handleSubmit = async (input: CreateEntryInput, codeDrafts: CodeBlockDraft[]) => {
    setIsSubmitting(true);
    try {
      const entry = await api.createEntry(input);
      for (let i = 0; i < codeDrafts.length; i++) {
        const d = codeDrafts[i];
        await api.upsertCodeBlock({
          entryId: entry.id,
          label: d.label || `Block ${i + 1}`,
          language: d.language,
          code: d.code,
          description: d.description || undefined,
          highlightLines: [],
          position: i,
        });
      }
      await loadEntries();
      navigate(`/entry/${entry.id}`);
    } catch (err) {
      console.error("Failed to create entry:", err);
      alert(`Error: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = defaultType === "NOTE" ? t("noteNewTitle") : t("newEntryTitle");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">{title}</h1>
      {defaultType === "NOTE" ? (
        <NoteEntryForm
          key="note"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : (
        <EntryForm
          key={defaultType}
          defaultType={defaultType}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
