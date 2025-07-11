# 📚 Sistem Peminjaman Buku Digital

Aplikasi ini adalah sistem manajemen peminjaman buku perpustakaan berbasis web yang dibangun menggunakan:

- **Frontend:** Vue 3 + PrimeVue + Pinia (Template Sakai)
- **Backend:** Express.js dengan autentikasi JWT
- **Database:** PostgreSQL
- **Environment:** Support Docker dan Manual

---

## 👤 Akun Default

| Role     | Username    | Password |
|----------|-------------|----------|
| Admin    | `admin`     | `123456` |
| Mahasiswa| `mahasiswa` | `123456` |

---

## 📋 Fitur Utama

- Master Buku
- Master Mahasiswa
- Rak/Inventory Stok Buku
- Transaksi Peminjaman (lebih dari 1 buku per transaksi)
- History/Report Peminjaman dengan filter:
  - NIM, Nama Mahasiswa, ID Buku, Nama Buku
  - Tanggal Pinjam, Tanggal Kembali, Lama Pinjam
- Validasi Transaksi:
  - Buku tersedia
  - Mahasiswa aktif
  - Maksimal pinjam 2 minggu

---

## 🛠 Teknologi

- Vue 3 + PrimeVue + Pinia
- Express.js + JWT
- PostgreSQL
- Docker (opsional)

---

## 🐳 Jalankan dengan Docker (Otomatis)

1. Clone repo:
```bash
git clone https://github.com/username/nama-proyek.git
cd nama-proyek
