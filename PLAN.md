# Plan Website Syauqi Fresh Seafood

> Supplier Fresh & Frozen Seafood — TPI Muara Angke Blok A No. 67–70, Jakarta Utara
> Eceran & grosir · Supply Resto & Ekspor · Order via WhatsApp **6287734112384**

---

## 0. Tujuan & Status Proyek

**Ini adalah WEB DEMO untuk PENAWARAN ke pemilik usaha, bukan aplikasi produksi.**

- Tujuan: menunjukkan ke pemilik Syauqi Fresh Seafood bagaimana toko online + CMS mereka akan terlihat dan bekerja, supaya pemilik tertarik dan setuju (deal).
- Semua fitur utama **berfungsi dan bisa dicoba** (pilih produk, keranjang, pesan ke WA, upload produk di CMS).
- Data yang belum tersedia **memakai data dummy** (harga, testimoni, angka statistik, FAQ, area ongkir, dll).
- Setelah pemilik setuju, data dummy diganti data asli dan proyek dilanjutkan ke tahap produksi (lihat Bagian B di fase eksekusi).

### Keputusan Proyek

| Item | Keputusan |
|---|---|
| Jenis | Demo / penawaran (dummy data diperbolehkan) |
| Model penjualan | Katalog + keranjang → pesanan dikirim ke WhatsApp (tanpa payment gateway) |
| Aplikasi | 2 aplikasi di Vercel: **Web Toko** & **CMS Admin** |
| Database & gambar | **Supabase** (Postgres + Auth + Storage) |
| Harga | **Opsional** — per produk bisa tampil harga, atau "Tanya Harga via WA" |
| Domain | URL Vercel (`*.vercel.app`) selama demo |
| Logo & foto | Dari akun resmi Syauqi Fresh Seafood (lihat bagian 1) |
| Target perangkat | Mobile-first, tetap optimal di desktop |

### Tautan Resmi
- WhatsApp: https://wa.me/6287734112384
- Instagram: https://www.instagram.com/syauqifreshseafood/
- YouTube: https://youtube.com/@syauqifreshseafood
- TikTok: https://www.tiktok.com/@syauqifreshseafood

---

## 1. Sumber Aset (Logo & Gambar)

### 1.1 Yang sudah diambil
| Aset | Lokasi | Sumber |
|---|---|---|
| Logo resmi (900×900, latar putih) | `assets/brand/logo-youtube.jpg` | Foto profil YouTube |
| 55 foto/thumbnail video asli (ikan, udang, kepiting, cumi, kerang, lobster, aktivitas lapak, mukbang) | `assets/youtube/*.jpg` | Thumbnail video & Shorts YouTube |
| 12 cover Reels Instagram terbaru (640×1136, ada watermark logo Syauqi) | `assets/instagram/*.jpg` | Instagram @syauqifreshseafood |
| Caption + kategori isi tiap foto Instagram | `assets/instagram/posts.json` | Instagram |
| Logo kecil (150×150, cadangan) | `assets/brand/logo-instagram.jpg` | Foto profil Instagram |

Info brand dari logo & channel:
- **"Since 2021"** → dipakai sebagai trust badge "Melayani sejak 2021".
- Deskripsi channel: supplier fresh seafood, konten Mukbang/ASMR, daily belanja, dan edukasi jenis-jenis seafood.

### 1.2 Instagram
Instagram hanya menampilkan **12 postingan terbaru** tanpa login (akun punya ±947 postingan); postingan lama butuh login sehingga tidak diambil.

Isi 12 foto Instagram (detail di `posts.json`):
| Kategori | Foto |
|---|---|
| Udang | Vaname (2 foto), windu/tiger besar, udang besar latar air gelap (cocok untuk hero/B2B) |
| Ikan | Selar kuning (2 foto), ikan merah, bawal putih, kerapu di styrofoam + es (cocok untuk section proses/packing) |
| Kerang | Kerang hijau close-up |
| Cumi | Cumi fresh di baskom |
| Aktivitas | Ikan hidup di bak/kolam (bukti stok hidup) |

Insight dari caption (dipakai untuk copywriting demo):
- "Order lebih dari 10 kg, dapat diskon spesial" → mendukung fitur harga grosir bertingkat.
- "Supply rutin untuk restoran, hotel, dan katering dengan harga khusus" → halaman Resto & Ekspor.
- Menjual **ikan laut, ikan tawar, dan biota laut**.
- "Nggak perlu ke pasar subuh-subuh. Kami antar langsung ke rumahmu" → copy hero/pengiriman.

Foto Instagram tambahan (postingan lama) bisa disimpan manual ke `assets/instagram/` atau diminta dari pemilik.

### 1.3 Pengolahan gambar
- Thumbnail Shorts berformat vertikal di dalam bingkai 16:9 → **di-crop bagian tengah** jadi foto produk persegi/potret.
- Cover Reels Instagram punya **bar hitam atas & bawah** → di-crop ke area foto (±4:5 / persegi). Watermark logo di bagian atas tetap dipertahankan (bukti foto asli).
- Logo → dibuat versi **transparan (PNG/SVG)**, versi ikon kecil (favicon), dan versi putih untuk latar gelap.
- Semua gambar dikonversi ke WebP & di-resize agar web tetap cepat.
- Foto dipetakan ke produk dummy sesuai isinya (udang → produk udang, kepiting → produk kepiting, dst).

---

## 2. Data Dummy untuk Demo

Semua data di bawah adalah **contoh** dan bisa diedit dari CMS.

### 2.1 Produk & Kategori (contoh)
| Kategori | Produk dummy |
|---|---|
| Udang | Udang Vaname, Udang Windu, Udang Tiger Jumbo, Lobster Bambu |
| Kepiting | Kepiting Bakau, Rajungan |
| Cumi & Sotong | Cumi Fresh, Sotong, Gurita |
| Kerang | Kerang Hijau, Kerang Dara, Kerang Bambu |
| Ikan | Kakap Merah, Bawal Putih, Kerapu, Selar Kuning, Tongkol, Kembung, Tenggiri, Layur, Kuwe, Ikan Kurisi |
| Paket | Paket Bakar Keluarga, Paket Saus Padang, Paket Stok Kulkas |

- Harga: harga dummy wajar per kg; sebagian produk sengaja diset **"Tanya Harga"** untuk memperlihatkan fitur harga opsional.
- Harga grosir bertingkat dummy di beberapa produk.
- Status stok, badge (Tangkapan Hari Ini, Best Seller, Promo) diisi campuran agar semua tampilan terlihat.

### 2.2 Konten dummy lainnya
- Testimoni: 8–10 testimoni contoh (nama, kota, rating, isi).
- Angka kepercayaan: "Sejak 2021" (asli dari logo) + jumlah pelanggan/resto mitra (dummy).
- FAQ: 8 pertanyaan umum.
- Area & ongkir: Jakarta Utara, Jakarta Pusat, Jakarta Barat, Jakarta Selatan, Jakarta Timur, Bodetabek (tarif dummy).
- Jam operasional: dummy (misalnya 04.00–16.00 WIB), diedit dari CMS.
- Banner promo: 2–3 banner contoh dengan countdown.
- Video: embed video YouTube asli dari channel.
- Pesanan: 10–15 pesanan contoh di CMS agar dashboard terlihat hidup.

### 2.3 Akun demo CMS
- 1 akun admin demo (email & password diberikan saat presentasi).

---

## 3. Arsitektur

```
seafood-web/                (monorepo — pnpm + Turborepo)
├── apps/
│   ├── web/                → Vercel project #1 (toko untuk customer)
│   └── cms/                → Vercel project #2 (admin panel)
├── packages/
│   └── shared/             → tipe data, format pesan WA, util harga, klien Supabase
├── supabase/
│   ├── migrations/         → skema database & policy
│   └── seed/               → data dummy + script upload gambar dummy
└── assets/                 → logo & foto sumber (YouTube, Instagram)
```

- **Stack**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Supabase**:
  - Postgres → produk, kategori, pesanan, testimoni, pengaturan
  - Auth → login admin CMS
  - Storage → foto produk, banner, testimoni
  - Row Level Security → publik hanya bisa *baca* data aktif & *buat* pesanan; tulis/ubah hanya admin
- **Sinkronisasi**: setiap simpan di CMS memanggil endpoint revalidate di Web → halaman langsung terbarui tanpa redeploy.
- **Seed script**: satu perintah untuk mengisi ulang semua data dummy + gambar (berguna untuk reset demo sebelum presentasi).

---

## 4. Fitur Web Toko (Customer)

### 4.1 Halaman
1. **Beranda** — landing page penjualan (lihat bagian 6).
2. **Katalog** — filter kategori, filter Fresh/Frozen, sort (terlaris, harga), pencarian.
3. **Detail Produk** — galeri foto/video, harga per kg atau "Tanya Harga", tabel harga grosir, pilihan berat & olahan, deskripsi, tips masak, produk terkait.
4. **Keranjang & Checkout WA** — ringkasan pesanan + form singkat → buka WhatsApp.
5. **Resto & Ekspor (B2B)** — keunggulan supply rutin, kapasitas, legalitas, form "Minta Penawaran" (ke WA).
6. **Tentang Kami** — cerita usaha (sejak 2021), foto lapak TPI, proses kerja.
7. **Testimoni & Galeri** — testimoni, foto, embed TikTok/YouTube.
8. **FAQ & Info Pengiriman** — area kirim, ongkir, jam operasional, cara simpan seafood.

### 4.2 Order via WhatsApp (fitur inti)
- **Pesan langsung 1 produk** — tombol "Pesan Sekarang" → WA terbuka dengan produk & berat terisi.
- **Keranjang multi-produk** — tersimpan di browser (localStorage).
- **Opsi per produk**:
  - Berat: 0,5 / 1 / 2 / 5 kg / input bebas
  - Olahan: utuh, dibersihkan, fillet, potong steak, kupas (bisa ada biaya tambahan)
  - Catatan item
- **Harga opsional**:
  - Produk berharga → subtotal & total dihitung otomatis (termasuk harga grosir).
  - Produk "Tanya Harga" → tetap bisa masuk keranjang; di pesan WA tertulis "harga mohon dikonfirmasi".
- **Form checkout**: nama, no. WA, metode (Diantar / Ambil di TPI), alamat, area, tanggal kirim, catatan.
- **Nomor pesanan otomatis** — format `SFS-YYMMDD-XXX`.
- **Pesanan dicatat ke database** sebelum WA dibuka → muncul di CMS.

**Template pesan WhatsApp:**
```
Halo Syauqi Fresh Seafood, saya mau order 🐟
No. Pesanan: SFS-261014-007

1. Udang Vaname Fresh (size 40) — 2 kg — dikupas
   Rp 95.000/kg = Rp 190.000
2. Kepiting Bakau — 1 kg — utuh
   Harga mohon dikonfirmasi

Estimasi total: Rp 190.000 + item konfirmasi (belum ongkir)

Nama: Budi
No. WA: 0812xxxxxxx
Pengiriman: Diantar — Jl. Kemang Raya 10, Jaksel
Tanggal: Kamis, 15 Okt 2026
Catatan: tolong es batu tambahan
```

### 4.3 Trust Builder (membuat customer percaya)
Menjawab 3 ketakutan utama beli seafood online: **tidak segar, berat kurang, penipuan**.

- Alamat fisik + **Google Maps TPI Muara Angke**
- **Foto & video asli** dari channel Syauqi Fresh Seafood
- **Badge "Sejak 2021"**
- **Garansi Segar** — "Tidak segar saat diterima? Ganti baru / uang kembali"
- **Garansi Berat Pas** — didukung video penimbangan
- **Proses 4 langkah**: TPI → Sortir → Packing es/styrofoam → Kirim
- **Testimoni** (dummy saat demo, diganti screenshot WA asli saat produksi)
- **Embed TikTok & YouTube** — bukti aktivitas nyata
- **Angka kepercayaan** — pelanggan, resto mitra (dummy saat demo)
- **Legalitas** — placeholder NIB/sertifikat
- **Status "Buka Sekarang / Tutup"** otomatis sesuai jam operasional

### 4.4 Strategi Marketing & Sales
- **Papan "Harga Hari Ini"** — diupdate harian dari CMS
- **Badge**: Tangkapan Hari Ini · Best Seller · Promo · Stok Terbatas
- **Harga grosir bertingkat** — contoh: 1–4 kg Rp 95rb · 5–9 kg Rp 90rb · ≥10 kg Rp 85rb
- **Paket bundling** — Paket Bakar Keluarga, Paket Saus Padang, Paket Stok Kulkas
- **Cross-sell** — "Sering dibeli bersama" di detail produk & keranjang
- **Banner promo + countdown**
- **Progress bar gratis ongkir** — "Tambah Rp 40.000 lagi untuk GRATIS ONGKIR"
- **Floating WA button** + **sticky cart bar** di mobile
- **Copywriting**: "Langsung dari TPI Muara Angke — lebih segar, harga tangan pertama"
- **Ide masak / resep singkat** di halaman produk

> Prinsip: saat produksi, semua urgensi & kelangkaan **harus jujur** (diatur dari CMS).

### 4.5 Mobile & Desktop
- Mobile-first; tombol besar, CTA di area jempol
- Sticky cart bar di bawah layar (mobile): `3 item · Rp 260.000 · Pesan via WA`
- Desktop: grid 4 kolom, keranjang sebagai drawer samping, hero lebar
- Target Lighthouse mobile ≥ 90; gambar WebP + lazy load

### 4.6 SEO & Tracking
- Open Graph (preview cantik saat link demo dibagikan di WA)
- Structured data `Product`, `LocalBusiness`, sitemap, robots.txt
- Saat demo: halaman di-set **noindex** (tidak muncul di Google) sampai resmi go-live
- Slot GA4 / Meta Pixel / TikTok Pixel disiapkan (diaktifkan saat produksi)

---

## 5. Fitur CMS (Admin)

CMS juga **mobile-friendly** — pemilik bisa update harga langsung dari lapak.

| # | Modul | Fitur |
|---|---|---|
| 1 | Login | Email + password, multi-admin |
| 2 | Dashboard | Pesanan hari ini/minggu ini, produk terpopuler, klik WA |
| 3 | Produk | CRUD, multi-foto (drag & drop / kamera HP), kategori, Fresh/Frozen, size, **harga opsional** (toggle tampil harga / "Tanya Harga"), harga grosir bertingkat, harga coret, opsi berat & olahan (+biaya), stok (Tersedia/Terbatas/Habis), badge, tampil/sembunyi, urutan |
| 4 | **Update Harga Cepat** | Satu layar untuk edit harga & stok semua produk sekaligus |
| 5 | Kategori | CRUD + ikon/gambar |
| 6 | Paket Bundling | Gabungkan produk + harga paket |
| 7 | Pesanan Masuk | List pesanan, status (Baru/Dikonfirmasi/Dikirim/Selesai/Batal), tombol balas WA, export Excel |
| 8 | Banner & Promo | Banner beranda, jadwal mulai/selesai, countdown |
| 9 | Testimoni | Upload screenshot/foto, nama, kota, rating |
| 10 | Galeri & Video | Link TikTok/YouTube |
| 11 | FAQ | CRUD + urutan |
| 12 | Area & Ongkir | Area kirim, tarif, minimal gratis ongkir |
| 13 | Pengaturan Toko | No. WA, alamat, jam buka, sosmed, logo, teks garansi, angka kepercayaan, **toggle tampilkan harga (global)**, Pixel ID |
| 14 | SEO | Judul & deskripsi per halaman/produk |

---

## 6. Desain & Tampilan

### 6.1 Identitas Visual (diambil dari logo resmi)
| Elemen | Nilai |
|---|---|
| Biru brand (dari logo) | `#0B72B5` |
| Cyan brand (dari logo) | `#45C4E5` |
| Navy gelap (latar hero/footer) | `#0A2A4A` |
| CTA beli | Oranye koral `#FF6B35` (kontras dengan biru, menarik mata) |
| CTA WhatsApp | Hijau WA `#25D366` |
| Latar | Putih / es `#F3FAFD` |
| Font | Plus Jakarta Sans (heading tebal, body ringan) |
| Elemen dekoratif | Gelembung & gelombang air (mengikuti gaya logo) |
| Gaya foto | Close-up seafood asli di atas es (kesan dingin & segar) |

### 6.2 Urutan Section Beranda (sales funnel)
1. **Hero** — foto/video seafood di atas es, headline "Seafood Segar Langsung dari TPI Muara Angke", subheadline eceran & grosir · supply resto & ekspor, 2 CTA (Lihat Produk / Pesan via WA), badge (Sejak 2021 · Garansi Segar · Berat Pas · Kirim Cepat)
2. **Kategori** — ikon Ikan · Udang · Kepiting · Cumi · Kerang · Paket
3. **Harga Hari Ini / Tangkapan Hari Ini** — carousel produk + tombol tambah
4. **Best Seller** — grid produk
5. **Kenapa Pilih Kami** — 4 keunggulan
6. **Proses dari TPI ke Dapur Anda** — 4 langkah bergambar
7. **Paket Hemat** — bundling dengan harga coret
8. **Video TikTok / YouTube** (video asli channel)
9. **Testimoni** — carousel
10. **Banner Resto & Ekspor** — "Butuh supply rutin? Minta penawaran khusus"
11. **FAQ singkat**
12. **Lokasi** — Google Maps, jam buka, status buka/tutup
13. **CTA penutup** — "Pesan sekarang, dikirim hari ini"
14. **Footer** — logo, alamat, sosmed, link penting

Selalu tampil: **floating WA button** (kanan bawah) + **sticky cart bar** (mobile).

---

## 7. Skema Database (Supabase)

| Tabel | Kolom utama |
|---|---|
| `categories` | id, name, slug, icon_url, sort_order, is_active |
| `products` | id, category_id, name, slug, type (fresh/frozen), size_label, description, cooking_tips, **show_price**, price_per_kg (nullable), compare_price, stock_status, badges[], is_active, sort_order, seo_title, seo_description |
| `product_images` | id, product_id, url, sort_order |
| `price_tiers` | id, product_id, min_kg, price_per_kg |
| `product_options` | id, product_id, kind (weight/processing), label, value, extra_price |
| `bundles` | id, name, slug, description, image_url, price, compare_price, is_active |
| `bundle_items` | bundle_id, product_id, qty_kg |
| `orders` | id, order_code, customer_name, customer_phone, method, address, area_id, delivery_date, notes, subtotal, status, created_at |
| `order_items` | id, order_id, product_id, name_snapshot, qty_kg, processing, unit_price (nullable), line_total (nullable) |
| `banners` | id, title, subtitle, image_url, link, starts_at, ends_at, is_active |
| `testimonials` | id, name, city, rating, content, image_url, is_active |
| `videos` | id, platform (tiktok/youtube), url, title, sort_order |
| `faqs` | id, question, answer, sort_order |
| `shipping_areas` | id, name, fee, min_free_shipping |
| `settings` | key, value (JSON) — WA, alamat, jam buka, sosmed, garansi, angka trust, show_prices, pixel IDs |
| `events` | id, type (wa_click, add_to_cart), product_id, created_at |

---

## 8. Fase Eksekusi

### BAGIAN A — Demo Penawaran (target: siap dipresentasikan)

| Fase | Fokus | Estimasi |
|---|---|---|
| 1 | Fondasi teknis + aset | 1–2 hari |
| 2 | CMS inti | 2–3 hari |
| 3 | Web katalog & desain | 3–4 hari |
| 4 | Keranjang & order WA | 2 hari |
| 5 | Trust, marketing & data dummy lengkap | 2–3 hari |
| 6 | Polish, QA & siap presentasi | 1–2 hari |

#### Fase 1 — Fondasi Teknis + Aset
- [x] Setup monorepo (pnpm + Turborepo): `apps/web`, `apps/cms`, `packages/shared`
- [x] Setup Next.js + Tailwind di kedua app (komponen UI ditulis sendiri dengan Tailwind, tanpa shadcn/ui)
- [x] Buat project Supabase, migrasi skema, bucket storage, RLS policy
- [x] Olah aset: logo transparan + favicon + versi putih; crop & kompres 55 foto YouTube + 12 foto Instagram
- [x] Seed script: kategori, produk dummy + foto, testimoni, FAQ, area, banner, pesanan contoh
- [x] Akun admin demo
- [ ] Deploy kedua app ke Vercel (2 project) + env variables
- **Output**: 2 URL Vercel online, database terisi data demo

#### Fase 2 — CMS Inti
- [x] Login & proteksi halaman admin
- [x] Layout CMS (sidebar desktop, bottom nav mobile)
- [x] CRUD Kategori
- [x] CRUD Produk + upload multi-foto (kompres otomatis) + harga opsional + harga grosir + opsi
- [x] Update Harga Cepat
- [x] Pengaturan Toko (termasuk toggle tampilkan harga)
- [x] Trigger revalidate ke Web saat data disimpan
- **Output**: bisa demo "upload ikan baru dari HP → langsung muncul di web"

#### Fase 3 — Web Katalog & Desain
- [x] Design system dari warna logo (tombol, kartu produk, badge, elemen gelembung/gelombang)
- [x] Header (logo), footer, floating WA button
- [x] Beranda (hero, kategori, harga hari ini, best seller, kenapa kami, lokasi)
- [x] Katalog: filter, sort, pencarian
- [x] Detail produk: galeri, harga / "Tanya Harga", tabel grosir, opsi berat & olahan
- [x] Responsif mobile & desktop
- **Output**: web cantik dengan foto asli Syauqi

#### Fase 4 — Keranjang & Order WA
- [x] Cart store (localStorage) + drawer keranjang + sticky cart bar mobile
- [x] Kalkulasi harga grosir, biaya olahan, item "Tanya Harga"
- [x] Halaman checkout + validasi form
- [x] Generator nomor pesanan & pesan WA
- [x] Simpan pesanan ke DB → buka `wa.me/6287734112384`
- [x] Tombol "Pesan Sekarang" 1 produk
- [x] CMS: modul Pesanan Masuk + status + balas WA + export Excel
- **Output**: alur pesan end-to-end bisa dicoba langsung oleh pemilik

#### Fase 5 — Trust, Marketing & Data Dummy Lengkap
- [x] Testimoni, galeri video (embed YouTube asli)
- [x] Section garansi, "Sejak 2021", proses 4 langkah
- [x] Halaman Tentang Kami, FAQ & Info Pengiriman
- [x] Banner promo + countdown
- [x] Paket bundling + cross-sell
- [x] Progress bar gratis ongkir + area & ongkir
- [x] Halaman Resto & Ekspor + form Minta Penawaran
- [x] Status Buka/Tutup otomatis
- [x] Modul CMS untuk semua fitur di atas + dashboard statistik

#### Fase 6 — Polish, QA & Siap Presentasi
- [x] Animasi halus (fade-in section, hover kartu produk), loading skeleton
- [x] Open Graph image (preview link demo di WA terlihat profesional)
- [x] `noindex` selama demo
- [ ] QA: iPhone (Safari), Android (Chrome), desktop; tes pesan WA sungguhan
- [x] Reset data demo (jalankan seed ulang)
- [x] Siapkan skenario presentasi:
  1. Buka web di HP → lihat beranda & produk
  2. Masukkan 3 produk ke keranjang → pesan → WA terbuka dengan pesan rapi
  3. Buka CMS → pesanan tadi muncul
  4. Upload produk baru dari HP + ubah harga → web langsung berubah
- **Output**: link demo Web + link CMS + akun demo, siap dikirim ke pemilik

### BAGIAN B — Setelah Deal (menuju produksi / go-live)

- [ ] Ganti data dummy dengan data asli (produk, harga, testimoni screenshot WA, jam buka, area ongkir, angka pelanggan)
- [ ] Foto produk asli tambahan dari pemilik / postingan Instagram lama
- [ ] Hapus data pesanan contoh, buat akun admin milik pemilik
- [ ] Domain custom (`syauqifreshseafood.com` + `admin.`) + SSL
- [ ] Upgrade Vercel Pro (penggunaan komersial) bila diperlukan
- [ ] Aktifkan GA4, Meta Pixel, TikTok Pixel + event klik WA
- [ ] Hapus `noindex`, daftar Google Search Console, submit sitemap
- [ ] Update Google Business Profile dengan link web
- [ ] Pasang link web di bio Instagram, TikTok, YouTube, WA Business
- [ ] Training admin (update harga harian, kelola pesanan)

### Pengembangan Lanjutan (opsional)
- Artikel / resep untuk SEO
- Kode voucher & program pelanggan tetap
- Versi Bahasa Inggris untuk buyer ekspor
- Laporan penjualan bulanan

---

## 9. Biaya

| Item | Demo | Produksi |
|---|---|---|
| Vercel | Gratis (Hobby) | ± USD 20/bulan (Pro, untuk komersial) |
| Supabase | Gratis | Gratis di awal (500 MB DB, 1 GB storage); upgrade bila perlu |
| Domain `.com` | — | ± Rp 150–200 rb/tahun |
