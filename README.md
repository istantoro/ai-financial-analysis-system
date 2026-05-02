# AI-Powered Executive Financial Dashboard

Dashboard keuangan eksekutif modern yang mengintegrasikan data real-time dari database PostgreSQL (Supabase) dengan kecerdasan buatan (OpenAI) untuk memberikan analisis mendalam secara instan.

## 🚀 Fitur Unggulan

- **Executive Summary P&L**: Visualisasi performa pendapatan, laba usaha, dan margin secara YTD.
- **Dynamic Drilldown**: Kemampuan untuk membedah data dari level Ringkasan (Lv 1) ke Segmen (Lv 2) hingga ke level Komponen/COGS terkecil (Lv 3).
- **AI Financial Assistant**: Chatbot pintar yang membaca langsung database untuk menjawab pertanyaan seperti *"Kenapa pendapatan turun bulan ini?"* atau *"Berikan proyeksi laba akhir tahun"*.
- **Analisis Varians Otomatis**: Perhitungan otomatis YoY (Year-over-Year) dan Realisasi RKA (Budget vs Actual).
- **Interactive Reports**: Tab Neraca, Rasio Keuangan, Tren, dan Simulasi yang sepenuhnya dinamis berdasarkan filter periode.

## 🛠 Tech Stack

- **Frontend**: [Next.js 15+](https://nextjs.org/), React, Tailwind CSS, Lucide Icons.
- **Backend/API**: Next.js API Routes (Serverless).
- **Database Layer**: [Drizzle ORM](https://orm.drizzle.team/), PostgreSQL (Supabase).
- **AI Engine**: OpenAI GPT-4o (Senior Financial Analyst Prompting).
- **State Management**: [Zustand](https://github.com/pmndrs/zustand).

## 📂 Struktur Project (Monorepo)

```text
FINAL PROJECT - DASHBOARD/
├── frontend/           # Aplikasi Utama (UI & API Routes)
│   ├── src/app/        # Next.js App Router
│   ├── src/components/ # Reusable UI Components
│   └── src/store/      # Global State Management
├── backend/            # Database Layer & Scripts
│   ├── src/db/         # Schema & DB Connection
│   └── src/scripts/    # Seeding scripts dari CSV
├── files/              # Master Data (CSV) & Dokumentasi Schema
├── package.json        # Root package untuk menjalankan dev mode
└── .env                # API Keys & DB Connection String
```

## ⚠️ Penting: Koneksi API & Database

Aplikasi ini bersifat **Full-Stack**. Agar dashboard dapat menampilkan data dan fitur Chat AI dapat merespon, Anda **WAJIB** menghubungkan database Supabase dan API OpenAI. Tanpa langkah ini, dashboard akan tampil kosong (Error 500) dan fitur AI tidak akan berjalan.

## 📋 Prasyarat

- Node.js v18 atau lebih baru.
- Akun **Supabase** (untuk database PostgreSQL).
- **OpenAI API Key** (untuk mesin analisis GPT-4o).

## ⚙️ Instalasi & Cara Menjalankan

1. **Clone Repository**
   ```bash
   git clone https://github.com/istantoro/ai-financial-analysis-system.git
   cd "FINAL PROJECT - DASHBOARD"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (.env)**
   Aplikasi tidak akan terkoneksi ke database/AI tanpa file `.env`. 
   
   Buat file bernama `.env` di folder root project (atau copy dari `frontend/.env.example`) dan isi dengan key Anda:
   ```env
   # Database: Ambil dari Supabase Project Settings > Database
   DATABASE_URL=postgresql://postgres:[password]@aws-0...

   # AI: Ambil dari OpenAI Dashboard
   OPENAI_API_KEY=sk-...

   # Public Keys (Optional for client features)
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. **Jalankan Aplikasi**
   Cukup jalankan satu perintah dari folder root:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

## 📊 Pengelolaan Database

Untuk melakukan push schema atau melihat database via UI:
- **Push Schema**: `npm run db:push`
- **DB Studio**: `npm run db:studio`

---
*Developed as a Final Project for AI & Automation System.*
