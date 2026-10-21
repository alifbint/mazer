<h1 align="center">Mazer Dashboard</h1>

![Mazer Screenshot](https://user-images.githubusercontent.com/45036724/167523601-9d20fb17-1989-488f-b619-cb53c0db8898.png)

<p align="center">Template admin dashboard berbasis Bootstrap 5, tanpa dependency jQuery di core.</p>

<div align="center">

[![Upstream](https://img.shields.io/badge/upstream-zuramai%2Fmazer-blue)](https://github.com/zuramai/mazer)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D22.22.2-brightgreen)
![Vite](https://img.shields.io/badge/vite-8-646cff)
![Bootstrap](https://img.shields.io/badge/bootstrap-5.3.8-7952b3)

</div>

> **Catatan:** Repositori ini adalah pengembangan lanjutan dari
> [zuramai/mazer](https://github.com/zuramai/mazer) (versi 2.3.1) karya
> [Ahmad Saugi](https://saugi.me), dikembangkan oleh
> [Alif Bintoro](https://www.linkedin.com/in/alifbint). Fokusnya adalah memperbarui dependency ke
> versi terbaru dan menambah halaman/fitur baru. Detail perubahannya ada di
> bagian [Pengembangan dari upstream](#pengembangan-dari-upstream).

## Daftar isi

- [Instalasi](#instalasi)
- [Perintah](#perintah)
- [Struktur proyek](#struktur-proyek)
- [Pengembangan dari upstream](#pengembangan-dari-upstream)
- [Menambah halaman baru](#menambah-halaman-baru)
- [Skill Claude Code (`mazer-ui`)](#skill-claude-code-mazer-ui)
- [Lisensi & kredit](#lisensi--kredit)

## Instalasi

Prasyarat: **Node.js 22.22.2 atau lebih baru** (lihat `.nvmrc` dan `engines` di `package.json`).

```sh
nvm use            # opsional, mengikuti .nvmrc
npm install
npm run dev        # buka http://localhost:5173
```

### Docker

```sh
docker build -t mazer-frontend .
docker run -it -d -p 5173:80 --name mazer mazer-frontend
# buka http://localhost:5173
```

## Perintah

| Perintah           | Fungsi                                                      |
| ------------------ | ----------------------------------------------------------- |
| `npm run dev`      | Dev server Vite                                             |
| `npm run build`    | Build ke `dist/` lalu rapikan HTML dengan Prettier          |
| `npm run watch`    | Build ulang otomatis saat file berubah                      |
| `npm run preview`  | Menyajikan hasil build                                      |
| `npm run rtl`      | Membuat `*.rtl.css` dari `dist/` (jalankan setelah build)   |
| `npm run prod-rtl` | `build` + `rtl`                                             |
| `npm run zip`      | Membuat `template.zip` dari `dist/`                         |

## Struktur proyek

```
src/
├── *.html                  # setiap file = satu halaman (template Nunjucks)
├── layouts/                # master, horizontal, rtl, vertical-*, auth, error
├── partials/               # footer, dll.
├── sidebar-items.json      # menu sidebar
├── horizontal-menu-items.json
└── assets/
    ├── js/app.js           # JS core (di-bundle UMD)
    ├── scss/               # app.scss, themes/dark, pages/, widgets/
    └── static/js/          # initTheme.js, components/, pages/*.js
plugins/nunjucks.js         # plugin Vite lokal untuk render Nunjucks
vite.config.js              # entry halaman, library yang disalin, opsi SCSS
```

- Halaman ditulis sebagai template Nunjucks (`{% extends 'src/layouts/master.html' %}`) dan di-build menjadi HTML statis oleh Vite.
- Library pihak ketiga disalin dari `node_modules` ke `dist/assets/extensions/<paket>` lewat `modulesToCopy` di `vite.config.js`.

## Pengembangan dari upstream

Perbandingan terhadap [zuramai/mazer](https://github.com/zuramai/mazer) branch `main` (v2.3.1).

### Tooling & build

| Komponen                 | Upstream           | Repo ini                          |
| ------------------------ | ------------------ | --------------------------------- |
| Node.js                  | —                  | ≥ 22.22.2 (`.nvmrc`)              |
| Vite                     | 5.0.2              | 8.3 (Rolldown)                    |
| Render Nunjucks          | `vite-plugin-nunjucks` | Plugin lokal `plugins/nunjucks.js` |
| `vite-plugin-static-copy`| 2                  | 4                                 |
| release-it               | lama               | 21                                |
| bestzip                  | 2                  | 4                                 |

- `vite-plugin-nunjucks` terkunci di Vite 5, jadi diganti plugin lokal.
- Paket yang tidak dipakai dihapus: `@fontsource/nunito` (font sudah ada sebagai file lokal) dan `cross-env`.
- `overrides.basic-ftp` menutup celah keamanan transitif dari `release-it`.

### SCSS

- Seluruh SCSS dimigrasi dari `@import` ke **module system** (`@use`/`@forward`, `sass:map`, `sass:color`, `sass:math`).
- Bootstrap 5.3.3 → **5.3.8**, dimuat lewat `meta.load-css(..., $with: ...)`.
- Build bersih tanpa deprecation warning Sass.
- SweetAlert2 mode gelap memakai CSS variable `--swal2-*` (paket `@sweetalert2/theme-dark` dihapus).

### Library

| Library             | Upstream | Repo ini | Catatan                                              |
| ------------------- | -------- | -------- | ---------------------------------------------------- |
| ApexCharts          | 3        | 8        |                                                      |
| Choices.js          | 10       | 11       |                                                      |
| DataTables          | 1        | 3        | `layout` menggantikan opsi `dom`, class `dt-*`       |
| simple-datatables   | 4        | 10       | Class Bootstrap lewat opsi `classes`                 |
| Font Awesome        | 5        | 7        |                                                      |
| rater-js            | 1        | 2        | Hanya `rater-js.iife.min.js`, CSS di-inject sendiri  |
| TinyMCE             | 7        | 8        |                                                      |
| SweetAlert2         | 11.x     | 11.26    |                                                      |
| CKEditor            | ada      | dihapus  | Halaman `form-editor-ckeditor.html` ikut dihapus     |
| Coloris             | —        | 0.25     | Baru, untuk halaman Theme Settings                   |
| vis-network         | —        | 10       | Baru, untuk halaman Network Topology                 |
| moment-timezone     | —        | 0.6      | Baru, untuk halaman Moment Timezone                  |

Update minor lain dalam rentang versi juga sudah dipasang.

### Halaman baru

| Halaman                              | Keterangan                                                              |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `layout-theme-settings.html`         | Atur warna primary, background, surface, teks, dan heading per tema (light/dark), disimpan di localStorage |
| `monitoring-resource.html`           | Monitor resource (ApexCharts)                                           |
| `monitoring-network-topology.html`   | Topologi jaringan (vis-network + ApexCharts)                            |
| `account-profile-cover.html`         | Profil akun dengan cover                                                |
| `auth-login-boxed.html`              | Login versi boxed                                                       |
| `auth-register-boxed.html`           | Register versi boxed                                                    |
| `auth-forgot-password-boxed.html`    | Lupa password versi boxed                                               |
| `auth-two-factor.html`               | Verifikasi two-factor authentication                                    |
| `extra-component-sparkline.html`     | Grafik sparkline (ApexCharts)                                           |
| `extra-component-moment-timezone.html` | Konversi zona waktu (moment-timezone)                                 |

### Warna tema kustom

`initTheme.js` membaca localStorage `theme-colors` lalu menyisipkan `<style id="theme-colors">` setelah `app.css`/`app-dark.css`. Warna yang di-compile tetap oleh Sass (tombol, sidebar, focus ring, dll.) di-override per selector, jadi komponen baru yang memakai warna primary/background/teks perlu didaftarkan di sana.

### Ditahan

- **jQuery 4** — Summernote 0.9.1 belum kompatibel. Tetap di jQuery 3.7.1.
- **Bootstrap 6** — menunggu rilis stabil (saat ini masih alpha).

### Sisa audit keamanan

- `braces` lewat `chokidar@3` (milik `nunjucks` dan `vite-plugin-static-copy`). Hanya dipakai saat development, tidak ikut ke hasil build.
- `quill` 2.0.3 (low, XSS pada fitur export HTML). Belum ada versi perbaikan dari upstream.

## Menambah halaman baru

1. Salin halaman yang mirip di `src/`, lalu ubah `title`, `filename`, dan breadcrumb.
2. Daftarkan di `src/sidebar-items.json` (dan `src/horizontal-menu-items.json` bila perlu).
3. JS khusus halaman diletakkan di `src/assets/static/js/pages/<nama>.js`.
4. Utamakan utilitas Bootstrap 5.3 dan class Mazer yang sudah ada. Hindari CSS inline dan dependency jQuery baru.
5. Cek tampilan di mode light dan dark.
6. Verifikasi build:

```sh
npm run build
cd dist && grep -ohE '(src|href)="assets/[^"]+"' *.html \
  | sed -E 's/^(src|href)="//;s/"$//;s/[?#].*//' | sort -u \
  | while read f; do [ -e "$f" ] || echo "MISSING $f"; done
```

Panduan lebih rinci (aturan SCSS, styling ikon, upgrade library) ada di [`CLAUDE.md`](./CLAUDE.md). Panduan kontribusi: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Skill Claude Code (`mazer-ui`)

Repo ini menyertakan skill [`mazer-ui`](./.claude/skills/mazer-ui/SKILL.md) untuk [Claude Code](https://claude.com/claude-code). Skill ini berisi panduan membuat halaman, memilih class Mazer vs utilitas Bootstrap, memuat library, serta aturan SCSS dan dark mode. Referensi lengkapnya ada di `.claude/skills/mazer-ui/references/`.

### Di dalam repo ini

Tidak perlu instalasi. Claude Code otomatis memuat skill dari `.claude/skills/` saat dijalankan di root repo:

```sh
git clone git@github.com:alifbint/mazer.git
cd mazer
claude            # ketik /mazer-ui, atau skill dipakai otomatis saat relevan
```

### Untuk proyek lain (turunan Mazer)

Salin foldernya ke proyek tujuan (berlaku untuk proyek itu saja):

```sh
mkdir -p /path/ke/proyek/.claude/skills
cp -r .claude/skills/mazer-ui /path/ke/proyek/.claude/skills/
```

Atau pasang sebagai skill personal agar tersedia di semua proyek:

```sh
mkdir -p ~/.claude/skills
cp -r .claude/skills/mazer-ui ~/.claude/skills/
```

Bisa juga langsung dari GitHub lewat CLI [`skills`](https://skills.sh) (mendukung Claude Code dan agent lain):

```sh
npx skills add alifbint/mazer --skill mazer-ui
```

Cek skill sudah terbaca dengan mengetik `/mazer-ui` di Claude Code. Setelah menyalin atau mengubah skill, mulai ulang sesi Claude Code bila skill belum muncul.

## Lisensi & kredit

- Dirilis di bawah [MIT License](./LICENSE).
- Dikembangkan oleh [Alif Bintoro](https://www.linkedin.com/in/alifbint).
- Mazer dibuat oleh [Ahmad Saugi (zuramai)](https://github.com/zuramai). Proyek asli: <https://github.com/zuramai/mazer> · [Demo](https://zuramai.github.io/mazer/demo) · [Dokumentasi](https://zuramai.github.io/mazer/docs).
- Dukung pembuat aslinya lewat [GitHub Sponsors](https://github.com/sponsors/zuramai).
