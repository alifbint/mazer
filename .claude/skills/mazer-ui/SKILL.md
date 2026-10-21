---
name: mazer-ui
description: Panduan memakai UI Mazer (template admin Bootstrap 5.3 + Nunjucks + Vite) untuk membuat atau mengubah halaman, layout, menu, komponen, widget, dan library pihak ketiga. Gunakan saat membuat halaman baru, menyusun tampilan dashboard/form/tabel/chart, memilih class Mazer vs utilitas Bootstrap, menambah library ke halaman, atau mengecek dark mode dan ikon di proyek Mazer.
---

# Mazer UI

Mazer adalah template admin dashboard Bootstrap 5.3.8 tanpa jQuery di core. Halaman ditulis sebagai template Nunjucks di `src/*.html` lalu di-build Vite menjadi HTML statis di `dist/`.

Referensi lanjutan:
- `references/components.md` — katalog class Mazer dan snippet komponen/widget siap pakai.
- `references/libraries.md` — tabel library per halaman beserta tag `<link>`/`<script>` yang benar.
- `references/dependencies.md` — semua dependency (`dependencies` + `devDependencies`) dengan versi, cara dimuat (bundle/copy/CDN), halaman pemakai, dan pilihan library untuk fitur baru.
- `references/development.md` — aturan proyek: folder yang di-skip, arsitektur build (Vite 8, plugin Nunjucks), SCSS module system, warna tema kustom, upgrade library, versi yang ditahan, konvensi. **Baca sebelum mengubah SCSS, `vite.config.js`, atau versi library.**

## Alur kerja

1. **Pilih halaman contoh yang paling mirip** di `src/` dan salin. Jangan menulis dari nol. Lihat tabel "Halaman contoh" di bawah.
2. Ubah `{% set title %}`, `{% set filename %}`, judul, dan breadcrumb.
3. Daftarkan di `src/sidebar-items.json` (dan `src/horizontal-menu-items.json` bila halaman juga dipakai di layout horizontal).
4. Susun isi dengan komponen Bootstrap + class Mazer (`references/components.md`).
5. Library: pakai yang sudah ada di `modulesToCopy` (`references/libraries.md`). JS halaman → `src/assets/static/js/pages/<nama>.js`.
6. Cek light dan dark, lalu verifikasi build (bagian "Verifikasi").

## Kerangka halaman (layout `master`)

```html
{% set title = 'Nama Halaman' %}
{% set filename = 'nama-halaman.html' %}

{% extends 'src/layouts/master.html' %}

{% block styles %}
<!-- CSS library / scss/pages/*.scss khusus halaman -->
{% endblock %}

{% block content %}
<div class="page-heading">
    <div class="page-title">
        <div class="row">
            <div class="col-12 col-md-6 order-md-1 order-last">
                <h3>Nama Halaman</h3>
                <p class="text-subtitle text-muted">Deskripsi singkat.</p>
            </div>
            <div class="col-12 col-md-6 order-md-2 order-first">
                <nav aria-label="breadcrumb" class="breadcrumb-header float-start float-lg-end">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html">Dashboard</a></li>
                        <li class="breadcrumb-item active" aria-current="page">Nama Halaman</li>
                    </ol>
                </nav>
            </div>
        </div>
    </div>
    <section class="section">
        <div class="card">
            <div class="card-header">
                <h4 class="card-title">Judul Kartu</h4>
            </div>
            <div class="card-body">...</div>
        </div>
    </section>
</div>
{% endblock %}

{% block js %}
<!-- script library, lalu assets/static/js/pages/nama-halaman.js -->
{% endblock %}
```

- Block yang tersedia: `stylesfirst` (sebelum `app.scss`), `styles`, `content`, `js`.
- `master.html` sudah memuat `app.scss`, `app-dark.scss`, `initTheme.js`, `dark.js`, perfect-scrollbar, `app.js` (sidebar), sidebar, burger button, dan footer. Jangan dimuat ulang.
- Variabel global: `title`, `filename`, `web_title`, `sidebarItems`, `horizontalMenuItems`, `isDev`. Filter Nunjucks: `startsWith`, `containString`.
- Dashboard (`index.html`) memakai `<div class="page-content">` dengan `<section class="row">` alih-alih `page-title`.

## Layout

| Layout (`src/layouts/`) | Wrapper | Dipakai untuk | Contoh |
| --- | --- | --- | --- |
| `master.html` | `#app > #sidebar + #main` | Hampir semua halaman | `layout-default.html` |
| `horizontal.html` | `#main.layout-horizontal`, menu dari `horizontal-menu-items.json` | Navigasi atas | `layout-horizontal.html` |
| `vertical-navbar.html` | sidebar + `navbar-top` (notifikasi, user dropdown) | Dashboard dengan topbar | `layout-vertical-navbar.html` |
| `vertical-1-column.html` | sidebar + konten 1 kolom | Konten sempit | `layout-vertical-1-column.html` |
| `rtl.html` | `dir="rtl"`, `app-rtl.scss` | Bahasa RTL | `layout-rtl.html` |
| `auth.html` | `#auth` + `scss/pages/auth.scss` | Login/register/2FA | `auth-login.html`, `auth-login-boxed.html` |
| `error.html` | `#error` | 403/404/500 | `error-404.html` |

Halaman `auth`/`error` tidak punya sidebar, jadi tidak perlu `filename` dan tidak didaftarkan di menu.

## Menu sidebar

`src/sidebar-items.json`:

```json
{ "name": "Menu", "isTitle": true },
{ "name": "Dashboard", "url": "index.html", "icon": "grid-fill" },
{
  "name": "Monitoring", "key": "monitoring", "icon": "activity",
  "submenu": [
    { "name": "Resource Monitor", "url": "monitoring-resource.html" }
  ]
}
```

- `icon` = nama Bootstrap Icons tanpa prefix `bi-`.
- Item aktif: `url == filename`, atau `filename` diawali `key`. Jadi beri nama file dengan prefix grup (`monitoring-*.html` untuk `key: "monitoring"`).
- Submenu bisa 2 level (`submenu` di dalam `submenu`, lihat `ui-multi-level-menu.html`).

## Halaman contoh (salin dari sini)

| Kebutuhan | Salin dari |
| --- | --- |
| Dashboard statistik + chart | `index.html`, `monitoring-resource.html` |
| Grafik jaringan | `monitoring-network-topology.html` |
| Form layout / input / select / validasi | `form-layout.html`, `form-element-*.html`, `form-validation-parsley.html` |
| Rich text editor | `form-editor-quill.html` (tanpa jQuery), `form-editor-tinymce.html` |
| Tabel biasa / interaktif | `table.html`, `table-datatable.html` (vanilla), `table-datatable-jquery.html` |
| Chart | `ui-chart-apexcharts.html`, `ui-chart-chartjs.html`, `extra-component-sparkline.html` |
| Upload file | `ui-file-uploader.html` (FilePond) |
| Peta | `ui-map-jsvectormap.html`, `ui-map-leaflet.html`, `ui-map-openlayers.html` |
| Profil / keamanan akun | `account-profile.html`, `account-profile-cover.html`, `account-security.html` |
| Aplikasi | `application-chat.html`, `application-email.html`, `application-checkout.html`, `application-gallery.html` |
| Widget | `ui-widgets-chatbox.html`, `ui-widgets-pricing.html`, `ui-widgets-todolist.html` |
| Notifikasi / dialog | `extra-component-toastify.html`, `extra-component-sweetalert.html`, `component-toasts.html` |
| Pengaturan warna tema | `layout-theme-settings.html` |
| Auth | `auth-login(-boxed).html`, `auth-register(-boxed).html`, `auth-forgot-password(-boxed).html`, `auth-two-factor.html` |

## Aturan styling (wajib)

- **Tanpa CSS inline (`style="..."`) dan tanpa SCSS baru**, kecuali user memintanya. Pakai utilitas Bootstrap 5.3 dan class Mazer (`bg-light-*`, `btn-light-*`, `alert-light-*`, `avatar-*`, `stats-icon`, `font-bold`, `text-sm`, `py-4-5`, ...).
- **Ikon Bootstrap Icons harus center.** Ada aturan global `.bi::before { vertical-align: sub }`.
  - Sebaris dengan teks (tombol, paragraf): `bi-middle`.
  - Di dalam container flex (`d-flex`, `input-group-text`, lingkaran ikon): `bi-middle lh-1`.
  - Diperbesar (`fs-*`) di container flex: `bi-middle lh-1 w-auto h-auto` (karena `.bi` berukuran tetap 1rem).
  - Cek secara visual dengan screenshot. `getBoundingClientRect()` pada `<i>` tidak menangkap posisi glyph.
- **Warna yang mengikuti tema**: `var(--bs-border-color)`, `var(--bs-card-bg)`, `var(--bs-emphasis-color-rgb)`, `text-body-secondary`, `bg-body-tertiary`. Jangan pakai warna Sass tetap seperti `$gray-300`.
- **Hindari di mode dark**: `list-group-item-action` (teks redup) dan track `.progress` (tetap terang). Pakai `list-group-item` biasa, atau cek dulu di dark.
- **Tinggi tetap pada `.card`** kalah oleh `html[data-bs-theme="dark"] .card { height: var(--bs-card-height) }`. Taruh tinggi di div pembungkus, beri kartunya `h-100 mb-0`.
- CSS halaman (`scss/pages/*`) bisa termuat sebelum `app.css`. Kalau aturan tidak berlaku, cek penimpanya di DevTools sebelum menambah selector.
- Jangan menambah dependency jQuery baru. jQuery hanya dipakai Summernote, Parsley, dan DataTables (jQuery).

## Dark mode dan warna tema

- Tema disimpan di localStorage `theme` (`light`/`dark`) dan dipasang ke `data-bs-theme` oleh `initTheme.js` sebelum render.
- Ganti dari console/JS: `setTheme('dark')` / `setTheme('light')` (dari `components/dark.js`, argumen kedua `persist`). Toggle di sidebar: `#toggle-dark`.
- Warna kustom dari halaman Theme Settings disimpan di localStorage `theme-colors`, lalu `initTheme.js` menyisipkan `<style id="theme-colors">`. Warna Mazer yang di-compile tetap di-override per selector di `primaryCss()`/`bodyBgCss()`/`surfaceBgCss()`/`textCss()`/`headingCss()`. **Komponen baru yang memakai `$primary`, warna latar, atau warna teks harus ditambahkan selectornya di sana.**
- Library yang membaca tema sendiri (ApexCharts, Coloris, vis-network) perlu diperbarui saat tema berganti (`MutationObserver` pada atribut `data-bs-theme`). Lihat contoh di `resource-monitor.js`, `sparkline.js`, `network-topology.js`, `theme-settings.js`.

## JS halaman

- File di `src/assets/static/js/pages/*.js` adalah script biasa (bukan ES module), dimuat dengan `<script src="assets/static/js/pages/x.js"></script>` di block `js` setelah library-nya. Warning Vite "can't be bundled without type=module" untuk file ini normal.
- Tulis vanilla JS (`document.querySelector`, `addEventListener`). Komponen Bootstrap tersedia lewat `bootstrap.*` dari `app.js`, atau cukup atribut `data-bs-*`.

## Ikon yang tersedia

- **Bootstrap Icons** (default, sudah ada di `app.scss`): `<i class="bi bi-person"></i>`.
- **Iconly**: link `assets/scss/iconly.scss` di block `styles`, lalu `<i class="iconly-boldShow"></i>` (dipakai di `stats-icon` dashboard).
- **Font Awesome 7**: `assets/extensions/@fortawesome/fontawesome-free/css/all.min.css`.
- **Dripicons**: `assets/extensions/@icon/dripicons/dripicons.css` + `assets/scss/pages/dripicons.scss`.
- **Feather**: `<i data-feather="user">` (dipakai di tombol `btn icon icon-left`).

Utamakan Bootstrap Icons.

## Verifikasi

```bash
npm run build
cd dist && grep -ohE '(src|href)="assets/[^"]+"' *.html \
  | sed -E 's/^(src|href)="//;s/"$//;s/[?#].*//' | sort -u \
  | while read f; do [ -e "$f" ] || echo "MISSING $f"; done
```

Lalu buka halaman (`npm run dev` atau `npx vite preview`), pastikan tidak ada error di console, dan cek tampilan di light dan dark. Setelah mengubah kode, jalankan `graphify update .`.

## Aturan proyek (ringkas)

Detail lengkap di `references/development.md`.

- **Folder yang di-skip**: jangan baca/grep/edit `node_modules/` (kecuali `ls node_modules/<paket>` untuk cek `dist/`), `dist/` (kecuali skrip cek aset), `graphify-out/` (pakai `graphify query`), lockfile, `src/assets/static/images/`, dan `valde.min.js`.
- **Perbaikan selalu di `src/`**, lalu build ulang. Jangan commit `dist/`, `template.zip`, `node_modules/`.
- **SCSS**: hanya `@use`/`@forward` dan modul `sass:map`/`sass:color`/`sass:math`/`sass:meta`. Tanpa `@import` (kecuali `themes/dark/_bootstrap-components.scss`) dan tanpa fungsi global (`map-get`, `lighten`, `darken`, `mix`). `_bootstrap-variables.scss` hanya berisi variabel yang dideklarasikan Bootstrap. `@extend` tidak menjangkau CSS Bootstrap.
- **Build**: Vite 8 memakai `build.rolldownOptions`. Jangan pakai `stripBase: true` untuk folder di `copyDir()`. Build harus bersih tanpa deprecation warning.
- **Library**: pakai yang sudah ada dulu. Tanpa dependency jQuery baru. Saat upgrade, cek `ls node_modules/<paket>/dist`, sesuaikan path, dan baca changelog.
- **Ditahan**: jQuery tetap 3.7.1 (Summernote), Bootstrap tetap 5.3.8 sampai v6 stabil. Workflow CI jangan diubah tanpa diminta.
- **Konvensi**: indentasi mengikuti file (2–4 spasi), satu perubahan per item lalu verifikasi, dan `graphify update .` setelah mengubah kode.
