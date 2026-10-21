# Komponen dan class Mazer

Semua komponen Bootstrap 5.3 bisa dipakai apa adanya. Di bawah ini class **tambahan dari Mazer** (`src/assets/scss/components/`, `_utilities.scss`) dan pola markup yang dipakai halaman demo. Warna `{color}` = `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `dark`.

## Utilitas Mazer

| Class | Fungsi |
| --- | --- |
| `bg-light-{color}` | Latar lembut + teks gelap senada (ikut dark mode) |
| `font-semibold` / `font-bold` / `font-extrabold` | Ketebalan 600 / bold / 800 |
| `text-sm` / `text-xl` / `text-4xl` / `text-6xl` | Ukuran .875 / 1.25 / 2.25 / 4 rem |
| `text-gray-300` … `text-gray-600` | Abu-abu (warna tetap, kurang cocok untuk dark) |
| `text-subtitle` | Subjudul halaman |
| `text-width-md` | `max-width: 450px` |
| `py-4-5` | Padding vertikal 2rem (kartu statistik) |
| `mt-10`, `mb-10`, `my-10`, `mb-24`, `my-24` | Margin 3rem / 6rem |
| `btn-xl` | Tombol ekstra besar |
| `icon-mid` | Ikon `vertical-align: middle` (gaya lama, setara `bi-middle`) |
| `bi-middle` / `bi-sub` | Posisi vertikal ikon Bootstrap Icons |
| `bg-gradient-ltr` | Gradien biru kiri→kanan |
| `z-1` | `z-index: 1` |

## Kartu

```html
<div class="card">
    <div class="card-header">
        <h4 class="card-title">Judul</h4>
    </div>
    <div class="card-content">          <!-- opsional, dipakai di demo -->
        <div class="card-body">...</div>
    </div>
    <div class="card-footer">...</div>
</div>
```

Kartu statistik (dashboard):

```html
<div class="col-6 col-lg-3 col-md-6">
    <div class="card">
        <div class="card-body px-4 py-4-5">
            <div class="row">
                <div class="col-md-4 col-lg-12 col-xl-12 col-xxl-5 d-flex justify-content-start">
                    <div class="stats-icon purple mb-2">
                        <i class="iconly-boldShow"></i>
                    </div>
                </div>
                <div class="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                    <h6 class="text-muted font-semibold">Profile Views</h6>
                    <h6 class="font-extrabold mb-0">112.000</h6>
                </div>
            </div>
        </div>
    </div>
</div>
```

- `stats-icon` warna: `purple`, `blue`, `red`, `green`. Butuh `assets/scss/iconly.scss` bila memakai ikon Iconly. Bisa juga diisi `<i class="bi bi-... bi-middle lh-1">`.

## Tombol

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-light-primary">Light primary</button>
<button class="btn btn-outline-primary">Outline</button>
<button class="btn btn-primary"><i class="bi bi-plus bi-middle"></i> Tambah</button>
<a href="#" class="btn icon icon-left btn-primary"><i data-feather="edit"></i> Edit</a>
<a href="#" class="btn icon btn-danger"><i class="bi bi-trash bi-middle"></i></a>
<button class="btn btn-primary btn-block">Lebar penuh</button>
<div class="buttons">  <!-- memberi jarak antartombol -->
    <a class="btn btn-primary">A</a><a class="btn btn-secondary">B</a>
</div>
```

- `btn-light-{color}`: latar lembut, cocok untuk aksi sekunder.
- `btn icon` (+ `icon-left`/`icon-right`): tombol ikon. Feather (`data-feather`) di-render otomatis oleh `app.js`.

## Badge, alert, progress

```html
<span class="badge bg-primary">Primary</span>
<span class="badge bg-light-success">Aktif</span>
<span class="badge badge-notification bg-danger">7</span>   <!-- angka di ikon lonceng -->

<div class="alert alert-primary"><i class="bi bi-star bi-middle"></i> Pesan.</div>
<div class="alert alert-light-danger color-danger">Pesan lembut.</div>
<div class="alert alert-light-warning alert-dismissible show fade">
    Pesan. <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>

<div class="progress progress-primary mb-3">
    <div class="progress-bar" role="progressbar" style="width: 40%"></div>  <!-- lebar boleh inline, itu data -->
</div>
<div class="progress progress-success progress-sm">...</div>   <!-- juga progress-lg -->
```

Catatan: track `.progress` tetap terang di mode dark. Cek tampilannya dulu.

## Avatar

```html
<div class="avatar avatar-md"><img src="assets/static/images/faces/1.jpg" alt=""></div>
<div class="avatar bg-primary me-3">
    <span class="avatar-content">AB</span>        <!-- inisial atau ikon -->
</div>
<div class="avatar avatar-lg">
    <img src="..." alt="">
    <span class="avatar-status bg-success"></span>
</div>
```

Ukuran: `avatar-sm`, `avatar-md`, `avatar-md2`, `avatar-lg`, `avatar-xl`, `avatar-2xl`, `avatar-3xl`.

## Divider

```html
<div class="divider"><div class="divider-text">Atau</div></div>
<div class="divider divider-left"><div class="divider-text">Kiri</div></div>
```

Varian: `divider-left`, `divider-left-center`, `divider-right`, `divider-right-center`.

## Form

```html
<div class="form-group">
    <label for="nama" class="form-label">Nama</label>
    <input type="text" id="nama" class="form-control" placeholder="Nama">
</div>

<!-- Input dengan ikon di dalam -->
<div class="form-group position-relative has-icon-left">
    <input type="text" class="form-control" placeholder="Cari">
    <div class="form-control-icon"><i class="bi bi-search"></i></div>
</div>
<!-- juga has-icon-right; ukuran besar: form-control-xl / form-control-lg -->

<div class="input-group">
    <span class="input-group-text"><i class="bi bi-envelope bi-middle lh-1"></i></span>
    <input type="email" class="form-control">
</div>
```

- `form-check-lg`, `form-check-{color}` untuk checkbox/radio berwarna (`form-element-checkbox.html`).
- Layout form horizontal/vertikal: `form-layout.html`.

## Tabel

```html
<div class="table-responsive">
    <table class="table table-hover table-lg mb-0">
        <thead><tr><th>Nama</th><th>Status</th></tr></thead>
        <tbody><tr><td>...</td><td><span class="badge bg-success">Aktif</span></td></tr></tbody>
    </table>
</div>
```

Varian demo: `table-striped`, `table-bordered`, `table-dark`, `table-lg`. Untuk sort/search/pagination lihat `libraries.md` (simple-datatables).

## Breadcrumb dan judul halaman

Lihat kerangka di `SKILL.md`. `breadcrumb-header` untuk posisi kanan di layar besar. Variasi breadcrumb ada di `component-breadcrumb.html`.

## Navbar atas (layout `vertical-navbar`)

- `navbar navbar-expand navbar-light navbar-top`.
- Notifikasi: `dropdown-menu notification-dropdown`, item `dropdown-item notification-item`, ikon `notification-icon bg-{color}`, teks `notification-text`/`notification-title`/`notification-subtitle`.
- User dropdown: `user-dropdown`, `user-name`, `user-img` / `avatar avatar-md`.

## Widget

**Pesan terbaru** (`index.html`):

```html
<div class="recent-message d-flex px-4 py-3">
    <div class="avatar avatar-lg"><img src="assets/static/images/faces/4.jpg" alt=""></div>
    <div class="name ms-4">
        <h5 class="mb-1">Hank Schrader</h5>
        <h6 class="text-muted mb-0">@johnducky</h6>
    </div>
</div>
```

**Chat** (butuh `assets/scss/widgets/chat.scss`):

```html
<div class="chat-content">
    <div class="chat chat-left">               <!-- pesan masuk -->
        <div class="chat-body"><div class="chat-message">Halo</div></div>
    </div>
    <div class="chat">                          <!-- pesan keluar -->
        <div class="chat-body"><div class="chat-message">Hai</div></div>
    </div>
</div>
```

**Komentar** (`extra-component-comment.html`): `comment` > `comment-header` (avatar), `comment-body` > `comment-profileName`, `comment-time`, `comment-message`, `comment-actions`.

**Todo list**: `ui-widgets-todolist.html` + `scss/widgets/todo.scss` + dragula.

**Pricing**: `ui-widgets-pricing.html` (`card-highlighted` untuk paket unggulan).

## Halaman khusus dengan SCSS sendiri

Link di block `styles` bila memakai markupnya:

| SCSS | Untuk |
| --- | --- |
| `assets/scss/pages/auth.scss` | Sudah dimuat `auth.html` |
| `assets/scss/pages/error.scss` | Halaman error |
| `assets/scss/pages/account-profile.scss` | Profil dengan cover |
| `assets/scss/pages/chat.scss` + `widgets/chat.scss` | Aplikasi chat |
| `assets/scss/pages/email.scss` | Aplikasi email |
| `assets/scss/pages/flag.scss` | Ikon bendera |
| `assets/scss/pages/form-element-select.scss` | Choices.js |
| `assets/scss/pages/simple-datatables.scss` | simple-datatables |
| `assets/scss/pages/datatables.scss` | DataTables (jQuery) |
| `assets/scss/pages/summernote.scss` | Summernote |
| `assets/scss/pages/sweetalert2.scss` | SweetAlert2 |
| `assets/scss/pages/glightbox.scss` | Galeri lightbox |
| `assets/scss/pages/dripicons.scss` | Dripicons |
