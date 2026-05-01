# Skema Drill Down Dashboard — Istantoro Human Solutions

Dokumen ini mendefinisikan struktur drill down dari level 1 sampai level 3 untuk **seluruh tab dashboard**: Ringkasan P&L dan Neraca.

---

## Prinsip Umum

- **Level 1** — metrik ringkasan yang tampil di halaman utama tab.
- **Level 2** — segmen bisnis, kelompok akun, atau blok pembentuk.
- **Level 3** — sub-komponen atau detail akun terkecil.
- Pos formula (Laba Usaha, Total Aset, dsb.) ditelusuri ke komponen pembentuknya.
- Setiap drill down menampilkan: **aktual, target, delta, achievement, kontribusi**.

---

## Join Key SQL

| Tujuan | Kolom |
|---|---|
| Mengikat ke sumber data | `snapshot_id` |
| Mengikat ke periode | `period` |
| Drill down P&L ke segmen | `snapshot_id`, `period`, `segment` |
| Drill down detail komponen P&L | `snapshot_id`, `period`, `segment`, `category` |
| Drill down neraca ke kelompok | `snapshot_id`, `period`, `account_group` |
| Drill down neraca ke akun | `snapshot_id`, `period`, `account_code` |

## Tabel Sumber

| Data | Tabel | Filter utama |
|---|---|---|
| P&L summary | `financial_metrics` | `category` |
| Komponen P&L | `component_metrics` | `segment`, `category` |
| Neraca | `neraca_metrics` | `account_group`, `account_code` |
| Dimensi periode | `periods` | `period_type` |

---

# BAGIAN A — DRILL DOWN RINGKASAN P&L

## Level 1 — Pos P&L Utama

```
1. Pendapatan
2. Beban
3. Laba Usaha            = Pendapatan - Beban
4. Biaya Pemasaran dan Adm Umum
5. Laba Operasional      = Laba Usaha - Biaya Pemasaran dan Adm Umum
6. Pendapatan Non Ops
7. Biaya Non Ops
8. Laba Sebelum Pajak    = Laba Operasional + Pendapatan Non Ops - Biaya Non Ops
```

---

## A.1 Pendapatan

**Level 2 — Segmen Bisnis** (`financial_metrics`, `category = 'pendapatan'`)

| Segmen |
|---|
| MPO - TAD |
| MPO - RAB |
| BPO |
| KPO - DIKLAT |
| KPO - TRAINING |

**Level 3 — Komponen per Segmen** (`component_metrics`, `category = 'pendapatan'`)

### MPO - TAD
- Upah, Gaji & Tunjangan
- Insentif & Bonus
- Seragam & Reliver
- Pesangon, DPLK, Kompensasi
- THR & Hari Keagamaan
- Rapel
- Rekrutmen, Pendidikan, Pembinaan & Hubungan
- Medical & Pengobatan
- Operasional Tenaga Kerja
- Bahan & Alat
- Tender, Koreksi & Lainnya
- Pengganti Sementara
- Management Fee

### MPO - RAB
- Jasa Head Hunter Klien
- Jasa Head Hunter Non Captive
- BFLP - BBOP Klien
- Jasa Assessment dan Psikotest Klien
- Jasa Assessment dan Psikotest Non Captive
- Jasa Layanan dan Ops Rekrutmen

### BPO
- Managed Services Collection
- Managed Services Sales - KPR
- Managed Services Sales - Klien Pinjaman
- Managed Services Sales - Funding
- Managed Services Sales - Lainnya
- Other Managed Services (QA, E-Arsip, EO)
- Borongan Kendaraan
- Tenaga Kerja Borongan
- Borongan Lainnya
- Perawatan ATM
- Borongan Klien
- Facility Services

### KPO - DIKLAT
- KPO Diklat Satpam

### KPO - TRAINING
- Training Corporate
- Training Webinar/Reguler
- Training Universitas

---

## A.2 Beban

**Level 2 — Segmen Bisnis** (`financial_metrics`, `category = 'beban_operasional'`)

Segmen identik dengan Pendapatan.

**Level 3 — Komponen per Segmen** (`component_metrics`, `category = 'beban'`)

Komponen identik dengan Pendapatan per segmen masing-masing.

---

## A.3 Laba Usaha

**Level 2 — Segmen Bisnis** (`financial_metrics`, `category = 'laba_usaha'`)

**Level 3 — Pembentuk per Segmen** (derived)

```
Laba Usaha [Segmen] = Pendapatan [Segmen] - Beban [Segmen]
```

Ditampilkan tiga baris per segmen:

| Baris | Sumber |
|---|---|
| Pendapatan [Segmen] | `financial_metrics`, `category = 'pendapatan'` |
| Beban [Segmen] | `financial_metrics`, `category = 'beban_operasional'` |
| Laba Usaha [Segmen] | derived |

---

## A.4 Biaya Pemasaran dan Adm Umum

**Level 2 — Kelompok Biaya** (`component_metrics`, `category = 'beban'`)

| Kelompok | Nilai `segment` |
|---|---|
| Biaya Pemasaran | `Biaya Pemasaran` |
| Biaya Remunerasi Pekerja | `Biaya Remunerasi Pekerja` |
| Biaya Tenaga Kerja Lainnya | `Biaya Tenaga Kerja Lainnya` |
| Biaya Penyusutan Aktiva Tetap | `Biaya Penyusutan Aktiva Tetap` |
| Biaya Transportasi dan Perjalanan | `Biaya Transportasi dan Perjalanan` |
| Biaya Operasional Kantor | `Biaya Operasional Kantor` |

**Level 3 — Sub Komponen**

### Biaya Pemasaran
- Biaya Iklan, Reklame & Pameran / Biaya Promosi / Biaya Hubungan Relasi / Biaya Humas

### Biaya Remunerasi Pekerja
- Upah/Gaji, Tunjangan Kinerja, Tunjangan Premium, Tunjangan Jabatan, Tunjangan Khusus, Tunjangan Uang Lembur, Tunjangan Cuti, Tunjangan Pajak Pasal 21

### Biaya Tenaga Kerja Lainnya
- Tunjangan Dana Pensiun (DPLK), Tunjangan Jamsostek, Bantuan Uang Duka, THR Keagamaan, BPJS Kesehatan, Reimbursement Pengobatan, Biaya Imbalan Pasca Kerja, Bonus, Insentive, Biaya Kompensasi

### Biaya Penyusutan Aktiva Tetap
- Biaya Penyusutan Bangunan / Kendaraan / Mesin & Peralatan Kantor / Meubelair & Furniture

### Biaya Transportasi dan Perjalanan
- Biaya Transportasi / Biaya Perjalanan Dinas

### Biaya Operasional Kantor
- Materai, Telpon & Fax, Expedisi, ATK & Fotocopy, Administrasi Tender, Listrik, Rumah Tangga, Perlengkapan Kantor, Sewa Kendaraan, Amortisasi Sewa Kendaraan Direksi, Sewa Kantor, Pendidikan, Rekrutmen Peg Organik, Rapat, Pemeliharaan Barang/Bangunan, Peralatan Bisnis, Perawatan HW & SW, Pemeliharaan Mobil Dinas, Transportasi Operasional, Pemeliharaan Spd Motor, Honorarium Konsultan, Keamanan, Kebersihan, Pendirian, Seragam Dinas, Premi Asuransi, Perijinan, Jasmani & Rohani, Pajak, Kegiatan Sosial, Penghapusan Piutang, OS Kantor, Operasional Lainnya, Kerugian Fraud, Pulsa

---

## A.5 Pendapatan & Biaya Non Ops

**Pendapatan Non Ops** (`category = 'pendapatan_non_operasional'`):
- Pendapatan Jasa Giro / Pendapatan Lain-Lain / Pendapatan Bunga Deposito

**Biaya Non Ops** (`category = 'beban_non_operasional'`):
- Beban Bunga Pinjaman / Biaya Adm Bank / Pajak Atas Jasa Giro / Pajak Atas Bunga Deposito / Pendapatan/Kerugian Penghapusan Aset

---

# BAGIAN B — DRILL DOWN NERACA

## Level 1 — Ringkasan 4 Blok

| Blok | Kode | Formula |
|---|---|---|
| Total Aset | `NR041_TOTAL_AKTIVA` | Aset Lancar + Aset Tidak Lancar |
| Total Kewajiban | derived | Kewajiban Lancar + Kewajiban Jangka Panjang |
| Total Ekuitas | `NR057_EKUITAS` | Modal + Cadangan + Laba/Rugi |
| Total Pasiva | `NR066_TOTAL_PASIVA` | Total Kewajiban + Total Ekuitas |

Status balance: `Total Aset = Total Pasiva` → badge OK / Risiko.

---

## B.1 Aset

**Level 2 — Kelompok**

| Kelompok | Kode |
|---|---|
| Aset Lancar | `NR006_ASET_LANCAR` / `1106` |
| Aset Tidak Lancar | `NR025_AKTIVA_TIDAK_LANCAR` |

### B.1.1 Aset Lancar — Level 3

| Kode NR | Nama Akun | Catatan |
|---|---|---|
| `NR007_KAS` | KAS | |
| `NR008_BANK` | BANK | |
| `NR009_DEPOSITO` | DEPOSITO | |
| `NR010_DEPOSITO_DIJAMINKAN` | DEPOSITO YANG DI JAMINKAN | |
| `NR011_PERSEDIAAN_METERAI` | PERSEDIAAN METERAI | |
| `NR012_SURAT_SURAT_BERHARGA` | SURAT SURAT BERHARGA | |
| `NR013_PIUTANG_CAPTIVE` | PIUTANG CAPTIVE | trace only |
| `NR014_PIUTANG_NON_CAPTIVE` | PIUTANG NON CAPTIVE | trace only |
| `NR015_PIUTANG_JASA_PENDIDIKAN` | PIUTANG JASA PENDIDIKAN | trace only |
| `NR016_JUMLAH_PIUTANG` | JUMLAH PIUTANG | trace only |
| `NR017_PENYISIHAN_PIUTANG` | PENYISIHAN PENGHAPUSAN PIUTANG | trace only |
| `NR018_PIUTANG_BERSIH` | PIUTANG BERSIH | **basis final** |
| `NR019_PIUTANG_LAINNYA` | PIUTANG LAINNYA | |
| `NR020_PIUTANG_INTER_COMPANY` | PIUTANG INTER COMPANY | |
| `NR021_UANG_MUKA` | UANG MUKA | |
| `NR022_PAJAK_DIBAYAR_DIMUKA` | PAJAK DIBAYAR DIMUKA | |
| `NR023_BIAYA_DIBAYAR_DIMUKA` | BIAYA DIBAYAR DIMUKA | |
| `NR024_TOTAL_AKTIVA_LANCAR` | TOTAL AKTIVA LANCAR | **subtotal** |

> Akun "trace only" ditampilkan untuk audit namun tidak dijumlahkan ulang ke subtotal.

**Sub-drilldown Kas dan Setara Kas** (untuk Cash Ratio):

| Kode NR | Nama Akun |
|---|---|
| `NR007_KAS` | KAS |
| `NR008_BANK` | BANK |
| `NR009_DEPOSITO` | DEPOSITO |
| `NR010_DEPOSITO_DIJAMINKAN` | DEPOSITO YANG DI JAMINKAN |

**Sub-drilldown Piutang** (untuk DSO):

| Kode NR | Nama Akun | Peran |
|---|---|---|
| `NR013_PIUTANG_CAPTIVE` | PIUTANG CAPTIVE | Komponen |
| `NR014_PIUTANG_NON_CAPTIVE` | PIUTANG NON CAPTIVE | Komponen |
| `NR015_PIUTANG_JASA_PENDIDIKAN` | PIUTANG JASA PENDIDIKAN | Komponen |
| `NR016_JUMLAH_PIUTANG` | JUMLAH PIUTANG | Gross — basis DSO L1 |
| `NR017_PENYISIHAN_PIUTANG` | PENYISIHAN PENGHAPUSAN PIUTANG | Pengurang |
| `NR018_PIUTANG_BERSIH` | PIUTANG BERSIH | Net — basis DSO L2 |

### B.1.2 Aset Tidak Lancar — Level 3

**Investasi:**

| Kode NR | Nama Akun |
|---|---|
| `NR026_ASET_LAIN_LAIN` | ASET LAIN-LAIN |
| `NR027_INVESTASI_ASOSIASI` | INVESTASI DALAM ENTITAS ASOSIASI |

**Kendaraan untuk Disewakan:**

| Kode NR | Nama Akun |
|---|---|
| `NR028_KENDARAAN_GROSS` | KENDARAAN UNTUK DISEWAKAN (GROSS) |
| `NR029_AKUMULASI_PENYUSUTAN_KENDARAAN` | AKUMULASI PENYUSUTAN |
| `NR030_NILAI_BUKU_KENDARAAN` | NILAI BUKU |
| `NR028_KENDARAAN_DISEWAKAN` | **KENDARAAN UNTUK DISEWAKAN (NET)** |

**Aset Tetap:**

| Kode NR | Nama Akun |
|---|---|
| `NR032_HARGA_PEROLEHAN_ASET_TETAP` | HARGA PEROLEHAN AKTIVA TETAP |
| `NR033_AKUMULASI_PENYUSUTAN_ASET_TETAP` | AKUMULASI PENYUSUTAN |
| `NR034_NILAI_BUKU_ASET_TETAP` | NILAI BUKU |
| `NR031_ASET_TETAP` | **ASET TETAP (NET)** |

**Aktiva Lain-lain:**

| Kode NR | Nama Akun |
|---|---|
| `NR036_ASET_PIUTANG_LAIN` | ASET PIUTANG LAIN |
| `NR037_ASET_DALAM_PENYELESAIAN` | ASET DALAM PENYELESAIAN |
| `NR038_RENOVASI_BANGUNAN` | RENOVASI BANGUNAN YANG DISEWA |
| `NR039_UANG_JAMINAN_PROYEK` | UANG JAMINAN PROYEK |
| `NR040_JAMINAN_BANK_GARANSI` | JAMINAN BANK GARANSI |
| `NR035_AKTIVA_LAIN_LAIN` | **AKTIVA LAIN-LAIN (SUBTOTAL)** |

---

## B.2 Kewajiban

**Level 2 — Kelompok**

| Kelompok | Kode |
|---|---|
| Kewajiban Lancar | `NR051_TOTAL_KEWAJIBAN_LANCAR` / `2101` |
| Kewajiban Jangka Panjang | `NR056_TOTAL_KEWAJIBAN_JANGKA_PANJANG` / `2102` |

### B.2.1 Kewajiban Lancar — Level 3

| Kode NR | Nama Akun |
|---|---|
| `NR044_HUTANG_PAJAK` | HUTANG PAJAK |
| `NR045_BPJS_DPLK` | BY YMH DIBAYAR BPJS DAN DPLK |
| `NR046_HUTANG_DIVIDEN` | HUTANG DIVIDEN |
| `NR047_BIAYA_MASIH_HARUS_DIBAYAR` | BIAYA YANG MASIH HARUS DIBAYAR |
| `NR048_PINJAMAN_MODAL_KERJA` | PINJAMAN MODAL KERJA |
| `NR049_PINJAMAN_PEMEGANG_SAHAM` | PINJAMAN KE PEMEGANG SAHAM |
| `NR050_KEWAJIBAN_LANCAR_LAINNYA` | KEWAJIBAN LANCAR LAINNYA |
| `NR051_TOTAL_KEWAJIBAN_LANCAR` | **TOTAL KEWAJIBAN LANCAR** |

### B.2.2 Kewajiban Jangka Panjang — Level 3

| Kode NR | Nama Akun |
|---|---|
| `NR054_PINJAMAN_KI_BANK` | PINJAMAN KI DARI BANK |
| `NR055_KEWAJIBAN_IMBALAN_PASCA_KERJA` | KEWAJIBAN IMBALAN PASCA KERJA |
| `NR056_TOTAL_KEWAJIBAN_JANGKA_PANJANG` | **TOTAL KEWAJIBAN JANGKA PANJANG** |

---

## B.3 Ekuitas — Level 3

| Kode NR | Nama Akun | Catatan |
|---|---|---|
| `NR059_MODAL_SAHAM` | MODAL SAHAM | Modal disetor |
| `NR058_CADANGAN_RISIKO_UMUM` | CADANGAN RISIKO UMUM | |
| `NR060_LABA_DITAHAN` | LABA DITAHAN | Akumulasi periode lalu |
| `NR061_LABA_SETELAH_PAJAK` | LABA SETELAH PAJAK | Periode berjalan |
| `NR062_TOTAL_EKUITAS_SEBELUM_RL` | TOTAL EKUITAS SBLM R/L BERJALAN | Subtotal |
| `NR063_RUGI_LABA_TAHUN_LALU` | RUGI/LABA TAHUN LALU | |
| `NR064_BAGIAN_LABA_PERUSAHAAN_ANAK` | BAGIAN LABA PERUSAHAAN ANAK | |
| `NR065_RUGI_LABA_TAHUN_BERJALAN` | RUGI/LABA TAHUN BERJALAN | |
| `NR057_EKUITAS` | **TOTAL EKUITAS** | |

---

## Peta Hierarki Neraca

```
NERACA
├── ASET
│   ├── ASET LANCAR (NR006)
│   │   ├── KAS (NR007)
│   │   ├── BANK (NR008)
│   │   ├── DEPOSITO (NR009)
│   │   ├── DEPOSITO YANG DI JAMINKAN (NR010)
│   │   ├── PERSEDIAAN METERAI (NR011)
│   │   ├── SURAT SURAT BERHARGA (NR012)
│   │   ├── Piutang
│   │   │   ├── PIUTANG CAPTIVE (NR013)         [trace]
│   │   │   ├── PIUTANG NON CAPTIVE (NR014)     [trace]
│   │   │   ├── PIUTANG JASA PENDIDIKAN (NR015) [trace]
│   │   │   ├── JUMLAH PIUTANG (NR016)          [trace]
│   │   │   ├── PENYISIHAN PIUTANG (NR017)      [trace]
│   │   │   └── PIUTANG BERSIH (NR018)          ← basis final
│   │   ├── PIUTANG LAINNYA (NR019)
│   │   ├── PIUTANG INTER COMPANY (NR020)
│   │   ├── UANG MUKA (NR021)
│   │   ├── PAJAK DIBAYAR DIMUKA (NR022)
│   │   ├── BIAYA DIBAYAR DIMUKA (NR023)
│   │   └── TOTAL AKTIVA LANCAR (NR024)         ← subtotal
│   │
│   └── ASET TIDAK LANCAR (NR025)
│       ├── ASET LAIN-LAIN (NR026)
│       │   └── INVESTASI ENTITAS ASOSIASI (NR027)
│       ├── KENDARAAN DISEWAKAN
│       │   ├── GROSS (NR028_KENDARAAN_GROSS)
│       │   ├── AKUMULASI PENYUSUTAN (NR029)
│       │   └── NET (NR028_KENDARAAN_DISEWAKAN) ← basis
│       ├── ASET TETAP (NR031)
│       │   ├── HARGA PEROLEHAN (NR032)
│       │   ├── AKUMULASI PENYUSUTAN (NR033)
│       │   └── NILAI BUKU / NET (NR034)        ← basis
│       └── AKTIVA LAIN-LAIN (NR035)
│           ├── ASET PIUTANG LAIN (NR036)
│           ├── ASET DALAM PENYELESAIAN (NR037)
│           ├── RENOVASI BANGUNAN (NR038)
│           ├── UANG JAMINAN PROYEK (NR039)
│           └── JAMINAN BANK GARANSI (NR040)
│
└── PASIVA
    ├── KEWAJIBAN
    │   ├── KEWAJIBAN LANCAR (NR043)
    │   │   ├── HUTANG PAJAK (NR044)
    │   │   ├── BY YMH DIBAYAR BPJS DAN DPLK (NR045)
    │   │   ├── HUTANG DIVIDEN (NR046)
    │   │   ├── BIAYA MASIH HARUS DIBAYAR (NR047)
    │   │   ├── PINJAMAN MODAL KERJA (NR048)
    │   │   ├── PINJAMAN KE PEMEGANG SAHAM (NR049)
    │   │   ├── KEWAJIBAN LANCAR LAINNYA (NR050)
    │   │   └── TOTAL KEWAJIBAN LANCAR (NR051)  ← subtotal
    │   └── KEWAJIBAN JANGKA PANJANG (NR053)
    │       ├── PINJAMAN KI DARI BANK (NR054)
    │       ├── KEWAJIBAN IMBALAN PASCA KERJA (NR055)
    │       └── TOTAL KEWAJIBAN JANGKA PANJANG (NR056) ← subtotal
    └── EKUITAS (NR057)
        ├── MODAL SAHAM (NR059)
        ├── CADANGAN RISIKO UMUM (NR058)
        ├── LABA DITAHAN (NR060)
        ├── LABA SETELAH PAJAK (NR061)
        ├── TOTAL EKUITAS SBLM R/L (NR062)
        ├── RUGI/LABA TAHUN LALU (NR063)
        ├── BAGIAN LABA PERUSAHAAN ANAK (NR064)
        └── RUGI/LABA TAHUN BERJALAN (NR065)
```

---

# BAGIAN C — MAPPING DRILL DOWN KE MODAL UI

| Titik Masuk | Drill ke |
|---|---|
| Baris Pendapatan (total) | Level 2: daftar segmen |
| Baris Pendapatan (segmen) | Level 3: komponen |
| Baris Beban (total) | Level 2: daftar segmen |
| Baris Beban (segmen) | Level 3: komponen |
| Baris Laba Usaha | Level 2: pendapatan + beban per segmen |
| Baris Biaya Adm (total) | Level 2: kelompok biaya |
| Baris Biaya Adm (kelompok) | Level 3: sub komponen |
| Baris Non Ops | Langsung komponen (1 level) |
| **Neraca — Total Aset** | Level 2: Lancar / Tidak Lancar |
| **Neraca — Aset Lancar** | Level 3: detail akun |
| **Neraca — Kas & Setara Kas** | Sub-drill: KAS / BANK / DEPOSITO |
| **Neraca — Piutang** | Sub-drill: Captive / Non-Captive / Net |
| **Neraca — Aset Tidak Lancar** | Level 3: Kendaraan / Aset Tetap / Lain |
| **Neraca — Total Kewajiban** | Level 2: Lancar / Jangka Panjang |
| **Neraca — Kewajiban Lancar** | Level 3: detail akun |
| **Neraca — Ekuitas** | Level 3: detail komponen ekuitas |

---

# BAGIAN D — CONTOH QUERY SQL

## P&L

### Ringkasan P&L per Periode
```sql
SELECT category, SUM(actual) AS actual, SUM(target) AS target
FROM financial_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03'
GROUP BY category;
```

### Pendapatan per Segmen
```sql
SELECT segment, SUM(actual) AS actual, SUM(target) AS target
FROM financial_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03' AND category = 'pendapatan'
GROUP BY segment ORDER BY actual DESC;
```

### Komponen Pendapatan per Segmen
```sql
SELECT component_name, actual, target
FROM component_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03' AND category = 'pendapatan' AND segment = 'MPO - TAD'
ORDER BY actual DESC;
```

### Biaya Adm — Level 2
```sql
SELECT segment AS kelompok_biaya, SUM(actual) AS actual, SUM(target) AS target
FROM component_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03' AND category = 'beban'
  AND segment IN (
    'Biaya Pemasaran', 'Biaya Remunerasi Pekerja', 'Biaya Tenaga Kerja Lainnya',
    'Biaya Penyusutan Aktiva Tetap', 'Biaya Transportasi dan Perjalanan', 'Biaya Operasional Kantor'
  )
GROUP BY segment ORDER BY actual DESC;
```

## Neraca

### Ringkasan 4 Blok Neraca
```sql
SELECT account_code, account_name, actual, target
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03'
  AND account_code IN (
    'NR041_TOTAL_AKTIVA', 'NR051_TOTAL_KEWAJIBAN_LANCAR',
    'NR056_TOTAL_KEWAJIBAN_JANGKA_PANJANG', 'NR057_EKUITAS', 'NR066_TOTAL_PASIVA'
  );
```

### Detail Aset Lancar
```sql
SELECT account_code, account_name, actual, target
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03'
  AND account_code IN (
    'NR007_KAS','NR008_BANK','NR009_DEPOSITO','NR010_DEPOSITO_DIJAMINKAN',
    'NR011_PERSEDIAAN_METERAI','NR012_SURAT_SURAT_BERHARGA',
    'NR013_PIUTANG_CAPTIVE','NR014_PIUTANG_NON_CAPTIVE','NR015_PIUTANG_JASA_PENDIDIKAN',
    'NR016_JUMLAH_PIUTANG','NR017_PENYISIHAN_PIUTANG','NR018_PIUTANG_BERSIH',
    'NR019_PIUTANG_LAINNYA','NR020_PIUTANG_INTER_COMPANY','NR021_UANG_MUKA',
    'NR022_PAJAK_DIBAYAR_DIMUKA','NR023_BIAYA_DIBAYAR_DIMUKA','NR024_TOTAL_AKTIVA_LANCAR'
  );
```

### Sub-drilldown Kas dan Setara Kas
```sql
SELECT account_code, account_name, actual, target
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03'
  AND account_code IN (
    'NR007_KAS','NR008_BANK','NR009_DEPOSITO','NR010_DEPOSITO_DIJAMINKAN'
  );
```

### Sub-drilldown Komposisi Piutang
```sql
SELECT account_code, account_name, actual, target
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03'
  AND account_code IN (
    'NR013_PIUTANG_CAPTIVE','NR014_PIUTANG_NON_CAPTIVE','NR015_PIUTANG_JASA_PENDIDIKAN',
    'NR016_JUMLAH_PIUTANG','NR017_PENYISIHAN_PIUTANG','NR018_PIUTANG_BERSIH'
  );
```

### Detail Kewajiban Lancar
```sql
SELECT account_code, account_name, actual, target
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03'
  AND account_code IN (
    'NR044_HUTANG_PAJAK','NR045_BPJS_DPLK','NR046_HUTANG_DIVIDEN',
    'NR047_BIAYA_MASIH_HARUS_DIBAYAR','NR048_PINJAMAN_MODAL_KERJA',
    'NR049_PINJAMAN_PEMEGANG_SAHAM','NR050_KEWAJIBAN_LANCAR_LAINNYA',
    'NR051_TOTAL_KEWAJIBAN_LANCAR'
  );
```

### Detail Kewajiban Jangka Panjang
```sql
SELECT account_code, account_name, actual, target
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03'
  AND account_code IN (
    'NR054_PINJAMAN_KI_BANK','NR055_KEWAJIBAN_IMBALAN_PASCA_KERJA',
    'NR056_TOTAL_KEWAJIBAN_JANGKA_PANJANG'
  );
```

### Detail Ekuitas
```sql
SELECT account_code, account_name, actual, target
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND period = '2026-03' AND account_group = 'ekuitas'
ORDER BY account_code;
```

---

## Perubahan Nama Komponen vs Skema Asli

| Nama Asli (Private) | Nama Sintetis (Publik) |
|---|---|
| Jasa Head Hunter BRI | Jasa Head Hunter Klien |
| Jasa Assessment dan Psikotest BRI | Jasa Assessment dan Psikotest Klien |
| BFLP - BBOP BRI | BFLP - BBOP Klien |
| Borongan BRI | Borongan Klien |
| Managed Services Sales - BRIGUNA | Managed Services Sales - Klien Pinjaman |
| PINJAMAN KI DARI BRI | PINJAMAN KI DARI BANK |
