"use strict";

/* config.js - pengaturan project (singkat) */

// ===== GANTI IDENTITAS DI SINI SAJA =====
const STUDENT = {
  nama: "Erma Sari",
  NPM: "2440304005",
  kelas: "Teknik Komputer",
};
// =========================================

// Alamat REST API produk. limit=0 artinya ambil semua produk (194).
const API_URL = "https://dummyjson.com/products?limit=0";

// Nama miNPMal 5 karakter (varian Z = 5).
const NAMA_MIN_LENGTH = 5;

// Stok di bawah angka ini diberi tanda "Stok menipis".
const LOW_STOCK_LIMIT = 10;

// Varian NPM 005: X=0 Products, Y=0 search + sort, Z=5 nama min. 5 karakter, C=1 tombol Retry + waktu terakhir dimuat.
