<div align="center">

<img src="src-tauri/icons/128x128@2x.png" alt="ABAP Notebook" width="96" />

# ABAP Notebook

**[Türkçe](#türkçe) · [English](#english)**

A free, open-source desktop app for SAP/ABAP developers to document, organize and search their ABAP objects.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue)
![License](https://img.shields.io/github/license/rizacelik/abap-notebook)
![Release](https://img.shields.io/github/v/release/rizacelik/abap-notebook)
![Tauri](https://img.shields.io/badge/Tauri-v2-orange)

</div>

---

## Türkçe

SAP / ABAP geliştiricileri için **ücretsiz, açık kaynaklı** masaüstü dokümantasyon aracı.
Yazdığınız kodları, nesneleri ve notları organize edin — tüm veriler **yerel olarak** saklanır, internet gerekmez.

### ✨ Özellikler

- **13 ABAP Nesne Türü** — Program, Function Module, Class, Method, BAPI, Include, Form, View, Table, Snippet, Exit/BAdI, SmartForm, Not
- **Syntax Highlighting** — CodeMirror 6 ile ABAP, SQL, XML, JSON, Bash
- **Çoklu Kod Bloğu** — Her kayıtta sınırsız kod bloğu; başlık, açıklama ve dil seçimi
- **Akıllı Arama** — Başlık, program adı, paket, açıklama, etiket ve TCode üzerinden tam metin arama
- **Özel Not Ekranı** — Düz metin + syntax destekli Not türü
- **SAP Metadata** — Paket, taşıma isteği, SAP sürümü, sistem ID, modül, katman
- **Türkçe / İngilizce** arayüz dili desteği
- **Karanlık / Aydınlık Mod**
- **%100 Yerel** — SQLite veritabanı, sunucu yok, internet bağlantısı gerekmez

### 📥 İndirme

[**Releases**](../../releases/latest) sayfasından işletim sisteminize uygun sürümü indirin:

| Platform | Dosya | Notlar |
|----------|-------|--------|
| macOS | `.dmg` | Universal — Apple Silicon & Intel |
| Windows | `.msi` | Windows Installer (önerilen) |
| Windows | `.exe` | NSIS Kurulum Sihirbazı |

> **macOS:** İlk açılışta Gatekeeper uyarısı çıkabilir → **Sistem Ayarları → Gizlilik & Güvenlik → Yine de Aç**

### 🛠️ Geliştirme

```bash
# Gereksinimler: Node.js 18+, Rust stable
git clone https://github.com/rizacelik/abap-notebook.git
cd abap-notebook
npm install
npm run tauri dev      # Geliştirme modu
npm run tauri build    # Üretim build
```

---

## English

A **free and open-source** desktop documentation tool for SAP/ABAP developers.
Organize your ABAP programs, function modules, classes, snippets and notes — all data stored **locally**, no internet required.

### ✨ Features

- **13 ABAP Object Types** — Program, Function Module, Class, Method, BAPI, Include, Form, View, Table, Snippet, Exit/BAdI, SmartForm, Note
- **Syntax Highlighting** — CodeMirror 6 with ABAP, SQL, XML, JSON, Bash support
- **Multiple Code Blocks** — Unlimited code blocks per entry with labels, descriptions and language selection
- **Smart Search** — Full-text search across title, program name, package, description, tags and TCodes
- **Dedicated Note Screen** — Plain text + syntax-highlighted code blocks for Note type
- **SAP Metadata** — Package, transport request, SAP release, system ID, module, layer
- **Turkish / English** UI language support
- **Dark / Light Mode**
- **100% Local** — SQLite database, no server, no internet connection needed

### 📥 Download

Download from the [**Releases**](../../releases/latest) page:

| Platform | File | Notes |
|----------|------|-------|
| macOS | `.dmg` | Universal binary — Apple Silicon & Intel |
| Windows | `.msi` | Windows Installer (recommended) |
| Windows | `.exe` | NSIS Setup Wizard |

> **macOS:** On first launch, Gatekeeper may block the app → **System Settings → Privacy & Security → Open Anyway**

### 🛠️ Development

```bash
# Requirements: Node.js 18+, Rust stable
git clone https://github.com/rizacelik/abap-notebook.git
cd abap-notebook
npm install
npm run tauri dev      # Development mode
npm run tauri build    # Production build
```

### 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri v2](https://tauri.app/) (Rust) |
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite ([rusqlite](https://github.com/rusqlite/rusqlite) bundled) |
| Editor | [CodeMirror 6](https://codemirror.net/) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |
| Router | React Router v6 |

### 📁 Project Structure

```
abap-notebook/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/              # Page components
│   ├── store/              # Zustand store
│   ├── lib/                # Utilities, i18n
│   └── types/              # TypeScript types
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands.rs     # Tauri commands (CRUD, search)
│   │   ├── db.rs           # SQLite schema & connection
│   │   └── main.rs
│   └── tauri.conf.json
└── .github/
    └── workflows/
        └── release.yml     # CI/CD — Mac & Windows builds
```

### 🚀 Creating a Release

Pushing a `v*` tag triggers the GitHub Actions workflow which automatically builds for Mac and Windows:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will upload `.dmg`, `.msi` and `.exe` artifacts to the Releases page (~15–20 min).

---

## 📄 License

[MIT](LICENSE) © 2026 Rıza Çelik
