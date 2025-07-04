# 📚 Sistem Peminjaman Buku Digital

Aplikasi ini adalah sistem manajemen peminjaman buku perpustakaan berbasis web yang dibangun menggunakan:

- **Frontend:** Vue 3 + PrimeVue + Pinia (Template Sakai)
- **Backend:** Express.js dengan autentikasi JWT
- **Database:** PostgreSQL
- **Environment:** Support Docker dan Manual

---

## 👤 Akun Default

| Role      | Username     | Password |
|-----------|--------------|----------|
| Admin     | `admin`      | `123456` |
| Mahasiswa | `mahasiswa`  | `123456` |

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

## 🐳 Jalankan dengan Docker

```bash
git clone https://github.com/Pucuks/management-buku.git
cd management-buku
docker-compose up --build
```

Akses:
- Frontend: http://localhost:5173  
- Backend: http://localhost:3000/api  

---

## ⚙️ Jalankan Manual (Tanpa Docker)

```bash
git clone https://github.com/Pucuks/management-buku.git
```

### 1. Jalankan Backend

```bash
cd backend
npm install
node app.js
```

### 2. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Siapkan Database PostgreSQL

- Install PostgreSQL
- Buat database dengan nama `management_buku`
- Upload file SQL yang tersedia
---

Aplikasi siap digunakan.
