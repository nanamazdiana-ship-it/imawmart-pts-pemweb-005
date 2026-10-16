"use strict";

/* ==========================================================
   app.js - bagian yang berhubungan dengan halaman: fetch, DOM, event, form.
   Bergantung pada:
   - config.js : API_URL, NAMA_MIN_LENGTH, LOW_STOCK_LIMIT, STUDENT
   - logic.js  : fungsi murni (searchProducts, sortProducts, computeStats, validateNama, ...)
   Urutan pemuatan di index.html: config.js -> logic.js -> app.js.

   ALUR SINGKAT: init() -> loadData() -> fetch API -> simpan ke state -> render ke DOM.
   Setelah itu, setiap aksi pengguna (mengetik, memilih urutan, submit form)
   ditangani oleh event listener yang memanggil fungsi render lagi.
   ========================================================== */

/* ===== BAGIAN 1: STATE & ELEMEN DOM ===== */

// "state" adalah satu tempat untuk menyimpan data yang berubah-ubah selama aplikasi berjalan.
// Tampilan selalu digambar ulang dari state ini.
const state = {
  products: [],      // semua produk hasil dari API
  keyword: "",       // kata kunci pencarian yang sedang diketik
  sortMode: "default",
  lastLoaded: null,  // objek Date saat data terakhir berhasil dimuat (challenge C = 1)
};

// Mengambil elemen HTML sekali saja di awal lalu menyimpannya di objek "el",
// agar tidak perlu memanggil getElementById berulang-ulang di tiap fungsi.
// Setiap id di bawah harus sama persis dengan id di index.html.
const el = {
  loading: document.getElementById("loading"),
  errorBox: document.getElementById("error-box"),
  errorMessage: document.getElementById("error-message"),
  retryButton: document.getElementById("retry-button"),
  lastUpdated: document.getElementById("last-updated"),
  resultCount: document.getElementById("result-count"),
  productList: document.getElementById("product-list"),
  controlForm: document.getElementById("control-form"),
  searchInput: document.getElementById("search-input"),
  sortSelect: document.getElementById("sort-select"),
  statAverage: document.getElementById("stat-average"),
  statExpensive: document.getElementById("stat-expensive"),
  statExpensivePrice: document.getElementById("stat-expensive-price"),
  statCategories: document.getElementById("stat-categories"),
  requestForm: document.getElementById("request-form"),
  namaInput: document.getElementById("nama-input"),
  namaError: document.getElementById("nama-error"),
  kategoriSelect: document.getElementById("kategori-select"),
  kategoriError: document.getElementById("kategori-error"),
  catatanInput: document.getElementById("catatan-input"),
  formSuccess: document.getElementById("form-success"),
};

/* ===== BAGIAN 2: STATUS TAMPILAN (loading / error / sukses) =====
   Tiga keadaan yang diminta soal. Atribut "hidden" menyembunyikan/menampilkan elemen.
   aria-busy memberi tahu pembaca layar bahwa daftar sedang dimuat. */

// LOADING: tampilkan indikator memuat, sembunyikan kotak error.
function showLoading() {
  el.loading.hidden = false;
  el.errorBox.hidden = true;
  el.productList.setAttribute("aria-busy", "true");
}

// SUCCESS: sembunyikan indikator loading dan kotak error.
function showSuccess() {
  el.loading.hidden = true;
  el.errorBox.hidden = true;
  el.productList.setAttribute("aria-busy", "false");
}

// ERROR: tampilkan kotak error berisi pesan dan tombol "Coba lagi".
function showError(error) {
  el.loading.hidden = true;
  el.errorBox.hidden = false;
  el.errorMessage.textContent = describeError(error);
  el.productList.setAttribute("aria-busy", "false");
  el.resultCount.textContent = "";
}

// Mengubah error teknis menjadi pesan yang mudah dipahami pengguna.
// Jenis error dikenali dari: properti status (kita pasang sendiri untuk error HTTP),
// SyntaxError (JSON rusak), atau TypeError (fetch gagal karena jaringan).
function describeError(error) {
  if (error.status === 404) {
    return "Alamat API tidak ditemukan (HTTP 404). Periksa kembali API_URL.";
  }
  if (error.status >= 500) {
    return `Server API sedang bermasalah (HTTP ${error.status}). Coba lagi beberapa saat lagi.`;
  }
  if (error.status) {
    return `Permintaan ditolak oleh server (HTTP ${error.status}).`;
  }
  if (error instanceof SyntaxError) {
    // response.json() melempar SyntaxError jika isi respons bukan JSON yang valid
    return "Data dari server tidak dapat dibaca sebagai JSON.";
  }
  if (error instanceof TypeError) {
    // fetch() melempar TypeError jika permintaan tidak sampai ke server (misalnya internet putus)
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
  }
  return error.message;
}

/* ===== BAGIAN 3: FETCH DATA DARI REST API =====
   Fungsi ini dipanggil saat halaman dibuka dan saat tombol "Coba lagi" diklik. */

// "async" membuat fungsi bisa memakai "await" dan otomatis mengembalikan Promise.
async function loadData() {
  // try...catch: kode di dalam try dijalankan; jika ada yang melempar error (throw),
  // eksekusi langsung pindah ke blok catch tanpa membuat aplikasi macet.
  try {
    showLoading();

    // fetch() mengirim permintaan HTTP GET ke API_URL.
    // "await" menunggu sampai server menjawab, tanpa membekukan halaman.
    const response = await fetch(API_URL);

    // fetch() hanya "gagal" jika jaringan putus. Jika server menjawab 404 atau 500,
    // fetch() tetap dianggap berhasil. Karena itu kita periksa sendiri lewat response.ok
    // (true jika status 200-299). Jika tidak ok, kita lempar error buatan sendiri
    // dan menyimpan kode statusnya agar describeError() bisa memberi pesan yang tepat.
    if (!response.ok) {
      const httpError = new Error(`HTTP Error: ${response.status}`);
      httpError.status = response.status;
      throw httpError;
    }

    // response.json() membaca isi respons dan mengubah teks JSON menjadi objek JavaScript.
    // Ini juga asynchronous, jadi memakai await.
    const data = await response.json();

    // Pastikan bentuk datanya benar: harus ada properti "products" berupa array.
    if (!Array.isArray(data.products)) {
      throw new Error("Format data dari API tidak sesuai (properti products tidak ditemukan).");
    }

    // Jika array kosong, tidak ada yang bisa ditampilkan. Anggap sebagai kegagalan
    // supaya pengguna mendapat penjelasan, bukan halaman kosong.
    if (data.products.length === 0) {
      throw new Error("API tidak mengembalikan produk apa pun.");
    }

    // Simpan SEMUA produk ke state (tanpa penyaringan), catat waktu berhasil,
    // lalu gambar semua bagian tampilan.
    state.products = data.products;
    state.lastLoaded = new Date();
    showSuccess();
    renderLastLoaded();
    renderStats();
    renderCategoryOptions();
    renderProducts();
  } catch (error) {
    // Semua jenis kegagalan (internet putus, 404, 500, JSON rusak, format salah) berakhir di sini.
    showError(error);
  }
}

/* ===== BAGIAN 4: RENDER KE DOM =====
   DOM = representasi halaman HTML yang bisa diubah oleh JavaScript. */

// Fungsi bantu: membuat elemen, memberi class, dan mengisi teks sekaligus.
function createEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  // textContent memasukkan teks apa adanya (aman). innerHTML berisiko karena
  // HTML/script di dalam data ikut dijalankan.
  if (text !== undefined) node.textContent = text;
  return node;
}

// Mengubah SATU objek produk (JSON) menjadi SATU elemen <li> kartu yang terlihat di layar.
function createProductCard(product) {
  const item = createEl("li", "product-card");

  // Gambar: src dari thumbnail API; alt wajib untuk gambar bermakna (aksesibilitas).
  // loading="lazy" membuat gambar baru dimuat saat hampir terlihat (hemat kuota).
  const image = document.createElement("img");
  image.src = product.thumbnail;
  image.alt = `Foto produk ${product.title}`;
  image.loading = "lazy";
  image.width = 300;
  image.height = 300;

  // append() menempelkan beberapa elemen anak sekaligus ke dalam kartu.
  item.append(
    image,
    createEl("h3", "", product.title),
    createEl("span", "badge", prettyCategory(product.category)),
    createEl("p", "price", formatPrice(product.price)),
    createEl("p", "meta", `Rating: ${product.rating.toFixed(1)} dari 5`), // toFixed(1): 1 angka di belakang koma
    createEl("p", "meta", `Stok: ${product.stock}`)
  );

  // Beri tanda tambahan (teks, bukan hanya warna) jika stok menipis.
  if (product.stock < LOW_STOCK_LIMIT) {
    item.append(createEl("span", "badge badge-warning", "Stok menipis"));
  }
  return item;
}

// Menggambar daftar produk. Urutannya: cari -> urutkan -> tampilkan.
// Dipanggil setiap kali data, kata kunci, atau mode urutan berubah.
function renderProducts() {
  const found = searchProducts(state.products, state.keyword);
  const visible = sortProducts(found, state.sortMode);

  // Kosongkan daftar lama sebelum menggambar yang baru.
  el.productList.replaceChildren();

  if (visible.length === 0) {
    // Tidak ada hasil: beri tahu pengguna, jangan biarkan layar kosong.
    const empty = createEl("li", "meta", `Tidak ada produk yang cocok dengan "${state.keyword}".`);
    el.productList.append(empty);
  } else {
    // DocumentFragment = "wadah sementara" di memori. Semua kartu ditempel ke sini dulu,
    // lalu dimasukkan ke halaman sekali saja (lebih efisien daripada menempel satu per satu).
    const fragment = document.createDocumentFragment();
    visible.forEach((product) => fragment.append(createProductCard(product)));
    el.productList.append(fragment);
  }

  // Teks ini berada di area aria-live, jadi pembaca layar ikut membacakannya.
  el.resultCount.textContent = `Menampilkan ${visible.length} dari ${state.products.length} produk`;
}

// Menampilkan tiga hasil analisis data dari computeStats() (logic.js).
function renderStats() {
  const stats = computeStats(state.products);
  if (stats === null) return;
  el.statAverage.textContent = formatPrice(stats.averagePrice);
  el.statExpensive.textContent = stats.mostExpensive.title;
  el.statExpensivePrice.textContent = formatPrice(stats.mostExpensive.price);
  el.statCategories.textContent = `${stats.categoryCount} kategori`;
}

// CHALLENGE C = 1: tampilkan waktu terakhir data berhasil dimuat.
// Hanya dipanggil saat fetch berhasil, jadi kalau gagal, waktu lama tetap tampil.
function renderLastLoaded() {
  if (state.lastLoaded === null) return;
  // toLocaleString("id-ID") memformat tanggal dan jam dalam gaya Indonesia.
  const text = state.lastLoaded.toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "medium",
  });
  el.lastUpdated.textContent = `Terakhir berhasil dimuat: ${text}`;
}

// Mengisi pilihan kategori pada form dari data API (bukan diketik manual).
function renderCategoryOptions() {
  // Sisakan opsi pertama ("Pilih kategori..."), hapus sisanya, lalu isi ulang.
  // Ini mencegah opsi dobel saat tombol "Coba lagi" dipakai dan data dimuat ulang.
  while (el.kategoriSelect.options.length > 1) {
    el.kategoriSelect.remove(1);
  }
  getCategories(state.products).forEach((slug) => {
    // new Option(teks yang terlihat, nilai yang dikirim)
    el.kategoriSelect.add(new Option(prettyCategory(slug), slug));
  });
}

/* ===== BAGIAN 5: EVENT SEARCH & SORT (FITUR Y) =====
   Event = kejadian yang dilakukan pengguna. Fungsi di bawah dipasang sebagai
   "event listener" di init(), lalu otomatis dipanggil saat kejadiannya terjadi. */

// Event "input" terpicu SETIAP kali isi kolom berubah (tiap ketikan) -> inilah yang membuat
// pencarian terasa real-time tanpa perlu menekan Enter atau tombol cari.
function handleSearchInput(event) {
  state.keyword = event.target.value; // event.target = elemen yang memicu event (kolom pencarian)
  renderProducts();
}

// Event "change" pada <select> terpicu saat pengguna memilih opsi lain.
function handleSortChange(event) {
  state.sortMode = event.target.value;
  renderProducts();
}

/* ===== BAGIAN 6: FORM & VALIDASI (Z = 5) =====
   Validasi client-side: dicek di browser sebelum data diproses. */

// Menampilkan pesan error di bawah kolom. Pesan berupa TEKS (bukan hanya warna merah)
// dan aria-invalid memberi tahu pembaca layar bahwa kolom ini bermasalah.
function showFieldError(input, errorEl, message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  input.setAttribute("aria-invalid", "true");
}

// Menghapus pesan error saat kolom sudah benar.
function clearFieldError(input, errorEl) {
  errorEl.textContent = "";
  errorEl.hidden = true;
  input.removeAttribute("aria-invalid");
}

// Memeriksa kolom nama memakai validateNama() (logic.js), lalu menampilkan hasilnya.
// Mengembalikan true jika valid, false jika tidak.
function validateNamaField() {
  const result = validateNama(el.namaInput.value, NAMA_MIN_LENGTH);
  if (result.valid) {
    clearFieldError(el.namaInput, el.namaError);
  } else {
    showFieldError(el.namaInput, el.namaError, result.message);
  }
  return result.valid;
}

// Kategori wajib dipilih. Pesannya berbeda jika data belum berhasil dimuat
// (karena pilihan kategori berasal dari data API).
function validateKategoriField() {
  const hasCategory = el.kategoriSelect.value !== "";
  if (hasCategory) {
    clearFieldError(el.kategoriSelect, el.kategoriError);
    return true;
  }
  const message = state.products.length === 0
    ? "Kategori belum tersedia karena data belum berhasil dimuat. Muat ulang data terlebih dahulu."
    : "Silakan pilih satu kategori.";
  showFieldError(el.kategoriSelect, el.kategoriError, message);
  return false;
}

// Dipanggil saat form disubmit (tombol "Kirim permintaan" ditekan atau Enter).
function handleFormSubmit(event) {
  event.preventDefault(); // cegah browser memuat ulang halaman (perilaku bawaan form)
  el.formSuccess.hidden = true; // sembunyikan pesan sukses lama

  // Jalankan KEDUA validasi lebih dulu (disimpan di variabel), bukan memakai "&&",
  // supaya kalau dua-duanya salah, kedua pesan error tampil sekaligus.
  const namaOk = validateNamaField();
  const kategoriOk = validateKategoriField();

  // Data tidak valid TIDAK boleh diproses: berhenti di sini dan arahkan fokus keyboard
  // ke kolom yang bermasalah supaya pengguna bisa langsung memperbaikinya.
  if (!namaOk) {
    el.namaInput.focus();
    return;
  }
  if (!kategoriOk) {
    el.kategoriSelect.focus();
    return;
  }

  // Semua valid -> tampilkan informasi berhasil. Data hanya disimulasikan, tidak dikirim ke server.
  const nama = el.namaInput.value.trim();
  const kategori = prettyCategory(el.kategoriSelect.value);
  el.formSuccess.textContent = `Terima kasih, ${nama}. Permintaan untuk kategori ${kategori} valid dan siap diproses (simulasi, belum dikirim ke server).`;
  el.formSuccess.hidden = false;
  el.requestForm.reset(); // kosongkan form untuk isian berikutnya
}

/* ===== BAGIAN 7: INISIALISASI =====
   Titik awal aplikasi: dipanggil sekali di baris paling bawah. */

// Mengisi nama, NPM, kelas ke semua elemen yang punya atribut data-student (header dan footer),
// serta tahun di footer. dataset.student membaca nilai atribut data-student di HTML.
function fillIdentity() {
  document.querySelectorAll("[data-student]").forEach((node) => {
    node.textContent = STUDENT[node.dataset.student];
  });
  document.getElementById("year").textContent = new Date().getFullYear();
}

function init() {
  fillIdentity();

  // Memasang event listener: "jika kejadian X terjadi pada elemen Y, jalankan fungsi Z".
  el.searchInput.addEventListener("input", handleSearchInput);
  el.sortSelect.addEventListener("change", handleSortChange);
  // Form pencarian tidak perlu dikirim ke mana-mana, jadi submit-nya dibatalkan
  // (supaya menekan Enter di kolom cari tidak memuat ulang halaman).
  el.controlForm.addEventListener("submit", (event) => event.preventDefault());

  el.requestForm.addEventListener("submit", handleFormSubmit);
  el.namaInput.addEventListener("input", () => {
    // Setelah pernah salah, cek ulang saat mengetik agar pesan hilang begitu isiannya benar.
    if (el.namaInput.getAttribute("aria-invalid") === "true") validateNamaField();
  });
  el.kategoriSelect.addEventListener("change", () => {
    if (el.kategoriSelect.getAttribute("aria-invalid") === "true") validateKategoriField();
  });

  // CHALLENGE C = 1: tombol Retry cukup memanggil loadData() lagi (alur fetch diulang dari awal).
  el.retryButton.addEventListener("click", loadData);

  // Langkah terakhir: mulai mengambil data dari API.
  loadData();
}

init();
