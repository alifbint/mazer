# Dependency Mazer

Versi terpasang per 2026-10-21 (`npm ls --depth=0`). Range di `package.json` memakai `^` kecuali Bootstrap yang dikunci `5.3.8`. Node `>= 22.22.2` (`engines`, `.nvmrc`).

Kolom **Cara dimuat**:
- **bundle**: di-import oleh `src/assets/js/app.js` / `mazer.js` atau `app.scss`, sudah ada di setiap halaman yang memakai layout.
- **copy `dist`** / **copy penuh**: disalin ke `dist/assets/extensions/<paket>` lewat `modulesToCopy` (`true` = folder `dist/` saja, `false` = seluruh paket), lalu dimuat per halaman dengan `<link>`/`<script>`. Path lengkap ada di `libraries.md`.
- **CDN**: tidak ada di `package.json`.

## Core (dipakai semua halaman)

| Paket | Versi | Cara dimuat | Fungsi |
| --- | --- | --- | --- |
| `bootstrap` | 5.3.8 (dikunci) | bundle — SCSS lewat `meta.load-css` di `app.scss`, JS `bootstrap.bundle` di `mazer.js` → `window.bootstrap` | Grid, komponen, utilitas. Tidak ada di `modulesToCopy`. |
| `bootstrap-icons` | 1.13.2 | bundle (font lewat `app.scss`) + copy penuh | Ikon default `bi bi-*`. Sprite SVG juga ada di `assets/static/images/bootstrap-icons.svg`. |
| `perfect-scrollbar` | 1.5.6 | copy `dist`, dimuat `master.html` | Scrollbar sidebar (`sidebar.js` memakainya bila `PerfectScrollbar` tersedia). |
| `feather-icons` | 4.29.2 | bundle (`featherIcons.replace()` di `app.js`) | Me-render `<i data-feather="...">`. Salinan di `extensions/` tidak dirujuk HTML. |

## Chart dan visualisasi

| Paket | Versi | Cara dimuat | Halaman |
| --- | --- | --- | --- |
| `apexcharts` | 8.4.0 | copy `dist` | `index.html`, `layout-horizontal.html`, `layout-rtl.html`, `ui-chart-apexcharts.html`, `extra-component-sparkline.html`, `monitoring-resource.html`, `monitoring-network-topology.html` |
| `chart.js` | 4.5.1 | copy `dist` (`chart.umd.js`) | `ui-chart-chartjs.html` |
| `vis-network` | 10.1.2 | copy `dist` | `monitoring-network-topology.html` |
| `dayjs` | 1.11.23 | copy penuh | `ui-chart-apexcharts.html` (format tanggal) |

## Tabel

| Paket | Versi | Cara dimuat | Halaman | Catatan |
| --- | --- | --- | --- | --- |
| `simple-datatables` | 10.3.0 | copy `dist` | `table-datatable.html` | Vanilla JS, **pilihan utama**. Class `datatable-*`. |
| `datatables.net` | 3.1.4 | copy penuh | `table-datatable-jquery.html` | Butuh jQuery. Opsi `layout`, class `dt-*`. |
| `datatables.net-bs5` | 3.1.4 | copy penuh | `table-datatable-jquery.html` | Integrasi Bootstrap 5 untuk DataTables. |

## Form dan editor

| Paket | Versi | Cara dimuat | Halaman | Catatan |
| --- | --- | --- | --- | --- |
| `choices.js` | 11.2.4 | copy penuh | `form-element-select.html` | Select/multi-select. |
| `flatpickr` | 4.6.13 | copy `dist` | `extra-component-date-picker.html` | Date picker. |
| `parsleyjs` | 2.9.2 | copy `dist` | `form-validation-parsley.html` | Validasi form. Butuh jQuery. |
| `quill` | 2.0.3 | copy `dist` | `form-editor-quill.html` | Editor tanpa jQuery. Ada advisory low (XSS di export HTML), belum ada perbaikan. |
| `tinymce` | 8.10.0 | copy penuh | `form-editor-tinymce.html` | Editor lengkap. |
| `summernote` | 0.9.1 | copy `dist` | `form-editor-summernote.html` | Butuh jQuery 3 (belum jalan di jQuery 4). |
| `@melloware/coloris` | 0.25.0 | copy `dist` (`umd/coloris.min.js`) | `layout-theme-settings.html` | Color picker, auto-init. |

## Upload file

| Paket | Versi | Fungsi |
| --- | --- | --- |
| `filepond` | 4.32.12 | Komponen upload |
| `filepond-plugin-file-validate-size` | 2.2.8 | Validasi ukuran |
| `filepond-plugin-file-validate-type` | 1.2.9 | Validasi tipe file |
| `filepond-plugin-image-crop` | 2.0.6 | Crop gambar |
| `filepond-plugin-image-exif-orientation` | 1.0.11 | Koreksi orientasi EXIF |
| `filepond-plugin-image-filter` | 1.0.1 | Filter gambar |
| `filepond-plugin-image-preview` | 4.6.12 | Preview gambar (punya CSS sendiri) |
| `filepond-plugin-image-resize` | 2.0.10 | Resize gambar |

Semua copy `dist`, dipakai di `ui-file-uploader.html` bersama `toastify-js`.

## Notifikasi, dialog, dan lain-lain

| Paket | Versi | Cara dimuat | Halaman | Catatan |
| --- | --- | --- | --- | --- |
| `sweetalert2` | 11.26.25 | copy `dist` | `extra-component-sweetalert.html` | Dark lewat CSS variable `--swal2-*`. |
| `toastify-js` | 1.12.0 | copy penuh (`src/`) | `extra-component-toastify.html`, `ui-file-uploader.html` | |
| `rater-js` | 2.0.0 | copy `dist` (`rater-js.iife.min.js`) | `extra-component-rating.html` | CSS di-inject sendiri. |
| `dragula` | 3.7.3 | copy `dist` | `ui-widgets-todolist.html` | Drag and drop. |
| `jsvectormap` | 1.7.0 | copy `dist` | `ui-map-jsvectormap.html` | File ada di root `dist/` sejak 1.7. |
| `moment` | 2.31.0 | copy penuh | `extra-component-moment-timezone.html` | |
| `moment-timezone` | 0.6.5 | copy penuh (`builds/`) | `extra-component-moment-timezone.html` | Pakai build data 10 tahun. |
| `jquery` | 3.7.1 | copy `dist` | Summernote, Parsley, DataTables | **Jangan dipakai untuk kode baru.** Ditahan di v3. |

## Ikon tambahan

| Paket | Versi | Cara dimuat | Halaman |
| --- | --- | --- | --- |
| `@fortawesome/fontawesome-free` | 7.3.1 | copy penuh (`css/all.min.css`) | `ui-icons-fontawesome.html` |
| `@icon/dripicons` | 2.0.0-alpha.3 | copy penuh (`dripicons.css`) | `ui-icons-dripicons.html` |

Iconly tidak berasal dari npm: font-nya ada di `src/assets/static/fonts`, dimuat lewat `assets/scss/iconly.scss`.

## Lewat CDN (bukan dependency npm)

| Library | Versi | Halaman |
| --- | --- | --- |
| Leaflet | 1.9.4 (unpkg) | `ui-map-leaflet.html` |
| OpenLayers | 9.2.4 (jsdelivr) | `ui-map-openlayers.html` |

Font Nunito juga file lokal di `static/fonts` (paket `@fontsource/nunito` sudah dihapus).

## Dev dependency (tooling)

| Paket | Versi | Fungsi |
| --- | --- | --- |
| `vite` | 8.3.4 | Dev server dan build (Rolldown, pakai `build.rolldownOptions`) |
| `vite-plugin-static-copy` | 4.1.1 | Menyalin `modulesToCopy` dan aset statis lewat `copyDir()` |
| `nunjucks` | 3.2.4 | Engine template, dipakai `plugins/nunjucks.js` |
| `sass` | 1.105.2 | Kompilasi SCSS (module system) |
| `postcss` | 8.5.31 | Menjalankan rtlcss untuk layout RTL |
| `rtlcss` | 4.3.0 | `npm run rtl` dan PostCSS RTL |
| `prettier` | 3.9.10 | Merapikan `dist/*.html` setelah build |
| `bestzip` | 4.0.3 | `npm run zip` → `template.zip` |
| `release-it` | 21.1.1 | Rilis GitHub (build + zip lalu upload `template.zip`) |

`overrides.basic-ftp` (`^6.2.3`) menutup celah keamanan transitif dari `release-it`.

## Memilih dependency untuk fitur baru

| Kebutuhan | Pakai | Hindari |
| --- | --- | --- |
| Chart | ApexCharts (paling banyak dipakai, sudah ada pola dark mode) | Menambah library chart baru |
| Tabel interaktif | simple-datatables | DataTables (butuh jQuery) |
| Rich text | Quill atau TinyMCE | Summernote (jQuery) |
| Select | Choices.js | select2 (jQuery) |
| Validasi form | Validasi HTML5 + class Bootstrap `is-invalid`/`invalid-feedback` | Parsley untuk kode baru (jQuery) |
| Tanggal | flatpickr, dayjs | moment (hanya untuk timezone) |
| Notifikasi | Toast Bootstrap, Toastify, SweetAlert2 | |
| Modal, tooltip, dropdown | Bootstrap (`data-bs-*` atau `window.bootstrap`) | |
| Ikon | Bootstrap Icons | Menambah set ikon baru |

## Advisory keamanan yang tersisa

- `braces` (high) lewat `chokidar@3` milik `nunjucks` dan `vite-plugin-static-copy`. Hanya dev, tidak ikut ke hasil build.
- `quill` 2.0.3 (low, XSS lewat export HTML). Belum ada versi perbaikan.
