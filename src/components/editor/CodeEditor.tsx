import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { sql } from "@codemirror/lang-sql";
import { abapLanguage } from "@/lib/abap-language";
import { useAppStore } from "@/store/useAppStore";

interface CodeEditorProps {
  value: string;
  language?: "abap" | "sql" | "xml" | "json" | "bash";
  readOnly?: boolean;
  onChange?: (value: string) => void;
  minHeight?: string;
}

export function CodeEditor({
  value,
  language = "abap",
  readOnly = false,
  onChange,
  minHeight = "200px",
}: CodeEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { theme } = useAppStore();

  useEffect(() => {
    if (!ref.current) return;

    const langExtension =
      language === "sql" ? sql() : abapLanguage;

    const extensions = [
      basicSetup,
      langExtension,
      EditorView.lineWrapping,
      ...(theme === "dark" ? [oneDark] : []),
      ...(readOnly ? [EditorState.readOnly.of(true)] : []),
      ...(onChange
        ? [
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                onChange(update.state.doc.toString());
              }
            }),
          ]
        : []),
      EditorView.theme({
        "&": { minHeight },
        ".cm-scroller": { overflow: "auto" },
      }),
    ];

    const state = EditorState.create({ doc: value, extensions });
    const view = new EditorView({ state, parent: ref.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Intentionally only re-create on language/readOnly/theme changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, readOnly, theme, minHeight]);

  // Sync external value changes without recreating the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return <div ref={ref} className="w-full text-sm" />;
}
