export type EntryType =
  | "PROGRAM"
  | "FUNCTION_MODULE"
  | "CLASS"
  | "METHOD"
  | "BAPI"
  | "INCLUDE"
  | "FORM"
  | "VIEW"
  | "TABLE"
  | "SNIPPET"
  | "EXIT"
  | "SMARTFORM"
  | "NOTE";

export type SAPModule =
  | "MM"
  | "SD"
  | "FI"
  | "CO"
  | "HR"
  | "PP"
  | "QM"
  | "PM"
  | "PS"
  | "WM"
  | "BASIS"
  | "ABAP"
  | "OTHER";

export type Layer = "Application" | "Framework" | "Utility" | "Integration" | "UI";

export type Status = "Draft" | "Active" | "Deprecated" | "Review";

export type ParameterDirection =
  | "IMPORTING"
  | "EXPORTING"
  | "CHANGING"
  | "TABLES"
  | "EXCEPTIONS";

export type CodeLanguage = "abap" | "sql" | "xml" | "json" | "bash";

export interface Parameter {
  id: string;
  entryId: string;
  name: string;
  direction: ParameterDirection;
  abapType: string;
  optional: boolean;
  defaultValue?: string;
  description: string;
}

export interface CodeBlock {
  id: string;
  entryId: string;
  label: string;
  language: CodeLanguage;
  code: string;
  description?: string;
  highlightLines?: number[];
  position: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Entry {
  id: string;
  type: EntryType;
  title: string;
  slug: string;
  programName?: string;
  packageName?: string;
  transportRequest?: string;
  sapRelease?: string;
  systemId?: string;
  module: SAPModule;
  layer: Layer;
  status: Status;
  description: string;
  purpose: string;
  usage: string;
  relatedTcodes: string[];
  dependencies: string[];
  tags: Tag[];
  codeBlocks: CodeBlock[];
  parameters: Parameter[];
  createdAt: string;
  updatedAt: string;
}

export interface EntryListItem {
  id: string;
  type: EntryType;
  title: string;
  slug: string;
  module: SAPModule;
  status: Status;
  tags: Tag[];
  programName?: string;
  description: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  types?: EntryType[];
  modules?: SAPModule[];
  statuses?: Status[];
  tags?: string[];
}

export interface CreateEntryInput {
  type: EntryType;
  title: string;
  programName?: string;
  packageName?: string;
  transportRequest?: string;
  sapRelease?: string;
  systemId?: string;
  module: SAPModule;
  layer: Layer;
  status: Status;
  description: string;
  purpose: string;
  usage: string;
  relatedTcodes: string[];
  dependencies: string[];
  tagNames: string[];
}

export interface UpdateEntryInput extends CreateEntryInput {
  id: string;
}

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  PROGRAM: "Program",
  FUNCTION_MODULE: "Function Module",
  CLASS: "Class",
  METHOD: "Method",
  BAPI: "BAPI",
  INCLUDE: "Include",
  FORM: "Form",
  VIEW: "View",
  TABLE: "Table",
  SNIPPET: "Snippet",
  EXIT: "Exit / BAdI",
  SMARTFORM: "SmartForm",
  NOTE: "Note",
};

export const ENTRY_TYPE_ICONS: Record<EntryType, string> = {
  PROGRAM: "📄",
  FUNCTION_MODULE: "⚡",
  CLASS: "🏛️",
  METHOD: "🔧",
  BAPI: "🔗",
  INCLUDE: "📎",
  FORM: "🧱",
  VIEW: "👁️",
  TABLE: "🗄️",
  SNIPPET: "✂️",
  EXIT: "🚪",
  SMARTFORM: "📋",
  NOTE: "📝",
};

export const SAP_MODULES: SAPModule[] = [
  "MM", "SD", "FI", "CO", "HR", "PP", "QM", "PM", "PS", "WM", "BASIS", "ABAP", "OTHER",
];
