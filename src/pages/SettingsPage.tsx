import { useAppStore } from "@/store/useAppStore";
import { useT } from "@/lib/useT";

export function SettingsPage() {
  const { theme, toggleTheme, lang, setLang } = useAppStore();
  const t = useT();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">{t("settingsTitle")}</h1>

      <div className="space-y-4">
        {/* Language */}
        <div className="rounded-lg border border-border p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{t("settingsLang")}</p>
            <p className="text-xs text-muted-foreground">{t("settingsLangDesc")}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setLang("tr")}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                lang === "tr"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              Türkçe
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                lang === "en"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="rounded-lg border border-border p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{t("settingsTheme")}</p>
            <p className="text-xs text-muted-foreground">{t("settingsThemeDesc")}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="shrink-0 text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
          >
            {theme === "light" ? t("settingsToDark") : t("settingsToLight")}
          </button>
        </div>

        {/* Data Location */}
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium mb-1">{t("settingsDataLocation")}</p>
          <p className="text-xs text-muted-foreground">{t("settingsDataDesc")}</p>
        </div>

        {/* Version */}
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium mb-1">{t("settingsVersion")}</p>
          <p className="text-xs text-muted-foreground font-mono">0.1.0</p>
        </div>
      </div>
    </div>
  );
}
