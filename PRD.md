# PRD — AI-Powered Financial Performance Dashboard

> **Tujuan dokumen ini:** Panduan lengkap untuk vibe coding. Setiap bagian ditulis agar AI coding agent (dan developer) bisa langsung generate kode yang rapi, konsisten, dan mudah di-scale. Baca seluruh dokumen sebelum menulis satu baris kode.

---

## Daftar Isi

1. [Overview Produk](#1-overview-produk)
2. [Tech Stack & Versi](#2-tech-stack--versi)
3. [Struktur Proyek](#3-struktur-proyek)
4. [Design System & Tokens](#4-design-system--tokens)
5. [Database Schema](#5-database-schema)
6. [Tipe Data & Kontrak API](#6-tipe-data--kontrak-api)
7. [API Routes](#7-api-routes)
8. [Fitur & Spesifikasi Komponen](#8-fitur--spesifikasi-komponen)
9. [State Management](#9-state-management)
10. [LLM Integration](#10-llm-integration)
11. [Konvensi Kode](#11-konvensi-kode)
12. [Roadmap Fase](#12-roadmap-fase)

---

## 1. Overview Produk

### Deskripsi Singkat

Dashboard monitoring kinerja keuangan eksekutif untuk perusahaan jasa multi-segmen. Menggantikan pelaporan manual berbasis spreadsheet dengan sistem analitik terpusat yang dapat di-query melalui bahasa natural via LLM.

### Segmen Bisnis yang Didukung

```
MPO - TAD | MPO - RAB | BPO | KPO - DIKLAT | KPO - TRAINING
```

### Kapabilitas Utama

| Kapabilitas | Deskripsi |
|---|---|
| Dashboard YTD | Monitoring realisasi vs RKAP per periode |
| Drill Down 3 Level | Total → Segmen → Komponen biaya/pendapatan |
| Neraca Hierarki | Posisi aset/pasiva dengan expand/collapse |
| 7 Rasio Keuangan | Real-time dengan status OK/Perhatian/Risiko |
| Chat LLM-to-SQL | Query data via bahasa natural |
| Generate Laporan | Laporan manajemen otomatis via LLM (PDF/HTML) |
| Simulasi Sensitivitas | Skenario perubahan pendapatan per segmen |
| Upload Workbook | Import Excel sebagai sumber data aktif |

---

## 2. Tech Stack & Versi

### Aturan Utama

> Jangan menambah library di luar daftar ini tanpa alasan yang jelas. Setiap tambahan dependency harus didokumentasikan di sini terlebih dahulu.

```json
{
  "framework":     "next@15 (App Router)",
  "runtime":       "react@19",
  "language":      "typescript@5",
  "styling":       "tailwindcss@4",
  "ui":            "shadcn/ui (Radix primitives)",
  "icons":         "lucide-react",
  "charts":        "chart.js + react-chartjs-2",
  "orm":           "drizzle-orm",
  "database":      "mysql2 (TiDB compatible)",
  "llm":           "@anthropic-ai/sdk",
  "excel":         "xlsx",
  "export":        "jspdf + html2canvas",
  "toast":         "sonner",
  "validation":    "zod",
  "env":           "@t3-oss/env-nextjs"
}
```

### Font

```css
/* Wajib load via next/font atau Google Fonts */
font-ui:     "IBM Plex Sans"   /* semua teks UI */
font-number: "IBM Plex Mono"   /* semua angka keuangan */
```

---

## 3. Struktur Proyek

> Ikuti struktur ini dengan ketat. Jangan membuat folder di luar konvensi ini.

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Shell autentikasi + header
│   │   └── page.tsx             # Entry point dashboard
│   ├── api/
│   │   ├── dashboard/
│   │   │   ├── route.ts         # GET bootstrap data
│   │   │   └── workbook/
│   │   │       └── route.ts     # POST upload workbook
│   │   ├── drilldown/
│   │   │   └── route.ts         # GET/POST drilldown payload
│   │   ├── chat/
│   │   │   └── route.ts         # POST LLM chat
│   │   └── report/
│   │       └── route.ts         # POST generate laporan
│   ├── globals.css
│   └── layout.tsx               # Root layout (font, provider)
│
├── components/
│   ├── dashboard/
│   │   ├── DashboardApp.tsx     # Root orchestrator
│   │   ├── Header.tsx
│   │   ├── AnomalyBanner.tsx
│   │   ├── KpiCards.tsx
│   │   ├── MainTabs.tsx
│   │   └── RightPanel.tsx
│   ├── tabs/
│   │   ├── TabRingkasan.tsx
│   │   ├── TabNeraca.tsx
│   │   ├── TabRasio.tsx
│   │   ├── TabTren.tsx
│   │   └── TabSimulasi.tsx
│   ├── drilldown/
│   │   ├── DrilldownModal.tsx
│   │   ├── DrilldownTable.tsx
│   │   └── DrilldownCharts.tsx
│   ├── chat/
│   │   ├── ChatPanel.tsx
│   │   └── ChatMessage.tsx
│   ├── charts/
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── DoughnutChart.tsx
│   │   ├── WaterfallChart.tsx
│   │   └── SparklineBar.tsx
│   └── ui/                      # shadcn components (auto-generated)
│
├── lib/
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema definitions
│   │   ├── index.ts             # DB connection instance
│   │   └── queries/
│   │       ├── financial.ts
│   │       ├── neraca.ts
│   │       ├── components.ts
│   │       └── periods.ts
│   ├── ratios/
│   │   ├── compute.ts           # Kalkulasi semua rasio
│   │   ├── schema.ts            # Tipe rasio
│   │   └── constants.ts         # Threshold OK/Perhatian/Risiko
│   ├── llm/
│   │   ├── client.ts            # Anthropic SDK instance
│   │   ├── chat.ts              # Chat LLM-to-SQL
│   │   ├── report.ts            # Generate laporan
│   │   └── prompts/
│   │       ├── system-chat.ts
│   │       └── system-report.ts
│   ├── workbook/
│   │   ├── parser.ts            # Excel parser
│   │   ├── importer.ts          # Workbook → DB
│   │   └── validator.ts         # Sheet validation
│   ├── formatters.ts            # Format angka, Rupiah, persen
│   ├── compute.ts               # computeAll() — kalkulasi dashboard
│   └── utils.ts                 # Helper umum (cn, safeDivide, dll)
│
├── hooks/
│   ├── useDashboard.ts          # Global dashboard state
│   ├── usePeriod.ts             # Periode aktif
│   └── useDrilldown.ts          # Drilldown state
│
├── stores/
│   └── dashboardStore.ts        # Zustand store (jika diperlukan)
│
├── types/
│   ├── dashboard.ts             # Semua interface/type utama
│   ├── api.ts                   # Request/response API
│   └── llm.ts                   # LLM chat types
│
└── env.ts                       # Validated env vars (@t3-oss)
```

---

## 4. Design System & Tokens

### CSS Variables (`globals.css`)

```css
:root {
  /* Primary */
  --color-navy:          #000924;
  --color-navy-container:#0f2044;
  --color-blue:          #1d4ed8;
  --color-blue-container:#4069f2;

  /* Surface */
  --color-surface:           #fbf8fc;
  --color-surface-low:       #f5f3f6;
  --color-surface-container: #efedf1;
  --color-surface-high:      #e9e7eb;
  --color-surface-highest:   #e4e2e5;
  --color-white:             #ffffff;

  /* Text */
  --color-ink:           #1b1b1e;
  --color-muted:         #45464e;
  --color-outline:       #75777f;
  --color-line:          #c5c6cf;

  /* Semantic */
  --color-green:         #065f46;
  --color-green-bg:      #f0fdf4;
  --color-amber:         #92400e;
  --color-amber-bg:      #fffbeb;
  --color-red:           #ba1a1a;
  --color-red-bg:        #ffdad6;

  /* Spacing */
  --spacing-unit:        4px;
  --container-padding:   24px;
  --card-gap:            16px;
  --section-margin:      32px;
  --control-sm:          28px;
  --control-md:          36px;

  /* Border */
  --radius-sm:    0.125rem;   /* 2px  */
  --radius:       0.25rem;    /* 4px  — default */
  --radius-md:    0.375rem;   /* 6px  */
  --radius-lg:    0.5rem;     /* 8px  — modal */
  --radius-xl:    0.75rem;    /* 12px */
}
```

### Tailwind Config (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy:    "var(--color-navy)",
        navy2:   "var(--color-navy-container)",
        blue:    "var(--color-blue)",
        blue2:   "var(--color-blue-container)",
        surface: "var(--color-surface)",
        "surface-low": "var(--color-surface-low)",
        "surface-container": "var(--color-surface-container)",
        ink:     "var(--color-ink)",
        muted:   "var(--color-muted)",
        line:    "var(--color-line)",
        outline: "var(--color-outline)",
        success: "var(--color-green)",
        warning: "var(--color-amber)",
        danger:  "var(--color-red)",
      },
      fontFamily: {
        ui:   ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        "h1":    ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "h2":    ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body":  ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "xs":    ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "data":  ["14px", { lineHeight: "20px", fontWeight: "500", letterSpacing: "-0.02em" }],
      },
    },
  },
} satisfies Config;
```

### Konvensi Penggunaan Warna

| Elemen | Class Tailwind |
|---|---|
| Background halaman | `bg-surface-container` |
| Card / panel | `bg-white border border-line` |
| Header | `bg-gradient-to-br from-navy to-blue` |
| Text utama | `text-ink` |
| Text sekunder | `text-muted` |
| Badge OK | `bg-green-bg text-success` |
| Badge Perhatian | `bg-amber-bg text-warning` |
| Badge Risiko | `bg-red-bg text-danger` |
| Angka keuangan | `font-mono tabular-nums` |

### Status Achievement

```ts
// lib/ratios/constants.ts
export const ACHIEVEMENT_STATUS = {
  OK:        { min: 100, label: "OK",        className: "bg-green-bg text-success" },
  PERHATIAN: { min: 85,  label: "Perhatian", className: "bg-amber-bg text-warning" },
  RISIKO:    { min: 0,   label: "Risiko",    className: "bg-red-bg text-danger"   },
} as const;

export function getAchievementStatus(achievement: number) {
  if (achievement >= 100) return ACHIEVEMENT_STATUS.OK;
  if (achievement >= 85)  return ACHIEVEMENT_STATUS.PERHATIAN;
  return ACHIEVEMENT_STATUS.RISIKO;
}
```

---

## 5. Database Schema

```ts
// lib/db/schema.ts — Drizzle ORM
import { mysqlTable, varchar, decimal, int, json, timestamp } from "drizzle-orm/mysql-core";

export const dashboardSnapshots = mysqlTable("dashboard_snapshots", {
  id:          varchar("id", { length: 100 }).primaryKey(),
  name:        varchar("name", { length: 255 }).notNull(),
  sourceFile:  varchar("source_file", { length: 255 }),
  createdAt:   timestamp("created_at").defaultNow(),
});

export const periods = mysqlTable("periods", {
  id:         varchar("id", { length: 20 }).primaryKey(),  // "2025-03" atau "2025"
  periodType: varchar("period_type", { length: 10 }).notNull(), // "monthly" | "annual"
  year:       int("year").notNull(),
  month:      int("month"),                                // null untuk annual
  label:      varchar("label", { length: 50 }),
});

export const financialMetrics = mysqlTable("financial_metrics", {
  id:          varchar("id", { length: 100 }).primaryKey(),
  snapshotId:  varchar("snapshot_id", { length: 100 }).notNull(),
  period:      varchar("period", { length: 20 }).notNull(),
  periodType:  varchar("period_type", { length: 10 }).notNull(),
  year:        int("year").notNull(),
  month:       int("month"),
  segment:     varchar("segment", { length: 100 }).notNull(),
  category:    varchar("category", { length: 100 }).notNull(),
  // category values: pendapatan | beban_operasional | laba_usaha |
  //                  pendapatan_non_operasional | beban_non_operasional | laba_sebelum_pajak
  actual:      decimal("actual", { precision: 20, scale: 2 }),
  target:      decimal("target", { precision: 20, scale: 2 }),
});

export const componentMetrics = mysqlTable("component_metrics", {
  id:            varchar("id", { length: 100 }).primaryKey(),
  snapshotId:    varchar("snapshot_id", { length: 100 }).notNull(),
  period:        varchar("period", { length: 20 }).notNull(),
  periodType:    varchar("period_type", { length: 10 }).notNull(),
  year:          int("year").notNull(),
  month:         int("month"),
  segment:       varchar("segment", { length: 100 }).notNull(),
  componentName: varchar("component_name", { length: 255 }).notNull(),
  category:      varchar("category", { length: 100 }).notNull(),
  // category values: pendapatan | beban
  actual:        decimal("actual", { precision: 20, scale: 2 }),
  target:        decimal("target", { precision: 20, scale: 2 }),
});

export const neracaMetrics = mysqlTable("neraca_metrics", {
  id:           varchar("id", { length: 100 }).primaryKey(),
  snapshotId:   varchar("snapshot_id", { length: 100 }).notNull(),
  period:       varchar("period", { length: 20 }).notNull(),
  periodType:   varchar("period_type", { length: 10 }).notNull(),
  year:         int("year").notNull(),
  month:        int("month"),
  accountCode:  varchar("account_code", { length: 50 }).notNull(),
  accountName:  varchar("account_name", { length: 255 }).notNull(),
  accountGroup: varchar("account_group", { length: 100 }),
  actual:       decimal("actual", { precision: 20, scale: 2 }),
  target:       decimal("target", { precision: 20, scale: 2 }),
});
```

### Index yang Wajib Dibuat

```sql
CREATE INDEX idx_fm_snapshot_period    ON financial_metrics  (snapshot_id, period);
CREATE INDEX idx_fm_snapshot_segment   ON financial_metrics  (snapshot_id, segment, category);
CREATE INDEX idx_cm_snapshot_period    ON component_metrics  (snapshot_id, period);
CREATE INDEX idx_cm_segment_category  ON component_metrics  (snapshot_id, segment, category);
CREATE INDEX idx_nr_snapshot_period    ON neraca_metrics     (snapshot_id, period);
CREATE INDEX idx_nr_account_code      ON neraca_metrics     (snapshot_id, account_code);
```

---

## 6. Tipe Data & Kontrak API

```ts
// types/dashboard.ts

export type PeriodType = "monthly" | "annual";
export type Category   = "pendapatan" | "beban_operasional" | "laba_usaha" |
                         "pendapatan_non_operasional" | "beban_non_operasional" | "laba_sebelum_pajak";
export type Segment    = "MPO - TAD" | "MPO - RAB" | "BPO" | "KPO - DIKLAT" | "KPO - TRAINING";
export type Status     = "OK" | "Perhatian" | "Risiko";

export interface Period {
  id:         string;
  periodType: PeriodType;
  year:       number;
  month:      number | null;
  label:      string;
}

export interface FinancialMetric {
  id:         string;
  snapshotId: string;
  period:     string;
  periodType: PeriodType;
  year:       number;
  month:      number | null;
  segment:    string;
  category:   Category;
  actual:     number;
  target:     number;
}

export interface ComponentMetric {
  id:            string;
  snapshotId:    string;
  period:        string;
  segment:       string;
  componentName: string;
  category:      "pendapatan" | "beban";
  actual:        number;
  target:        number;
}

export interface NeracaMetric {
  id:           string;
  snapshotId:   string;
  period:       string;
  accountCode:  string;
  accountName:  string;
  accountGroup: string;
  actual:       number;
  target:       number;
}

// ── Computed types ─────────────────────────────────────────────────────────

export interface KpiCard {
  label:       string;
  ytdActual:   number;
  ytdTarget:   number;
  achievement: number;
  status:      Status;
  sparkline:   number[];   // nilai 6 bulan terakhir untuk mini bar
  momDelta:    number;
}

export interface FinancialSummaryRow {
  label:        string;
  category:     Category | "laba_operasional";
  lastMonth:    number;
  currentMonth: number;
  ytd:          number;
  contribution: number;   // % terhadap total pendapatan
  momDelta:     number;
  rkaYtd:       number;
  rkaTahunan:   number;
  achievement:  number;
  status:       Status;
  isSubtotal:   boolean;
}

export interface RatioResult {
  key:         string;
  label:       string;
  unit:        "x" | "%" | "hari";
  isInverse:   boolean;
  current:     number;
  ytd:         number;
  target:      number;
  achievement: number;
  status:      Status;
  delta:       number;
  trend:       number[];  // 6 titik untuk sparkline
}

export interface DrilldownPayload {
  title:       string;
  level:       1 | 2 | 3;
  period:      string;
  rows:        DrilldownRow[];
}

export interface DrilldownRow {
  label:       string;
  actual:      number;
  target:      number;
  achievement: number;
  contribution:number;
  status:      Status;
}

// ── Dashboard state ────────────────────────────────────────────────────────

export interface DashboardState {
  meta: {
    snapshotId:  string;
    sourceFile:  string;
    loadedAt:    string;
    isLoading:   boolean;
    error:       string | null;
  };
  dim: {
    periods:     Period[];
    activePeriod:string;
  };
  computed: {
    kpiCards:         KpiCard[];
    summaryRows:      FinancialSummaryRow[];
    ratios:           RatioResult[];
    trendSeries:      TrendSeries;
    neracaTree:       NeracaNode[];
    anomalies:        Anomaly[];
  };
  ui: {
    activeTab:        "ringkasan" | "neraca" | "rasio" | "tren" | "simulasi";
    drilldown:        DrilldownState | null;
    chatOpen:         boolean;
    simulasiInputs:   Record<Segment, number>;
  };
}
```

---

## 7. API Routes

### `GET /api/dashboard`

Mengembalikan bootstrap data untuk render pertama.

**Response:**
```ts
{
  snapshotId:  string;
  periods:     Period[];
  activePeriod:string;          // default: periode terbaru
  financials:  FinancialMetric[];
  neraca:      NeracaMetric[];
}
```

---

### `POST /api/dashboard/workbook`

Upload dan import workbook Excel baru.

**Request:** `multipart/form-data` — field `file`

**Validasi sheet yang wajib ada:**
```
MASTERFILE NERACA | MASTERFILE COA PL | RKA NERACA | RKA PL | RKA BIAYA OPS
```

**Response:**
```ts
{ success: boolean; snapshotId: string; periodsImported: number; message: string; }
```

---

### `GET /api/drilldown`

**Query params:** `period`, `category`, `segment?`

Mengembalikan drilldown rows sesuai level yang diminta.

**Response:** `DrilldownPayload`

---

### `POST /api/chat`

**Request:**
```ts
{ messages: { role: "user" | "assistant"; content: string }[]; snapshotId: string; period: string; }
```

**Response:** `ReadableStream` (streaming SSE)

---

### `POST /api/report`

Generate laporan manajemen dari data snapshot aktif.

**Request:**
```ts
{ snapshotId: string; period: string; format: "pdf" | "html"; }
```

**Response:** `application/pdf` atau `text/html`

---

### 8.1 Header

```
Komponen: src/components/dashboard/Header.tsx

Visual:
- Full-width, position: fixed, z-50
- Background: linear-gradient(135deg, #000924, #1d4ed8)
- Height: 56px
- Padding: 0 24px

Konten kiri:
- Logo/nama aplikasi (text putih, font-ui, font-semibold)
- Nama snapshot aktif (text-white/60, font-xs)

Konten kanan (gap-2):
- Dropdown Periode (Bulan dan Tahun)
- Button Generate Report (icon: FileText)
- Button Refresh (icon: RefreshCw)
- Button Export (icon: Download)
- Button Logout (icon: LogOut)
```

### 8.2 Layout Utama & Sidebar Tabs

```
Komponen: src/components/dashboard/MainTabs.tsx

Visual:
- Layout vertikal (Sidebar Kiri & Konten Kanan).
- Sidebar lebar ~200px (md:w-[200px]).
- Tab menu: Ringkasan P&L, Neraca, Rasio, Tren, Simulasi, Chat dengan Data.
- Tab aktif: `bg-navy/5 text-blue font-semibold`.
- Konten tab: dibungkus card putih (`bg-white border border-line rounded-lg p-4 shadow-sm`).
```

### 8.3 Tabel Ringkasan P&L

```
Komponen: src/components/tabs/TabRingkasan.tsx

Wrapper: overflow-x-auto
Table: min-w-[1360px] w-full table-fixed border-collapse

Header columns:
  Kategori | YTD [Bulan] [Tahun-1] | Des [Tahun-1] | YTD [Bulan] [Tahun] | YoY | Realisasi RKA YTD | Realisasi RKA Tahunan | Detail

Row types:
- Normal:   bg-white hover:bg-surface-low
- Subtotal: bg-blue/5 font-semibold text-navy (Laba Usaha, Laba Operasional, Laba Sebelum Pajak)

Drilldown Interaction:
- Kolom Detail memiliki chevron icon. Label dapat di-klik untuk membuka DrilldownModal.
- Pengecualian: Laba Operasional & Laba Sebelum Pajak TIDAK BISA DI-KLIK dan TIDAK ADA ICON (karena tidak memiliki komponen detail/drilldown schema).
```

### 8.4 Drill Down Modal

```
Komponen: src/components/drilldown/DrilldownModal.tsx

Visual & Logika:
- Muncul sebagai popup modal.
- Menampilkan Level 2 (Segmen) lalu bisa diklik lagi (via History State) untuk masuk ke Level 3 (Komponen).
- Mendukung pemetaan Level 3 spesifik dari `drilldown-schema.md` (misal: "MPO - TAD" memunculkan Gaji, Tunjangan, dsb).
- Pendapatan Non Ops dan Biaya Non Ops dipisah kondisinya dari Pendapatan/Beban operasional agar tabel menampilkan komponen yang benar.
```

### 8.5 Tab Neraca

```
Komponen: src/components/tabs/TabNeraca.tsx

Header columns:
  Kategori | [Bulan] [Tahun-1] | Des [Tahun-1] | [Bulan] [Tahun] | YoY | Realisasi RKA YTD | Realisasi RKA Tahunan
  *(Catatan: Kolom 'Detail' ditiadakan, tidak menggunakan Modal)*

Logika & Interaksi:
- Menggunakan Inline Tree-View (Dropdown Expansion).
- Baris tabel tidak bisa di-klik untuk buka modal, melainkan diklik untuk expand/collapse children.
- Indentasi bertingkat berdasarkan `indentLevel` (Level 0: Total Aset, Level 1: Aset Lancar, Level 2: Kas, dst).
```

### 8.6 Tab Rasio

```
Komponen: src/components/tabs/TabRasio.tsx

Tabel:
- Layout tabel identik dengan Ringkasan P&L dan Neraca (Periode, YoY, RKA, Detail).
- Menampilkan 7 rasio (Current Ratio, Cash Ratio, dst) dengan drilldown modal.
```

### 8.7 Tab Tren

```
Komponen: src/components/tabs/TabTren.tsx

Dua Chart Berbasis chart.js (react-chartjs-2):
1. Tren 12 Bulan Terakhir (P&L):
   - Multi-line chart: Pendapatan, Beban, Laba Usaha.
   - Smooth line (`tension: 0.4`), Pendapatan memiliki area fill (`rgba(59, 130, 246, 0.1)`).
   - Dropdown Segmen Bisnis di header chart.
2. Perbandingan Tren Rasio:
   - Multi-line chart: 2 rasio yang bisa dikustomisasi via dropdown (mis. Cash Ratio & Current Ratio).
   - Legend dan tooltips komprehensif.
```

### 8.8 Tab Simulasi

```
Komponen: src/components/tabs/TabSimulasi.tsx

Layout Grid Kompleks:
- Atas Kiri: Periode Dasar (Box angka statis).
- Atas Kanan: Pilihan Skenario (3 button preset) dan Ringkasan Dampak Kas/DSO.
- Tengah Kiri: 5 Slider (HTML `<input type="range">`) untuk mengubah persentase (-20% ke 20%) Pendapatan Per Segmen.
- Tengah Kanan: Sidebar untuk Pengaturan Umum (Slider Biaya, OPEX, DSO) & Sinyal Utama.
- Bawah: 4 Kotak Hasil Simulasi Berwarna Tebal (Pendapatan: Biru, Laba Kotor: Hijau, Laba Ops: Ungu, Kas Proyeksi: Oranye/Coklat) yang ter-update real-time.
```

### 8.9 Chat Panel

```
Komponen: src/components/tabs/TabChat.tsx

- Terintegrasi sebagai tab utama "Chat dengan Data".
- Layout: Header, Area Pesan Chat, Input Box bergaya modern (Gemini-style vibe).
```

---

## 9. State Management

### Prinsip

- **Tidak menggunakan Redux.** State global dikelola dengan React Context + `useReducer`.
- Server state (data dari API) menggunakan React `cache` atau SWR jika diperlukan.
- UI state lokal (expand/collapse, hover) tetap di komponen masing-masing via `useState`.

### Dashboard Context

```ts
// hooks/useDashboard.ts

interface DashboardContextValue {
  state:          DashboardState;
  setActivePeriod:(period: string) => void;
  replaceData:    (data: BootstrapData) => void;
  openDrilldown:  (config: DrilldownConfig) => void;
  closeDrilldown: () => void;
  toggleChat:     () => void;
}
```

### `computeAll()`

```ts
// lib/compute.ts
// Dipanggil setelah replaceData() — menghasilkan semua computed state dari raw data.

export function computeAll(raw: RawData, activePeriod: string): ComputedState {
  return {
    kpiCards:    computeKpiCards(raw, activePeriod),
    summaryRows: computeSummaryRows(raw, activePeriod),
    ratios:      computeRatios(raw, activePeriod),
    trendSeries: computeTrendSeries(raw),
    neracaTree:  buildNeracaTree(raw.neraca, activePeriod),
    anomalies:   detectAnomalies(raw, activePeriod),
  };
}
```

---

## 10. LLM Integration

### Chat — System Prompt

```ts
// lib/llm/prompts/system-chat.ts

export function buildSystemPrompt(schema: DbSchema, activePeriod: string): string {
  return `
Kamu adalah analis keuangan AI untuk dashboard perusahaan jasa.
Kamu memiliki akses ke database dengan tabel berikut:

${schema.description}

Periode aktif saat ini: ${activePeriod}
Snapshot ID aktif: ${schema.snapshotId}

ATURAN:
1. Jawab SELALU dalam Bahasa Indonesia formal.
2. Jika pertanyaan membutuhkan data, generate SQL query yang valid.
3. Format SQL dalam blok \`\`\`sql ... \`\`\`.
4. Setelah SQL, berikan interpretasi singkat hasil yang diharapkan.
5. Jangan asumsikan angka tanpa query — selalu ambil dari database.
6. Untuk angka keuangan, gunakan format Rupiah (Rp X,XX T / M / jt).
7. Jangan expose nama tabel internal selain yang ada di schema ini.
  `.trim();
}
```

### Generate Laporan — System Prompt

```ts
// lib/llm/prompts/system-report.ts

export function buildReportPrompt(data: ReportData): string {
  return `
Kamu adalah penulis laporan manajemen keuangan senior.
Tulis laporan kinerja keuangan periodik berdasarkan data berikut:

${JSON.stringify(data, null, 2)}

STRUKTUR LAPORAN (ikuti urutan ini):
1. Ringkasan Eksekutif (3-4 kalimat)
2. Kinerja Pendapatan (per segmen, highlight deviasi)
3. Kinerja Beban dan Margin
4. Status Rasio Keuangan
5. Identifikasi Risiko (maksimal 3 poin)
6. Rekomendasi Tindak Lanjut (maksimal 3 poin)

GAYA PENULISAN:
- Bahasa Indonesia formal, ringkas, berbasis data
- Angka dalam format Rupiah kompak (T/M/jt)
- Tidak berbunga-bunga, langsung ke inti
- Gunakan markdown untuk struktur
  `.trim();
}
```

### LLM Client

```ts
// lib/llm/client.ts
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const LLM_MODEL    = "claude-sonnet-4-5";
export const LLM_MAX_TOKENS = 2048;
```

---

## 11. Konvensi Kode

### Wajib Diikuti

```
✅ Gunakan TypeScript strict mode — tidak ada `any`
✅ Semua komponen: named export, bukan default export
✅ Props interface selalu dideklarasikan di atas komponen
✅ Fungsi komputasi keuangan: pure function, tidak ada side effect
✅ Semua pembagian angka: gunakan safeDivide() dari lib/utils.ts
✅ Format angka: gunakan formatters.ts, bukan Intl langsung di komponen
✅ Warna: gunakan CSS variable atau Tailwind token, jangan hardcode hex
✅ Angka keuangan di UI: selalu className="font-mono tabular-nums"
✅ Error boundary: wrap semua tab dengan <ErrorBoundary>
✅ Loading state: gunakan skeleton, bukan spinner penuh layar
```

### Dilarang

```
❌ Jangan gunakan `any` atau type assertion tanpa komentar
❌ Jangan hardcode warna hex di JSX/TSX
❌ Jangan lakukan kalkulasi keuangan di dalam komponen — selalu di lib/
❌ Jangan fetch data langsung di komponen — gunakan hooks atau server component
❌ Jangan gunakan inline style kecuali untuk chart dynamic values
❌ Jangan buat file >300 baris — pecah menjadi sub-komponen
```

### Utility Functions Wajib Ada

```ts
// lib/utils.ts

export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

export function cn(...inputs: ClassValue[]): string { /* clsx + twMerge */ }
```

```ts
// lib/formatters.ts

export function formatRupiah(value: number, compact = true): string;
// compact=true  → "Rp 1,25 T" / "Rp 320 M" / "Rp 15 jt"
// compact=false → "Rp 1.250.000.000"

export function formatPersen(value: number, decimals = 1): string;
// → "84.2%" / "+3.1 pt"

export function formatRasio(value: number, unit: "x" | "%" | "hari"): string;
// → "1.32x" / "84.20%" / "42.50 hr"

export function formatDelta(value: number, unit?: string): string;
// delta positif → "+3.20 pt" (hijau), negatif → "-1.50 pt" (merah)
```

### Naming Convention

| Jenis | Konvensi | Contoh |
|---|---|---|
| Komponen | PascalCase | `KpiCards.tsx` |
| Hook | camelCase + use prefix | `useDashboard.ts` |
| Util/lib | camelCase | `formatters.ts` |
| Type/Interface | PascalCase | `FinancialMetric` |
| Constant | SCREAMING_SNAKE | `ACHIEVEMENT_STATUS` |
| CSS variable | kebab-case | `--color-navy` |
| DB column | snake_case | `snapshot_id` |
| API route | kebab-case | `/api/dashboard/workbook` |

---

## 12. Roadmap Fase

### Fase 1 — Ideasi & Rekayasa Data ✅ Selesai

- [x] Synthetic dataset (7.000+ baris, 6 tabel)
- [x] Drill down schema
- [x] Formula rasio keuangan
- [x] Design system specification
- [x] Frontend engineering context
- [x] PRD ini

### Fase 2 — Backend & Database

- [ ] Setup project Next.js + TypeScript + Tailwind
- [ ] Drizzle schema + migration
- [ ] Import CSV synthetic dataset ke DB
- [ ] API route `/api/dashboard` (GET bootstrap)
- [ ] Workbook parser + importer
- [ ] API route `/api/dashboard/workbook` (POST)
- [ ] API route `/api/drilldown` (GET)
- [ ] Query functions di `lib/db/queries/`

### Fase 3 — Frontend Dashboard

- [ ] Setup design tokens (CSS vars + Tailwind config)
- [ ] Font loading (IBM Plex Sans + IBM Plex Mono)
- [ ] Layout shell + Header
- [ ] KPI Cards + sparkline
- [ ] Tabel Ringkasan P&L
- [ ] Drilldown Modal (tab: Tabel/Pie/Bar/Waterfall)
- [ ] Tab Neraca (hierarki expandable)
- [ ] Tab Rasio (tabel monitoring)
- [ ] Tab Tren (line chart)
- [ ] Tab Simulasi (slider + output real-time)
- [ ] Anomaly Banner
- [ ] Right Panel (insight, bridge laba)
- [ ] Responsiveness (mobile/tablet/desktop)
- [ ] Loading skeleton + error boundary

### Fase 4 — LLM Integration

- [ ] Anthropic SDK setup
- [ ] System prompt builder (chat + report)
- [ ] API route `/api/chat` (streaming SSE)
- [ ] Chat Panel UI (floating + slide-in)
- [ ] SQL executor dari LLM output
- [ ] Render tabel/chart dari hasil chat
- [ ] API route `/api/report`
- [ ] Generate laporan (PDF + HTML export)
- [ ] Prompt testing + guardrails

### Fase 5 — Testing & Deployment

- [ ] Unit test `lib/compute.ts` dan `lib/ratios/`
- [ ] Integration test API routes
- [ ] E2E test (Playwright) — happy path per tab
- [ ] Performance audit (tabel besar, LCP)
- [ ] Environment setup (production)
- [ ] CI/CD pipeline
- [ ] Dokumentasi deployment

---

*Versi: v0.1 · April 2025 · Dataset sintetis digunakan untuk keperluan demonstrasi*
