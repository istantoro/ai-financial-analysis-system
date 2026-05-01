# Rumus Ratio Dashboard — Istantoro Human Solutions

Dokumen ini merangkum seluruh rumus rasio yang digunakan dashboard.

## Konvensi Umum

### Safe Divide

Semua pembagian memakai pola aman:

```text
safeDivide(numerator, denominator) =
  jika denominator = 0, hasil = 0
  selain itu, hasil = numerator / denominator
```

### Jenis Nilai

```text
realisasi = actual
rkap      = target
```

### Unit

| Rasio | Unit |
|---|---|
| Cash Ratio | x |
| Current Ratio | x |
| GPM (Laba Usaha) | % |
| COGS Ratio | % |
| BOPO Ratio | % |
| Profit Margin | % |
| DSO (Hari) | hari |

### Achievement

Untuk rasio biasa, semakin besar semakin baik:

```text
achievement = actual / target * 100
```

Untuk rasio inverse, semakin kecil semakin baik:

```text
achievement = target / actual * 100
```

Rasio inverse:

- COGS Ratio
- BOPO Ratio
- DSO (Hari)

Jika rasio inverse punya `actual <= 0`, achievement dianggap `100`.

### Status Achievement

```text
achievement >= 100 = OK
achievement >= 85  = Perhatian
achievement < 85   = Risiko
```

---

## 1. Cash Ratio

### Rumus

```text
Cash Ratio = Kas dan Setara Kas / Kewajiban Lancar
```

### Implementasi Dashboard

```text
Cash Ratio = account_1101 / account_2101
```

| Kode | Nama |
|---|---|
| `1101` | Kas dan Setara Kas |
| `2101` | Kewajiban Lancar |

### Komponen Pembilang — Kas dan Setara Kas

| Kode NR | Nama Akun |
|---|---|
| NR007_KAS | KAS |
| NR008_BANK | BANK |
| NR009_DEPOSITO | DEPOSITO |
| NR010_DEPOSITO_DIJAMINKAN | DEPOSITO YANG DI JAMINKAN |

### Komponen Penyebut — Kewajiban Lancar

| Kode NR | Nama Akun |
|---|---|
| NR044_HUTANG_PAJAK | HUTANG PAJAK |
| NR045_BPJS_DPLK | BY YMH DIBAYAR BPJS DAN DPLK |
| NR046_HUTANG_DIVIDEN | HUTANG DIVIDEN |
| NR047_BIAYA_MASIH_HARUS_DIBAYAR | BIAYA YANG MASIH HARUS DIBAYAR |
| NR048_PINJAMAN_MODAL_KERJA | PINJAMAN MODAL KERJA |
| NR049_PINJAMAN_PEMEGANG_SAHAM | PINJAMAN KE PEMEGANG SAHAM |
| NR050_KEWAJIBAN_LANCAR_LAINNYA | KEWAJIBAN LANCAR LAINNYA |

### Target

```text
Cash Ratio Target = Kas dan Setara Kas RKAP / Kewajiban Lancar RKAP
```

### YTD

Untuk rasio berbasis neraca, dashboard memakai nilai rasio terakhir yang tidak nol sampai periode aktif.

```text
Cash Ratio YTD = latest_non_zero(Cash Ratio sampai periode aktif)
```

---

## 2. Current Ratio

### Rumus

```text
Current Ratio = Aset Lancar / Kewajiban Lancar
```

### Implementasi Dashboard

```text
Current Ratio = account_1106 / account_2101
```

| Kode | Nama |
|---|---|
| `1106` | Total Aset Lancar |
| `2101` | Kewajiban Lancar |

### Komponen Pembilang — Aset Lancar

| Kode NR | Nama Akun |
|---|---|
| NR007_KAS | KAS |
| NR008_BANK | BANK |
| NR009_DEPOSITO | DEPOSITO |
| NR010_DEPOSITO_DIJAMINKAN | DEPOSITO YANG DI JAMINKAN |
| NR011_PERSEDIAAN_METERAI | PERSEDIAAN METERAI |
| NR012_SURAT_SURAT_BERHARGA | SURAT SURAT BERHARGA |
| NR018_PIUTANG_BERSIH | PIUTANG BERSIH |
| NR019_PIUTANG_LAINNYA | PIUTANG LAINNYA |
| NR020_PIUTANG_INTER_COMPANY | PIUTANG INTER COMPANY |
| NR021_UANG_MUKA | UANG MUKA |
| NR022_PAJAK_DIBAYAR_DIMUKA | PAJAK DIBAYAR DIMUKA |
| NR023_BIAYA_DIBAYAR_DIMUKA | BIAYA DIBAYAR DIMUKA |

### Komponen Piutang — Ditampilkan untuk Trace (tidak dijumlah ulang)

| Kode NR | Nama Akun | Catatan |
|---|---|---|
| NR013_PIUTANG_CAPTIVE | PIUTANG CAPTIVE | Komponen piutang |
| NR014_PIUTANG_NON_CAPTIVE | PIUTANG NON CAPTIVE | Komponen piutang |
| NR015_PIUTANG_JASA_PENDIDIKAN | PIUTANG JASA PENDIDIKAN | Komponen piutang |
| NR016_JUMLAH_PIUTANG | JUMLAH PIUTANG | Subtotal gross |
| NR017_PENYISIHAN_PIUTANG | PENYISIHAN PENGHAPUSAN PIUTANG | Pengurang |

Basis final piutang untuk Current Ratio adalah `NR018_PIUTANG_BERSIH` (PIUTANG BERSIH).

### Komponen Penyebut — Kewajiban Lancar

Sama dengan Cash Ratio (lihat tabel di atas).

### Target

```text
Current Ratio Target = Total Aset Lancar RKAP / Kewajiban Lancar RKAP
```

### YTD

```text
Current Ratio YTD = latest_non_zero(Current Ratio sampai periode aktif)
```

---

## 3. GPM (Laba Usaha)

### Rumus

```text
GPM = Laba Usaha / Pendapatan * 100
```

### Implementasi Dashboard

```text
GPM = financial_metrics[laba_usaha] / financial_metrics[pendapatan] * 100
```

### Segmen Bisnis

- MPO - TAD
- MPO - RAB
- BPO
- KPO - DIKLAT
- KPO - TRAINING

### Rumus Per Segmen

```text
GPM Segmen = Laba Usaha Segmen / Pendapatan Segmen * 100
```

### Rumus Total

```text
GPM Total = SUM(Laba Usaha seluruh segmen) / SUM(Pendapatan seluruh segmen) * 100
```

### Target

```text
GPM Target = Laba Usaha RKAP / Pendapatan RKAP * 100
```

### YTD

```text
GPM YTD = SUM(Laba Usaha Realisasi YTD) / SUM(Pendapatan Realisasi YTD) * 100
```

---

## 4. COGS Ratio

### Rumus

```text
COGS Ratio = Beban Pokok Jasa / Pendapatan * 100
```

Dalam data dashboard, `Beban Pokok Jasa` berasal dari kategori `beban_operasional`.

### Implementasi Dashboard

```text
COGS Ratio = financial_metrics[beban_operasional] / financial_metrics[pendapatan] * 100
```

### Segmen Bisnis

- MPO - TAD
- MPO - RAB
- BPO
- KPO - DIKLAT
- KPO - TRAINING

### Rumus Per Segmen

```text
COGS Ratio Segmen = Beban Operasional Segmen / Pendapatan Segmen * 100
```

### Rumus Total

```text
COGS Ratio Total = SUM(Beban Operasional seluruh segmen) / SUM(Pendapatan seluruh segmen) * 100
```

### Target

```text
COGS Ratio Target = Beban Operasional RKAP / Pendapatan RKAP * 100
```

### YTD

```text
COGS Ratio YTD = SUM(Beban Operasional Realisasi YTD) / SUM(Pendapatan Realisasi YTD) * 100
```

### Interpretasi

COGS Ratio adalah rasio inverse. Semakin rendah nilainya, semakin baik.

---

## 5. BOPO Ratio

### Rumus

```text
BOPO Ratio = Biaya Pemasaran dan Adm Umum / Pendapatan * 100
```

Catatan: BOPO di dashboard ini merepresentasikan OPEX ratio — tidak termasuk beban pokok jasa/COGS.

### Implementasi Dashboard

```text
BOPO Ratio = bopoCost / Pendapatan * 100
```

Jika data reported summary tersedia, dashboard memakai nilai tersebut. Jika tidak, fallback ke total kelompok biaya operasional.

### Komponen Pembilang — Biaya Pemasaran dan Adm Umum

| Kelompok | Segment di component_metrics |
|---|---|
| Biaya Pemasaran | `Biaya Pemasaran` |
| Biaya Remunerasi Pekerja | `Biaya Remunerasi Pekerja` |
| Biaya Tenaga Kerja Lainnya | `Biaya Tenaga Kerja Lainnya` |
| Biaya Penyusutan Aktiva Tetap | `Biaya Penyusutan Aktiva Tetap` |
| Biaya Transportasi dan Perjalanan | `Biaya Transportasi dan Perjalanan` |
| Biaya Operasional Kantor | `Biaya Operasional Kantor` |

### Komponen Penyebut — Pendapatan

Dijumlah dari seluruh segmen bisnis (MPO - TAD, MPO - RAB, BPO, KPO - DIKLAT, KPO - TRAINING).

### Rumus Total

```text
BOPO Ratio Total = SUM(Biaya Pemasaran dan Adm Umum) / SUM(Pendapatan seluruh segmen) * 100
```

### Target

```text
BOPO Ratio Target = Biaya Pemasaran dan Adm Umum RKAP / Pendapatan RKAP * 100
```

### YTD

```text
BOPO Ratio YTD = SUM(Biaya Pemasaran dan Adm Umum YTD) / SUM(Pendapatan YTD) * 100
```

### Interpretasi

BOPO Ratio adalah rasio inverse. Semakin rendah nilainya, semakin baik.

---

## 6. Profit Margin

### Rumus

```text
Profit Margin = Laba Sebelum Pajak / Pendapatan * 100
```

### Implementasi Dashboard

```text
Profit Margin = financial_metrics[laba_sebelum_pajak] / financial_metrics[pendapatan] * 100
```

### Struktur PL

```text
Laba Sebelum Pajak = Laba Operasional + Pendapatan Non Operasional - Beban Non Operasional
```

### Segmen Bisnis

- MPO - TAD
- MPO - RAB
- BPO
- KPO - DIKLAT
- KPO - TRAINING

### Rumus Total

```text
Profit Margin Total = SUM(Laba Sebelum Pajak seluruh segmen) / SUM(Pendapatan seluruh segmen) * 100
```

### Target

```text
Profit Margin Target = Laba Sebelum Pajak RKAP / Pendapatan RKAP * 100
```

### YTD

```text
Profit Margin YTD = SUM(Laba Sebelum Pajak Realisasi YTD) / SUM(Pendapatan Realisasi YTD) * 100
```

---

## 7. DSO (Hari)

### Rumus

```text
DSO = Piutang / Pendapatan * Jumlah Hari
```

### Implementasi Dashboard Per Periode

```text
DSO Periode = Piutang Usaha periode / Pendapatan periode * Hari dalam periode
```

```text
Hari dalam periode bulanan = jumlah hari pada bulan tersebut
Hari dalam periode tahunan = 365 atau 366
```

### Komponen Pembilang — Piutang Usaha

| Kode NR | Nama Akun |
|---|---|
| NR013_PIUTANG_CAPTIVE | PIUTANG CAPTIVE |
| NR014_PIUTANG_NON_CAPTIVE | PIUTANG NON CAPTIVE |
| NR015_PIUTANG_JASA_PENDIDIKAN | PIUTANG JASA PENDIDIKAN |

Prioritas nilai neraca yang dipakai dashboard:

```text
Piutang = account_1105 (JUMLAH PIUTANG) jika tersedia
       atau account_1102 (PIUTANG BERSIH) jika account_1105 kosong
```

### Komponen Penyebut — Pendapatan

Dijumlah dari seluruh segmen bisnis.

### Target Periode

```text
DSO Target Periode = Piutang Usaha RKAP periode / Pendapatan RKAP periode * Hari dalam periode
```

### YTD

```text
Pendapatan Annualized = SUM(Pendapatan YTD) / Jumlah Periode YTD * 12

DSO YTD = Piutang Usaha periode aktif / Pendapatan Annualized * 365
```

### Target YTD

```text
Pendapatan RKAP Annualized = SUM(Pendapatan RKAP YTD) / Jumlah Periode YTD * 12

DSO Target YTD = Piutang Usaha RKAP periode aktif / Pendapatan RKAP Annualized * 365
```

### Interpretasi

DSO adalah rasio inverse. Semakin rendah nilainya, semakin baik.
DSO harus dibaca bersama pertumbuhan pendapatan — DSO turun tidak selalu berarti collection membaik jika pendapatan naik lebih cepat dari piutang.

---

## Ringkasan Rumus YTD

| Rasio | Rumus YTD |
|---|---|
| Cash Ratio | latest non-zero Cash Ratio sampai periode aktif |
| Current Ratio | latest non-zero Current Ratio sampai periode aktif |
| GPM (Laba Usaha) | SUM(Laba Usaha YTD) / SUM(Pendapatan YTD) * 100 |
| COGS Ratio | SUM(Beban Operasional YTD) / SUM(Pendapatan YTD) * 100 |
| BOPO Ratio | SUM(Biaya Pemasaran dan Adm Umum YTD) / SUM(Pendapatan YTD) * 100 |
| Profit Margin | SUM(Laba Sebelum Pajak YTD) / SUM(Pendapatan YTD) * 100 |
| DSO (Hari) | Piutang periode aktif / Pendapatan YTD annualized * 365 |

## Ringkasan Rumus Target

| Rasio | Rumus Target |
|---|---|
| Cash Ratio | Kas dan Setara Kas RKAP / Kewajiban Lancar RKAP |
| Current Ratio | Total Aset Lancar RKAP / Kewajiban Lancar RKAP |
| GPM (Laba Usaha) | Laba Usaha RKAP / Pendapatan RKAP * 100 |
| COGS Ratio | Beban Operasional RKAP / Pendapatan RKAP * 100 |
| BOPO Ratio | Biaya Pemasaran dan Adm Umum RKAP / Pendapatan RKAP * 100 |
| Profit Margin | Laba Sebelum Pajak RKAP / Pendapatan RKAP * 100 |
| DSO (Hari) | Piutang Usaha RKAP / Pendapatan RKAP annualized * 365 |

---

## Mapping Akun Neraca

| Kode | Kode NR | Nama Akun |
|---|---|---|
| 1101 | NR006 summary | Kas dan Setara Kas |
| 1102 | NR018_PIUTANG_BERSIH | Piutang Bersih |
| 1105 | NR016_JUMLAH_PIUTANG | Jumlah Piutang |
| 1106 | NR024_TOTAL_AKTIVA_LANCAR | Total Aset Lancar |
| 2101 | NR051_TOTAL_KEWAJIBAN_LANCAR | Kewajiban Lancar |

## Mapping Kategori PL

| Kategori Data | Makna |
|---|---|
| `pendapatan` | Pendapatan segmen bisnis |
| `beban_operasional` | Beban pokok jasa / COGS segmen bisnis |
| `laba_usaha` | Laba usaha segmen bisnis |
| `laba_sebelum_pajak` | Laba sebelum pajak |

---

## Contoh Query SQL

### GPM Per Periode

```sql
SELECT
  period,
  SUM(CASE WHEN category = 'laba_usaha' THEN actual ELSE 0 END)
  / NULLIF(SUM(CASE WHEN category = 'pendapatan' THEN actual ELSE 0 END), 0)
  * 100 AS gpm
FROM financial_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
GROUP BY period;
```

### COGS Ratio Per Periode

```sql
SELECT
  period,
  SUM(CASE WHEN category = 'beban_operasional' THEN actual ELSE 0 END)
  / NULLIF(SUM(CASE WHEN category = 'pendapatan' THEN actual ELSE 0 END), 0)
  * 100 AS cogs_ratio
FROM financial_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
GROUP BY period;
```

### Profit Margin Per Periode

```sql
SELECT
  period,
  SUM(CASE WHEN category = 'laba_sebelum_pajak' THEN actual ELSE 0 END)
  / NULLIF(SUM(CASE WHEN category = 'pendapatan' THEN actual ELSE 0 END), 0)
  * 100 AS profit_margin
FROM financial_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
GROUP BY period;
```

### Cash Ratio Per Periode

```sql
SELECT
  period,
  SUM(CASE WHEN account_code = '1101' THEN actual ELSE 0 END)
  / NULLIF(SUM(CASE WHEN account_code = '2101' THEN actual ELSE 0 END), 0)
  AS cash_ratio
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
GROUP BY period;
```

### Current Ratio Per Periode

```sql
SELECT
  period,
  SUM(CASE WHEN account_code = '1106' THEN actual ELSE 0 END)
  / NULLIF(SUM(CASE WHEN account_code = '2101' THEN actual ELSE 0 END), 0)
  AS current_ratio
FROM neraca_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
GROUP BY period;
```

### DSO Per Periode (Bulanan)

```sql
SELECT
  n.period,
  SUM(CASE WHEN n.account_code = '1105' THEN n.actual ELSE 0 END) AS piutang,
  SUM(CASE WHEN f.category = 'pendapatan' THEN f.actual ELSE 0 END) AS pendapatan,
  SUM(CASE WHEN n.account_code = '1105' THEN n.actual ELSE 0 END)
  / NULLIF(SUM(CASE WHEN f.category = 'pendapatan' THEN f.actual ELSE 0 END), 0)
  * DAY(LAST_DAY(n.period)) AS dso_hari
FROM neraca_metrics n
JOIN financial_metrics f
  ON n.period = f.period
  AND n.snapshot_id = f.snapshot_id
WHERE n.snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND f.period_type = 'monthly'
GROUP BY n.period;
```

### BOPO Ratio Per Periode

```sql
SELECT
  period,
  SUM(actual) AS bopo_cost
FROM component_metrics
WHERE snapshot_id = 'snapshot_istantoro_2022_mar_2026'
  AND category = 'beban'
  AND segment IN (
    'Biaya Pemasaran',
    'Biaya Remunerasi Pekerja',
    'Biaya Tenaga Kerja Lainnya',
    'Biaya Penyusutan Aktiva Tetap',
    'Biaya Transportasi dan Perjalanan',
    'Biaya Operasional Kantor'
  )
GROUP BY period;
```
