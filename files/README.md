# Synthetic Dashboard Data — Istantoro Human Solutions

> ⚠️ **Disclaimer**: Dataset ini sepenuhnya sintetis. Nama perusahaan dan
> seluruh nilai keuangan adalah **fiktif**. Dibuat untuk keperluan demo
> dashboard dan publikasi umum.

## Transformasi yang diterapkan

| Elemen | Perlakuan |
|---|---|
| Nama perusahaan | Diganti → Istantoro Human Solutions (fiktif) |
| Nilai keuangan | Diskalakan per-segmen (×0.78–1.17) + noise acak ±5% |
| Nama segmen | **Dipertahankan asli** (MPO-TAD, BPO, KPO-DIKLAT, dst.) |
| Nama komponen | **Dipertahankan asli** — hanya referensi nama bank/mitra digeneralisasi |
| Nama akun neraca | **Dipertahankan asli** — hanya "PINJAMAN KI DARI BRI" → "PINJAMAN KI DARI BANK" |

## Rentang Data
- Annual: 2022–2025 | Monthly: Jan 2025 – Mar 2026

## File
| File | Rows | Keterangan |
|---|---|---|
| `dashboard_snapshots.csv` | 1 | Metadata snapshot |
| `periods.csv` | 19 | Dimensi periode |
| `financial_metrics.csv` | 570 | Metrik P&L per periode & segmen |
| `component_metrics.csv` | 2888 | Detail komponen pendapatan/beban |
| `neraca_metrics.csv` | 1349 | Neraca per periode & akun |
| `workbook_rows.csv` | 778 | Raw workbook rows (sintetis) |
