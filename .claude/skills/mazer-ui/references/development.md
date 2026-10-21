# Aturan pengembangan Mazer

Aturan proyek dari `CLAUDE.md` untuk perubahan di luar markup halaman: SCSS, build, library, dan konvensi.

## Folder yang di-skip

Jangan membaca, grep, atau mengedit isi folder/file berikut kecuali diminta:

| Path | Alasan / pengecualian |
| --- | --- |
| `node_modules/` | Dependency pihak ketiga. Boleh `ls node_modules/<paket>` untuk mengecek struktur `dist/` setelah upgrade. |
| `dist/` | Hasil build, selalu di-generate ulang. Perbaikan selalu di `src/`. Pengecualian: skrip cek aset di bagian Verifikasi. |
| `graphify-out/` | Knowledge graph. Pakai `graphify query`, jangan dibaca mentah. |
| `package-lock.json`, `yarn.lock` | Jangan diedit manual. |
| `src/assets/static/images/` | Aset gambar (ratusan SVG bendera, foto sample). |
| `src/assets/static/js/pages/valde.min.js` | File minified pihak ketiga. |

## Perintah

```bash
npm install          # Node 22+ (>= 22.22.2, lihat "engines" dan .nvmrc)
npm run dev          # dev server Vite
npm run build        # vite build + prettier ke dist/
npm run rtl          # generate *.rtl.css dari dist (jalankan setelah build)
npm run prod-rtl     # build + rtl
npm run zip          # template.zip dari dist/
```

## Arsitektur build

- Setiap file di root `src/*.html` otomatis jadi entry build (`getFiles()` di `vite.config.js`).
- **Vite 8 (Rolldown)**: pakai `build.rolldownOptions`, bukan `rollupOptions`.
- **Nunjucks** dirender oleh plugin lokal `plugins/nunjucks.js` (pengganti `vite-plugin-nunjucks` yang terkunci di Vite 5). Variabel per halaman dari `getVariables()`, filter `containString`/`startsWith` didaftarkan di `vite.config.js`.
- **JS core** `src/assets/js/app.js` di-bundle sebagai UMD ke `dist/assets/compiled/js/app.js` (lewat `build()` di bagian atas `vite.config.js`). `mazer.js` memasang `window.bootstrap` dan sidebar.
- **Penyalinan file** memakai `vite-plugin-static-copy` v4 lewat helper `copyDir()`: glob `**/*` dengan `rename.stripBase` berupa angka. **Jangan pakai `stripBase: true` untuk folder**, karena semua file akan diratakan ke satu folder.
- **RTL**: `layouts/rtl.html` memuat `app-rtl.scss`/`app-dark-rtl.scss` yang dibalik rtlcss lewat PostCSS di `vite.config.js` (jalan di dev dan build).

## SCSS (module system)

Semua SCSS Mazer memakai `@use`/`@forward`.

- **Jangan menambah `@import`** atau fungsi global (`map-get`, `lighten`, `darken`, `mix`, ...). Pakai `sass:map`, `sass:color`, `sass:math`, `sass:meta`.
- **`_bootstrap-variables.scss`**: semua variabel milik Bootstrap (override Mazer + sisa default 5.3.8). Isinya dikirim utuh ke Bootstrap: `meta.load-css("bootstrap/scss/bootstrap", $with: meta.module-variables("bootstrap-variables"))`. **Hanya variabel yang dideklarasikan Bootstrap** yang boleh ada di sini, kalau tidak Sass error "not declared with !default".
- **`_variables.scss`**: `@forward` fungsi Bootstrap dan `_bootstrap-variables`, lalu variabel khusus Mazer (`$sidebar-bg`, `$swal-*`, `$horizontal-*`, ...). Setiap file Mazer cukup `@use "<path>/variables" as *;`.
- **Fungsi Bootstrap** yang bisa dipakai sebagai modul: `tint-color`, `shade-color`, `to-rgb`, `map-loop` + `to-rgb`. `rgba-css-var`, `varify`, `color-contrast`, dan `escape-svg` membaca variabel global Bootstrap, jadi **tidak bisa dipanggil dari modul Mazer**. Biarkan Bootstrap yang menghitung variabel yang membutuhkannya.
- **`@extend` tidak menjangkau CSS Bootstrap** (Bootstrap dimuat dengan `load-css`). Tulis selector eksplisit, contoh `h4, .h4`.
- **Tema dark** (`themes/dark/app-dark.scss`):
  - `_variables-dark.scss` meng-assign ulang variabel modul (`$body-bg: ...`), jadi harus di-`@use` sebelum apa pun yang membaca variabel.
  - Komponen Bootstrap untuk dark dirender ulang di bawah `html[data-bs-theme="dark"]` lewat `themes/dark/_bootstrap-components.scss`. **Ini satu-satunya file yang boleh memakai `@import`** (Bootstrap 5.3 tidak punya API modul). Untuk file ini `vite.config.js` memakai `silenceDeprecations: ['import']`, dan `quietDeps: true` menyembunyikan warning dari Bootstrap.
  - SweetAlert2 dark lewat CSS variable `--swal2-*` di `app-dark.scss`, tanpa paket tema terpisah.
- File SCSS di-link langsung dari HTML (`<link href="assets/scss/pages/x.scss">`) lalu dikompilasi Vite. Style khusus halaman di `scss/pages/`, widget di `scss/widgets/`.
- **Cara cek**: build harus bersih tanpa deprecation warning. Kalau mengubah variabel, bandingkan CSS hasil build sebelum dan sesudah (misalnya `prettier --parser css` lalu `diff`).

## Warna tema kustom (Theme Settings)

- `initTheme.js` membaca localStorage `theme-colors` (`{ light: {primary, bodyBg, surfaceBg, textColor, headingColor}, dark: {...} }`) lalu menyisipkan `<style id="theme-colors">` di `<head>` setelah `app.css`/`app-dark.css`, sehingga menang pada spesifisitas yang sama.
- Banyak warna Mazer di-compile sebagai nilai tetap (`.btn-primary`, `.sidebar-wrapper`, focus ring), jadi override-nya ditulis per selector di `primaryCss()`/`bodyBgCss()`/`surfaceBgCss()`/`textCss()`/`headingCss()`.
- Menu sidebar mengikuti warna heading di light dan warna teks di dark (sesuai default Mazer).
- **Komponen baru yang memakai `$primary`, warna background, atau warna teks harus ditambahkan selectornya di sana.**
- Coloris (`@melloware/coloris`, UMD `dist/umd/coloris.min.js` + `dist/coloris.min.css`, auto-init) membungkus input dengan `.clr-field` baru saat `DOMContentLoaded`, jadi class untuk wrapper ditambahkan di listener event itu. Popup tidak membaca `data-bs-theme`: set `Coloris({ themeMode })` setiap tema berganti. Coloris memicu event `input` sendiri saat memilih warna.

## Menambah / upgrade library

1. Install atau ubah versi di `package.json`.
2. Tambahkan ke `modulesToCopy` di `vite.config.js` bila library dimuat lewat `<script>`/`<link>` (`true` = salin `dist/` saja, `false` = seluruh paket).
3. **Cek struktur folder versi baru** (`ls node_modules/<paket>/dist`). Upgrade minor pun bisa memindahkan file. Contoh yang pernah terjadi:
   - jsvectormap 1.7 memindahkan `css/` dan `js/` ke root `dist/`.
   - rater-js 2 hanya punya `dist/rater-js.iife.min.js` (CSS di-inject sendiri).
   - DataTables 2+ mengganti `jquery.dataTables.min.js` dengan `dataTables.min.js`, class `dataTables_*` dengan `dt-*`, dan opsi `dom` dengan `layout`.
   - simple-datatables 10 mengganti `dataTable-*` dengan `datatable-*`.
4. Sesuaikan path di HTML.
5. Baca changelog untuk breaking change API, lalu sesuaikan script di `static/js/pages/`.
6. Verifikasi (build + cek aset + buka halaman, tidak ada error console).

Jangan menambah dependency jQuery baru.

## Versi yang ditahan

- **jQuery 4**: Summernote 0.9.1 rusak di jQuery 4 (`$.now is not a function`, editor kedua gagal dibuat). Tetap di jQuery 3.7.1 sampai Summernote mendukungnya. Parsley dan DataTables 3 sudah berjalan di jQuery 4.
- **Bootstrap 6** (masih alpha): setelah stabil, ganti `_bootstrap-components.scss` dengan `@use` dan hapus `silenceDeprecations`.
- **CI**: `.github/workflows` masih memakai action v3 dan `release.yml` memanggil script `production` yang tidak ada. Jangan diubah tanpa diminta.

## Konvensi

- Indentasi mengikuti file yang ada (HTML/JS 2–4 spasi, sesuai file).
- Jangan commit `dist/`, `template.zip`, `node_modules/`.
- Kerjakan satu perubahan per item, lalu verifikasi.
- Setelah mengubah kode, jalankan `graphify update .` agar knowledge graph tetap terbaru.
