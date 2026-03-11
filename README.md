# 📖 ABAP Notebook

> SAP / ABAP geliştiricileri için açık kaynaklı masaüstü dokümantasyon aracı.

**ABAP Notebook**, yazdığınız ABAP kodlarını, nesnelerini ve notlarınızı düzenli biçimde belgelemenizi sağlayan ücretsiz, tamamen yerel çalışan bir masaüstü uygulamasıdır. Hiçbir verisi sunucuya gönderilmez.

---

## ✨ Özellikler

- **13 ABAP Nesne Türü** — Program, Function Module, Class, Method, BAPI, Include, Form, View, Table, Snippet, Exit/BAdI, SmartForm, Note
- **Syntax Highlighting** — CodeMirror 6 tabanlı editörle ABAP, SQL, XML, JSON ve Bash desteği
- **Çoklu Kod Bloğu** — Her kayıtta sınırsız kod bloğu, başlık ve açıklama eklenebilir
- **Akıllı Arama** — Başlık, program adı, paket, açıklama, etiket ve TCode üzerinden tam metin arama
- **Etiket Sistemi** — İstediğin kadar etiket ekle, filtrele ve hızlıca bul
- **SAP Metadata** — Paket, taşıma isteği, SAP sürümü, sistem ID, modül, katman
- **Özel Not Ekranı** — Sade metin + kod bloğu destekli Not türü
- **Türkçe / İngilizce** — Arayüz dili her an değiştirilebilir
- **Karanlık / Aydınlık Mod**
- **Tamamen Yerel** — SQLite veritabanı, internet bağlantısı gerekmez

## 📥 İndirme

[**Releases**](../../releases/latest) sayfasından işletim sisteminize uygun sürümü indirin:

| Platform | Dosya |
|----------|-------|
| macOS (Apple Silicon + Intel) | `.dmg` |
| Windows | `.msi` veya `.exe` (NSIS) |

## 🖥️ Ekran Görüntüleri

> *(Yakında eklenecek)*

## 🛠️ Geliştirme Ortamı

### Gereksinimler

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (stable)
- [Tauri CLI v2](https://tauri.app/)

### Kurulum

```bash
git clone https://github.com/YOUR_USERNAME/abap-notebook.git
cd abap-notebook
npm install
```

### Geliştirme Sunucusu

```bash
npm run tauri dev
```

### Üretim Build

```bash
npm run tauri build
```

Çıktılar `src-tauri/target/release/bundle/` altında oluşur.

## 🏗️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Masaüstü | [Tauri v2](https://tauri.app/) (Rust) |
| Arayüz | React 18 + Vite + TypeScript |
| Stil | Tailwind CSS |
| Veritabanı | SQLite ([rusqlite](https://github.com/rusqlite/rusqlite) bundled) |
| Editör | [CodeMirror 6](https://codemirror.net/) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |
| Router | React Router v6 |

## 📁 Proje Yapısı

```
abap-notebook/
├── src/                    # React frontend
│   ├── components/         # UI bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   ├── store/              # Zustand store
│   ├── lib/                # Yardımcı fonksiyonlar, i18n
│   └── types/              # TypeScript tipleri
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands.rs     # Tauri komutları (CRUD, arama)
│   │   ├── db.rs           # SQLite şema ve bağlantı
│   │   └── main.rs
│   └── tauri.conf.json
└── .github/
    └── workflows/
        └── release.yml     # CI/CD — Mac & Windows build
```

## 🚀 Release Süreci

`v` ile başlayan bir tag push etmek otomatik olarak Mac ve Windows build'lerini başlatır:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions, `.dmg` ve `.msi/.exe` dosyalarını otomatik olarak Releases sayfasına yükler.

## 📄 Lisans

[MIT](LICENSE) © 2026 Rıza Çelik
