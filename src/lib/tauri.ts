import { invoke } from "@tauri-apps/api/core";
import type {
  Entry,
  EntryListItem,
  CreateEntryInput,
  UpdateEntryInput,
  CodeBlock,
  Parameter,
  Tag,
  SearchFilters,
} from "@/types";

export const api = {
  listEntries: (filters?: SearchFilters) =>
    invoke<EntryListItem[]>("list_entries", { filters }),

  getEntry: (id: string) =>
    invoke<Entry | null>("get_entry", { id }),

  createEntry: (input: CreateEntryInput) =>
    invoke<Entry>("create_entry", { input }),

  updateEntry: (input: UpdateEntryInput) =>
    invoke<Entry>("update_entry", { input }),

  deleteEntry: (id: string) =>
    invoke<void>("delete_entry", { id }),

  upsertCodeBlock: (input: {
    id?: string;
    entryId: string;
    label: string;
    language: string;
    code: string;
    description?: string;
    highlightLines: number[];
    position: number;
  }) => invoke<CodeBlock>("upsert_code_block", { input }),

  deleteCodeBlock: (id: string) =>
    invoke<void>("delete_code_block", { id }),

  upsertParameter: (input: {
    id?: string;
    entryId: string;
    name: string;
    direction: string;
    abapType: string;
    optional: boolean;
    defaultValue?: string;
    description: string;
  }) => invoke<Parameter>("upsert_parameter", { input }),

  deleteParameter: (id: string) =>
    invoke<void>("delete_parameter", { id }),

  listTags: () =>
    invoke<Tag[]>("list_tags"),
};
