## 1. Identitas

| | |
|---|---|
| Nama | Erma Sari |
| NIM | 2440304005 |


## 2. Deskripsi Aplikasi

**imawmart** 
membantu pemilik toko memantau katalog produk: melihat harga, rating, dan stok, mencari produk secara langsung saat mengetik, mengurutkannya, dan membaca ringkasan data (rata-rata harga, produk termahal, jumlah kategori). Ada juga form permintaan produk untuk menyatakan kategori yang diminati.

Data diambil dari REST API publik DummyJSON setiap kali halaman dibuka, dan seluruh produknya (194 produk dari 24 kategori) ditampilkan.

## 3. Perhitungan Variasi Soal (NIM 2440304005)

Tiga digit terakhir NIM adalah **005**, sehingga **X = 0, Y = 0, Z = 5**.

| Komponen | Perhitungan | Hasil |
|---|---|---|
| Dataset (X = 0) | 0 termasuk "0 atau 5" | **Products** |
| Fitur utama (Y = 0) | 0 termasuk "0 atau 5" | **Search real-time + sorting** |
| Validasi form (Z = 5) | 5 termasuk "0 atau 5" | **Nama minimal 5 karakter** |
| Challenge | S = 0 + 0 + 5 = 5; C = 5 mod 4 = **1** | **Tombol Retry saat fetch gagal + waktu terakhir data berhasil dimuat** |

## 4. Dataset / Endpoint REST API

| Keterangan | Nilai |
|---|---|
| Endpoint yang dipakai | `GET https://dummyjson.com/products?limit=0` |
| Isi respons | Objek JSON: `products` (array), `total`, `skip`, `limit` |
| Jumlah data | **194 produk dalam 24 kategori** (diperiksa 14 Oktober 2026), semuanya ditampilkan tanpa penyaringan |
| Field yang dipakai | `title`, `category`, `brand`, `price`, `rating`, `stock`, `thumbnail` |

Parameter `limit=0` dipakai karena tanpa parameter API hanya mengirim 30 produk. Dataset tetap `/products` sesuai varian NIM. Harga dari API berupa dolar AS, jadi ditampilkan sebagai USD tanpa konversi.

## 5. Fitur Utama dan Challenge

- **Katalog lengkap**: seluruh produk dari API ditampilkan, tanpa penyaringan kategori.
- **Search real-time (Y)**: hasil berubah setiap ketikan pada kolom pencarian (nama, kategori, atau merek).
- **Sorting (Y)**: bawaan API, harga termurah/termahal, nama A-Z/Z-A, rating tertinggi.
- **Analisis data**: rata-rata harga, produk termahal, jumlah kategori, semuanya dihitung dengan JavaScript.
- **Form + validasi (Z)**: nama minimal 5 karakter, kategori wajib dipilih, catatan opsional.
- **Challenge (C = 1)**: tombol "Coba lagi" saat fetch gagal dan teks "Terakhir berhasil dimuat" dengan tanggal dan jam.
- **Loading, success, dan error state** pada daftar produk.
- Aksesibilitas dasar: elemen semantik (header, hgroup, nav, main, section, form, footer, tanpa `<div>`), label pada input, `alt` pada gambar, skip link, fokus terlihat, dan pesan error berupa teks (bukan hanya warna).


## 6. Cara Menjalankan

1. Pastikan server lokal **Laragon 5** (Apache) sudah aktif[cite: 3, 4].
2. Simpan direktori repositori ini ke dalam folder root server Laragon[cite: 3, 4]:
   `C:\laragon\www\proyek-semester` (atau `C:\laragon\www\imawmart`)
3. Buka peramban (*browser*) dan akses URL[cite: 3, 4]:
   `http://localhost/imawmart/`
4. **Pengujian Error State & Retry:** Buka Developer Tools (F12) ->Tab Network -> ubah status koneksi menjadi **Offline** $\rightarrow$ Refresh halaman. Klik tombol **Coba Lagi (Retry)** setelah mengembalikan status koneksi menjadi **Online**

Menguji state error: buka Developer Tools (F12), tab **Network**, pilih **Offline**, lalu muat ulang halaman. Setelah error tampil, kembalikan ke **No throttling** dan klik "Coba lagi".




