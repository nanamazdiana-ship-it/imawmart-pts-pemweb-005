# PTS Pemrograman Web - ImawMart (Dashboard Katalog Produk UMKM)

- **Nama Mahasiswa:** [Isi Nama Lengkap Kamu]
- **NPM:** 2440304005
- **Nama Aplikasi:** imawMart


---

## 1. Identitas & Deskripsi Singkat Aplikasi

**ImawMart** adalah aplikasi *Interactive Data Dashboard / Katalog Produk Minimarket UMKM* berbasis web interaktif. Aplikasi ini dikembangkan murni menggunakan **HTML5 semantik, CSS3 responsive (Grid/Flexbox), dan Vanilla JavaScript (ES6+)** tanpa menggunakan framework/library eksternal. 

Sistem ini mengintegrasikan REST API eksternal dari DummyJSON Products API secara asinkron (`async/await`) untuk menampilkan katalog produk secara dinamis. Aplikasi dilengkapi fitur pencarian *real-time*, pengurutan (*sorting*) harga dan nama, validasi formulir minat pemesanan berbasis aksesibilitas (ARIA), serta penanganan *UI State* (*Loading*, *Error State* dengan *Retry Button*, dan *Timestamp* pemuatan data).

---

## 2. Perhitungan Variasi Soal Berdasarkan NIM

Sesuai ketentuan Soal PTS Pemrograman Web 2026, kombinasi tugas ditentukan berdasarkan 3 digit terakhir NIM/NPM:

- **NPM:** 2440304005 (3 Digit Terakhir = **005**)
  * **Digit X = 0:** **Dataset / API:** Products (`https://dummyjson.com/products`) | Tema: Dashboard Produk / UMKM
  * **Digit Y = 0:** **Fitur Utama Wajib:** Search real-time + sorting
  * **Digit Z = 5:** **Validasi Form:** Nama minimal 5 karakter
  * **Perhitungan Nilai S:** S = X + Y + Z = 0 + 0 + 5 = 5
  * **Perhitungan Challenge Individual (C):** C = S mod 4 = 5 mod 4 = 1
  * **Hasil Challenge (C = 1):** Tombol *Retry* ketika *Fetch* gagal + Waktu/timestamp terakhir data berhasil dimuat.

---

## 3. Dataset & REST API Endpoints

Aplikasi mengonsumsi REST API publik dari DummyJSON:

- **Endpoint Utama (GET):** `https://dummyjson.com/products`
- **HTTP Method:** `GET`
- **Expected Status Code:** `200 OK`
- **Request Header:** `Accept: application/json`
- **Format Response:** JSON (Array of Objects)

---

## 4. Fitur Utama & Challenge Individual

1. **REST API Data Fetching:** Pengambilan data secara asinkron menggunakan `async/await` dengan pemeriksaan ketat `response.ok`.
2. **Search Real-Time (Fitur Y):** Penyaringan data produk langsung saat pengguna mengetik (*input event*) tanpa perlu melakukan *request* Fetch ulang ke server.
3. **Sorting Data (Fitur Y):** Pengurutan harga produk (Termurah/Termahal) dan abjad nama produk.
4. **Formulir & Validasi Aksesibel (Fitur Z):** Validasi *client-side* untuk form pengajuan sewa/pesanan dengan aturan wajib **Nama minimal 5 karakter**. Dilengkapi atribut ARIA (`aria-describedby`, `aria-live`, `aria-invalid`) dan pemindahan fokus kursor otomatis (*auto-focus*) ke input error pertama.
5. **UI State & Error Handling (Challenge C = 1):**
   * Tampilan *Loading State* saat data dimuat.
   * Tampilan *Error State* dan **Tombol Retry (Coba Lagi)** ketika koneksi internet terputus atau Fetch gagal.
   * Timestamp waktu/jam terakhir data berhasil dimuat ke dalam antarmuka.

---

## 5. Cara Menjalankan Project

1. Pastikan server lokal **Laragon 5** (Apache) sudah aktif.
2. Simpan direktori repositori ini ke dalam folder root server Laragon:
   `C:\laragon\www\imawmart`
3. Buka peramban (*browser*) dan akses URL:
   `http://localhost/imawmart/`
4. **Pengujian Error State & Retry:** Buka Developer Tools (F12) -> Tab Network -> ubah status koneksi menjadi **Offline** -> Refresh halaman. Klik tombol **Coba Lagi (Retry)** setelah mengembalikan status koneksi menjadi **Online**.

---

## 6. Tangkapan Layar Tampilan (Screenshots)

- **Tampilan Desktop (1024px+):**
  ![Screenshot Desktop](assets/images/Screenshot-Desktop.png)
  *(Katalog tampil dalam bentuk CSS Grid fluid 3-4 kolom lengkap dengan Toolbar Search & Ringkasan Data).*

- **Tampilan Mobile (320px - 375px):**
  ![Screenshot Mobile](assets/images/screenshot-mobile.png)
  *(Layout bertumpuk vertikal 1 kolom secara responsif, bebas dari horizontal scrollbar).*

---

