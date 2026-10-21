# Library pihak ketiga

Library disalin dari `node_modules` ke `dist/assets/extensions/<paket>` lewat `modulesToCopy` di `vite.config.js` (`true` = isi folder `dist/` saja, `false` = seluruh paket). HTML merujuk ke `assets/extensions/<paket>/...`. CSS di block `styles`, JS di block `js` **sebelum** script halaman.

Script halaman ada di `src/assets/static/js/pages/`. Salin dari halaman contoh lalu sesuaikan.

## Tabel library

| Library | CSS (block `styles`) | JS (block `js`) | Script contoh | Halaman contoh |
| --- | --- | --- | --- | --- |
| ApexCharts 8 | — | `extensions/apexcharts/apexcharts.min.js` | `dashboard.js`, `ui-apexchart.js`, `sparkline.js`, `resource-monitor.js` | `index.html`, `ui-chart-apexcharts.html` |
| Chart.js 4 | — | `extensions/chart.js/chart.umd.js` | `ui-chartjs.js` | `ui-chart-chartjs.html` |
| dayjs | — | `extensions/dayjs/dayjs.min.js` | `ui-apexchart.js` | `ui-chart-apexcharts.html` |
| vis-network 10 | — | `extensions/vis-network/vis-network.min.js` | `network-topology.js` | `monitoring-network-topology.html` |
| simple-datatables 10 | `extensions/simple-datatables/style.css`, `scss/pages/simple-datatables.scss` | `extensions/simple-datatables/umd/simple-datatables.js` | `simple-datatables.js` | `table-datatable.html` |
| DataTables 3 (jQuery) | `extensions/datatables.net-bs5/css/dataTables.bootstrap5.min.css`, `scss/pages/datatables.scss` | `extensions/jquery/jquery.min.js`, `extensions/datatables.net/js/dataTables.min.js`, `extensions/datatables.net-bs5/js/dataTables.bootstrap5.min.js` | `datatables.js` | `table-datatable-jquery.html` |
| Choices.js 11 | `extensions/choices.js/public/assets/styles/choices.css` | `extensions/choices.js/public/assets/scripts/choices.js` | `form-element-select.js` | `form-element-select.html` |
| flatpickr | `extensions/flatpickr/flatpickr.min.css` | `extensions/flatpickr/flatpickr.min.js` | `date-picker.js` | `extra-component-date-picker.html` |
| Parsley (jQuery) | — | `extensions/jquery/jquery.min.js`, `extensions/parsleyjs/parsley.min.js` | `parsley.js` | `form-validation-parsley.html` |
| Quill 2 | `extensions/quill/quill.snow.css`, `extensions/quill/quill.bubble.css` | `extensions/quill/quill.js` | `quill.js` | `form-editor-quill.html` |
| TinyMCE 8 | — | `extensions/tinymce/tinymce.min.js` | `tinymce.js` | `form-editor-tinymce.html` |
| Summernote (jQuery) | `extensions/summernote/summernote-lite.css`, `scss/pages/summernote.scss` | `extensions/jquery/jquery.min.js`, `extensions/summernote/summernote-lite.min.js` | `summernote.js` | `form-editor-summernote.html` |
| FilePond + plugin | `extensions/filepond/filepond.css`, `extensions/filepond-plugin-image-preview/filepond-plugin-image-preview.css` | `extensions/filepond/filepond.js` + `extensions/filepond-plugin-*/filepond-plugin-*.min.js` | `filepond.js` | `ui-file-uploader.html` |
| SweetAlert2 11 | `extensions/sweetalert2/sweetalert2.min.css`, `scss/pages/sweetalert2.scss` | `extensions/sweetalert2/sweetalert2.min.js` | `sweetalert2.js` | `extra-component-sweetalert.html` |
| Toastify | `extensions/toastify-js/src/toastify.css` | `extensions/toastify-js/src/toastify.js` | `toastify.js` | `extra-component-toastify.html` |
| rater-js 2 | — (CSS di-inject sendiri) | `extensions/rater-js/rater-js.iife.min.js` | `rater-js.js` | `extra-component-rating.html` |
| moment + timezone | — | `extensions/moment/min/moment.min.js`, `extensions/moment-timezone/builds/moment-timezone-with-data-10-year-range.min.js` | `moment-timezone.js` | `extra-component-moment-timezone.html` |
| jsvectormap | `extensions/jsvectormap/jsvectormap.min.css` | `extensions/jsvectormap/jsvectormap.min.js`, `extensions/jsvectormap/maps/world.js` | `jsvectormap.js` | `ui-map-jsvectormap.html` |
| Leaflet (CDN) | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css` | `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` | `ui-map-leaflet.js` | `ui-map-leaflet.html` |
| OpenLayers (CDN) | `https://cdn.jsdelivr.net/npm/ol@v9.2.4/ol.css` | `https://cdn.jsdelivr.net/npm/ol@v9.2.4/dist/ol.js` | `ui-map-openlayers.js` | `ui-map-openlayers.html` |
| dragula | `extensions/dragula/dragula.min.css`, `scss/widgets/todo.scss` | `extensions/dragula/dragula.min.js` | `ui-todolist.js` | `ui-widgets-todolist.html` |
| Coloris | `extensions/@melloware/coloris/coloris.min.css` | `extensions/@melloware/coloris/umd/coloris.min.js` | `theme-settings.js` | `layout-theme-settings.html` |
| Font Awesome 7 | `extensions/@fortawesome/fontawesome-free/css/all.min.css` | — | — | `ui-icons-fontawesome.html` |
| Dripicons | `extensions/@icon/dripicons/dripicons.css`, `scss/pages/dripicons.scss` | — | — | `ui-icons-dripicons.html` |

Semua path di atas diawali `assets/`, contoh `<script src="assets/extensions/apexcharts/apexcharts.min.js"></script>`.

Sudah dimuat oleh layout, jangan dimuat ulang: Bootstrap (JS lewat `app.js`, tersedia sebagai `window.bootstrap`), Bootstrap Icons, perfect-scrollbar, feather-icons.

## Catatan per library

- **Pilih yang tanpa jQuery**: simple-datatables (bukan DataTables), Quill/TinyMCE (bukan Summernote), Choices.js, flatpickr. jQuery tetap 3.7.1 karena Summernote belum mendukung jQuery 4.
- **ApexCharts dan dark mode**: chart tidak berganti warna sendiri. Baca `document.documentElement.getAttribute("data-bs-theme")` saat init, lalu pasang `MutationObserver` pada `document.documentElement` (`attributeFilter: ["data-bs-theme"]`) yang memanggil `chart.updateOptions(...)`. Contoh: `resource-monitor.js` (theme + warna) dan `sparkline.js` (tema tooltip).
- **vis-network**: warna node/edge juga harus disesuaikan saat tema berganti (`network-topology.js`).
- **simple-datatables 10**: class prefix `datatable-*` (bukan `dataTable-*`). Class Bootstrap dipasang lewat opsi `classes`.
- **DataTables 3**: pakai opsi `layout`, bukan `dom`. Class `dt-*` (bukan `dataTables_*`).
- **Coloris**: auto-init, membungkus input dengan `.clr-field` saat `DOMContentLoaded`. Popup tidak membaca `data-bs-theme`, jadi panggil `Coloris({ themeMode })` setiap tema berganti.
- **SweetAlert2 dark**: diatur lewat CSS variable `--swal2-*` di `app-dark.scss`. Tidak perlu paket tema terpisah.
- **Modal Bootstrap dari JS**: `bootstrap.Modal.getOrCreateInstance(el).show()`.

## Menambah library baru

Lakukan hanya bila komponen Bootstrap/Mazer dan library di atas tidak cukup, dan jangan library yang butuh jQuery.

1. `npm install <paket>`.
2. Tambahkan ke `modulesToCopy` di `vite.config.js`.
3. Cek struktur folder: `ls node_modules/<paket>/dist`. Sesuaikan path di HTML.
4. Buat `src/assets/static/js/pages/<nama>.js` (script biasa, bukan module).
5. Pastikan widget terbaca di light dan dark.
6. `npm run build`, jalankan skrip cek aset (lihat `SKILL.md`), lalu buka halaman dan cek console.
