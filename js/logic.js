"use strict";

/* ==========================================================
   logic.js - fungsi murni (pure function)
   "Murni" artinya: hasilnya hanya bergantung pada input, tidak menyentuh halaman (DOM),
   dan tidak mengubah data aslinya. Pola yang dipakai: input -> proses -> output.
   Manfaatnya: mudah diuji dan mudah dijelaskan satu per satu.
   ========================================================== */

// Mengubah angka menjadi format mata uang dolar.
// Contoh: 9.99 -> "$9.99". Harga dari DummyJSON memang dalam USD, jadi tidak dikonversi.
// Intl.NumberFormat adalah fitur bawaan JavaScript untuk memformat angka.
function formatPrice(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

// Mengubah nama kategori dari API (huruf kecil, dipisah tanda minus) menjadi teks yang enak dibaca.
// Contoh: "skin-care" -> "Skin Care".
// split("-") memecah teks jadi array, map() mengubah huruf pertama tiap kata jadi kapital,
// join(" ") menyatukan lagi dengan spasi.
function prettyCategory(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// FITUR Y (bagian 1): pencarian.
// Input : array produk dan kata kunci yang diketik pengguna.
// Output: array produk yang nama, kategori, atau mereknya mengandung kata kunci.
// filter() membuat array baru berisi elemen yang lolos syarat (bernilai true);
// includes() mengecek apakah sebuah teks mengandung potongan teks lain.
function searchProducts(products, keyword) {
  // trim() membuang spasi di awal/akhir, toLowerCase() membuat pencarian tidak peka huruf besar-kecil.
  const query = keyword.trim().toLowerCase();

  // Kolom pencarian kosong -> tampilkan semua produk.
  if (query === "") {
    return products;
  }

  return products.filter((product) => {
    // Gabungkan nama, kategori, dan merek jadi satu teks agar dicari sekaligus.
    // "product.brand || ''" dipakai karena sebagian produk tidak punya merek (nilainya undefined).
    const searchable = `${product.title} ${product.category} ${product.brand || ""}`.toLowerCase();
    return searchable.includes(query);
  });
}

// FITUR Y (bagian 2): pengurutan.
// Input : array produk dan mode urutan yang dipilih (nilai dari <select>).
// Output: array BARU yang sudah terurut.
function sortProducts(products, mode) {
  // sort() mengubah array aslinya, jadi kita salin dulu dengan spread operator [...products]
  // supaya data asli di state tidak ikut berubah.
  const copy = [...products];

  // Fungsi pembanding sort(): hasil negatif -> a di depan b, positif -> b di depan a.
  switch (mode) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price); // termurah dulu
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price); // termahal dulu
    case "title-asc":
      // localeCompare membandingkan teks sesuai aturan abjad
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    case "rating-desc":
      return copy.sort((a, b) => b.rating - a.rating); // rating tertinggi dulu
    default:
      return copy; // "default": urutan bawaan API
  }
}

// ANALISIS DATA: informasi hasil olahan yang dihitung JavaScript dari data API (bukan diketik manual).
// Input : array produk.
// Output: objek berisi rata-rata harga, produk termahal, dan jumlah kategori (atau null jika data kosong).
function computeStats(products) {
  // Jika tidak ada data, tidak ada yang bisa dihitung (mencegah pembagian dengan nol).
  if (products.length === 0) {
    return null;
  }

  // reduce() "melipat" array jadi satu nilai. Di sini: menjumlahkan semua harga, mulai dari 0.
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);

  // reduce() lagi: simpan produk dengan harga tertinggi sejauh ini (max), ganti jika ada yang lebih mahal.
  const mostExpensive = products.reduce((max, product) => (product.price > max.price ? product : max));

  // map() mengambil kategori tiap produk; Set membuang duplikat; size = jumlah kategori unik.
  const categories = new Set(products.map((product) => product.category));

  return {
    averagePrice: totalPrice / products.length, // rata-rata = total / jumlah produk
    mostExpensive: mostExpensive,
    categoryCount: categories.size,
  };
}

// Daftar kategori unik dan terurut abjad; dipakai untuk mengisi pilihan pada form.
function getCategories(products) {
  return [...new Set(products.map((product) => product.category))].sort();
}

// VALIDASI Z = 5: nama miNPMal 5 karakter.
// Input : teks nama dan batas miNPMal karakter.
// Output: objek { valid: true/false, message: "pesan untuk pengguna" }.
function validateNama(value, minLength) {
  // Spasi di awal/akhir tidak dihitung, supaya "  Bud  " tidak lolos sebagai 5 karakter.
  const nama = value.trim();

  if (nama === "") {
    return { valid: false, message: "Nama wajib diisi." };
  }
  if (nama.length < minLength) {
    return {
      valid: false,
      message: `Nama miNPMal ${minLength} karakter. Saat ini baru ${nama.length} karakter.`,
    };
  }
  return { valid: true, message: "" };
}

// Blok ini hanya aktif jika file dijalankan di Node.js (untuk pengujian).
// Di browser, "module" tidak ada sehingga blok ini otomatis dilewati.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    formatPrice,
    prettyCategory,
    searchProducts,
    sortProducts,
    computeStats,
    getCategories,
    validateNama,
  };
}
