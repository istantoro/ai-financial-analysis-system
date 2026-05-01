"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";
import { formatRupiah } from "../../lib/formatters";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

// Static hierarchy definition per drilldown-schema.md
// Each node: { code, label, isSubtotal, isHeader, children? }
const NERACA_TREE = [
  {
    code: "NR041_TOTAL_AKTIVA", label: "ASET", isHeader: true, isSubtotal: true,
    children: [
      {
        code: "NR006_ASET_LANCAR", label: "ASET LANCAR", isSubtotal: true,
        children: [
          { code: "NR007_KAS",                    label: "KAS" },
          { code: "NR008_BANK",                   label: "BANK" },
          { code: "NR009_DEPOSITO",               label: "DEPOSITO" },
          { code: "NR010_DEPOSITO_DIJAMINKAN",    label: "DEPOSITO YANG DI JAMINKAN" },
          { code: "NR011_PERSEDIAAN_METERAI",     label: "PERSEDIAAN METERAI" },
          { code: "NR012_SURAT_SURAT_BERHARGA",   label: "SURAT SURAT BERHARGA" },
          { code: "NR018_PIUTANG_BERSIH",         label: "PIUTANG BERSIH" },
          { code: "NR019_PIUTANG_LAINNYA",        label: "PIUTANG LAINNYA" },
          { code: "NR020_PIUTANG_INTER_COMPANY",  label: "PIUTANG INTER COMPANY" },
          { code: "NR021_UANG_MUKA",              label: "UANG MUKA" },
          { code: "NR022_PAJAK_DIBAYAR_DIMUKA",   label: "PAJAK DIBAYAR DIMUKA" },
          { code: "NR023_BIAYA_DIBAYAR_DIMUKA",   label: "BIAYA DIBAYAR DIMUKA" },
          { code: "NR024_TOTAL_AKTIVA_LANCAR",    label: "TOTAL AKTIVA LANCAR", isSubtotal: true },
        ],
      },
      {
        code: "NR025_AKTIVA_TIDAK_LANCAR", label: "ASET TIDAK LANCAR", isSubtotal: true,
        children: [
          {
            code: "NR026_ASET_LAIN_LAIN", label: "ASET LAIN-LAIN", isSubtotal: true,
            children: [
              { code: "NR027_INVESTASI_ASOSIASI", label: "INVESTASI DALAM ENTITAS ASOSIASI" },
            ],
          },
          {
            code: "NR028_KENDARAAN_DISEWAKAN", label: "KENDARAAN UNTUK DISEWAKAN", isSubtotal: true,
            children: [
              { code: "NR028_KENDARAAN_GROSS",                  label: "GROSS" },
              { code: "NR029_AKUMULASI_PENYUSUTAN_KENDARAAN",  label: "AKUMULASI PENYUSUTAN" },
              { code: "NR030_NILAI_BUKU_KENDARAAN",            label: "NILAI BUKU / NET" },
            ],
          },
          {
            code: "NR031_ASET_TETAP", label: "ASET TETAP", isSubtotal: true,
            children: [
              { code: "NR032_HARGA_PEROLEHAN_ASET_TETAP",      label: "HARGA PEROLEHAN" },
              { code: "NR033_AKUMULASI_PENYUSUTAN_ASET_TETAP", label: "AKUMULASI PENYUSUTAN" },
              { code: "NR034_NILAI_BUKU_ASET_TETAP",           label: "NILAI BUKU / NET" },
            ],
          },
          {
            code: "NR035_AKTIVA_LAIN_LAIN", label: "AKTIVA LAIN-LAIN", isSubtotal: true,
            children: [
              { code: "NR036_ASET_PIUTANG_LAIN",     label: "ASET PIUTANG LAIN" },
              { code: "NR037_ASET_DALAM_PENYELESAIAN", label: "ASET DALAM PENYELESAIAN" },
              { code: "NR038_RENOVASI_BANGUNAN",      label: "RENOVASI BANGUNAN YANG DISEWA" },
              { code: "NR039_UANG_JAMINAN_PROYEK",    label: "UANG JAMINAN PROYEK" },
              { code: "NR040_JAMINAN_BANK_GARANSI",   label: "JAMINAN BANK GARANSI" },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "NR066_TOTAL_PASIVA", label: "PASIVA", isHeader: true, isSubtotal: true,
    children: [
      {
        code: "NR043_KEWAJIBAN_LANCAR", label: "KEWAJIBAN", isSubtotal: true,
        children: [
          {
            code: "NR051_TOTAL_KEWAJIBAN_LANCAR", label: "KEWAJIBAN LANCAR", isSubtotal: true,
            children: [
              { code: "NR044_HUTANG_PAJAK",               label: "HUTANG PAJAK" },
              { code: "NR045_BPJS_DPLK",                  label: "BY YMH DIBAYAR BPJS DAN DPLK" },
              { code: "NR046_HUTANG_DIVIDEN",              label: "HUTANG DIVIDEN" },
              { code: "NR047_BIAYA_MASIH_HARUS_DIBAYAR",  label: "BIAYA YANG MASIH HARUS DIBAYAR" },
              { code: "NR048_PINJAMAN_MODAL_KERJA",        label: "PINJAMAN MODAL KERJA" },
              { code: "NR049_PINJAMAN_PEMEGANG_SAHAM",    label: "PINJAMAN KE PEMEGANG SAHAM" },
              { code: "NR050_KEWAJIBAN_LANCAR_LAINNYA",   label: "KEWAJIBAN LANCAR LAINNYA" },
            ],
          },
          {
            code: "NR056_TOTAL_KEWAJIBAN_JANGKA_PANJANG", label: "KEWAJIBAN JANGKA PANJANG", isSubtotal: true,
            children: [
              { code: "NR054_PINJAMAN_KI_BANK",                  label: "PINJAMAN KI DARI BANK" },
              { code: "NR055_KEWAJIBAN_IMBALAN_PASCA_KERJA",    label: "KEWAJIBAN IMBALAN PASCA KERJA" },
            ],
          },
        ],
      },
      {
        code: "NR057_EKUITAS", label: "EKUITAS", isSubtotal: true,
        children: [
          { code: "NR059_MODAL_SAHAM",              label: "MODAL SAHAM" },
          { code: "NR058_CADANGAN_RISIKO_UMUM",     label: "CADANGAN RISIKO UMUM" },
          { code: "NR060_LABA_DITAHAN",             label: "LABA DITAHAN" },
          { code: "NR061_LABA_SETELAH_PAJAK",       label: "LABA SETELAH PAJAK" },
          { code: "NR062_TOTAL_EKUITAS_SEBELUM_RL", label: "TOTAL EKUITAS SBLM R/L BERJALAN", isSubtotal: true },
          { code: "NR063_RUGI_LABA_TAHUN_LALU",     label: "RUGI/LABA TAHUN LALU" },
          { code: "NR064_BAGIAN_LABA_PERUSAHAAN_ANAK", label: "BAGIAN LABA PERUSAHAAN ANAK" },
          { code: "NR065_RUGI_LABA_TAHUN_BERJALAN", label: "RUGI/LABA TAHUN BERJALAN" },
        ],
      },
    ],
  },
];

type TreeDef = {
  code: string;
  label: string;
  isSubtotal?: boolean;
  isHeader?: boolean;
  children?: TreeDef[];
};

type DataMap = Record<string, number>;

export function TabNeraca() {
  const { selectedMonth, selectedYear } = useDashboardStore();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    "NR041_TOTAL_AKTIVA":   true,
    "NR006_ASET_LANCAR":    false,
    "NR025_AKTIVA_TIDAK_LANCAR": false,
    "NR066_TOTAL_PASIVA":   true,
    "NR043_KEWAJIBAN_LANCAR": false,
    "NR057_EKUITAS":        false,
  });
  const [currMap, setCurrMap]   = useState<DataMap>({});
  const [priorMap, setPriorMap] = useState<DataMap>({});
  const [annMap, setAnnMap]     = useState<DataMap>({});
  const [isLoading, setIsLoading] = useState(true);

  const currentMonthName = MONTH_NAMES[selectedMonth];
  const previousYear = selectedYear - 1;

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/neraca?year=${selectedYear}&month=${selectedMonth}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const toMap = (rows: { accountCode: string; actual: number }[]) =>
            Object.fromEntries(rows.map(r => [r.accountCode, Number(r.actual)]));
          setCurrMap(toMap(d.current));
          setPriorMap(toMap(d.prior));
          setAnnMap(toMap(d.annual));
        }
      })
      .finally(() => setIsLoading(false));
  }, [selectedYear, selectedMonth]);

  const toggleExpand = (code: string) =>
    setExpandedRows(prev => ({ ...prev, [code]: !prev[code] }));

  const getVal = (map: DataMap, code: string) => map[code] ?? 0;

  const yoy = (curr: number, prior: number) =>
    prior === 0 ? null : ((curr - prior) / Math.abs(prior)) * 100;

  const renderTree = (nodes: TreeDef[], depth = 0): React.ReactNode[] => {
    const result: React.ReactNode[] = [];

    for (const node of nodes) {
      const hasChildren = !!(node.children && node.children.length > 0);
      const isExpanded  = expandedRows[node.code] ?? false;
      const curr  = getVal(currMap, node.code);
      const prior = getVal(priorMap, node.code);
      const ann   = getVal(annMap, node.code);
      const yoyPct = yoy(curr, prior);

      const rowBg = node.isHeader
        ? "bg-navy/10 font-bold text-navy"
        : node.isSubtotal
          ? "bg-surface-low font-semibold text-ink"
          : "bg-white hover:bg-surface-low text-ink";

      result.push(
        <tr key={node.code} className={`border-b border-line transition-colors ${rowBg}`}>
          <td
            className="py-2.5 text-left font-ui"
            style={{ paddingLeft: `${depth * 1.4 + 1}rem` }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.code)}
                className="flex items-center gap-1 text-left w-full hover:text-blue focus:outline-none"
              >
                {isExpanded
                  ? <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                <span className="text-sm">{node.label}</span>
              </button>
            ) : (
              <span className="pl-5 text-sm">{node.label}</span>
            )}
          </td>
          <td className="px-4 py-2.5 text-right font-mono tabular-nums text-sm">{formatRupiah(prior)}</td>
          <td className="px-4 py-2.5 text-right font-mono tabular-nums text-sm">{formatRupiah(ann)}</td>
          <td className="px-4 py-2.5 text-right font-mono tabular-nums text-sm font-medium">{formatRupiah(curr)}</td>
          <td className={`px-4 py-2.5 text-right font-mono tabular-nums text-sm ${
            yoyPct === null ? "text-muted" : yoyPct >= 0 ? "text-success" : "text-danger"
          }`}>
            {yoyPct === null ? "—" : `${yoyPct >= 0 ? "+" : ""}${yoyPct.toFixed(1)}%`}
          </td>
        </tr>
      );

      if (hasChildren && isExpanded) {
        result.push(...renderTree(node.children!, depth + 1));
      }
    }

    return result;
  };

  return (
    <div className="overflow-x-auto relative">
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin w-6 h-6 text-muted" />
        </div>
      )}
      {!isLoading && (
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-surface-high text-ink text-xs font-semibold sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left w-[360px]">Kategori</th>
              <th className="px-4 py-3 text-right">{currentMonthName} {previousYear}</th>
              <th className="px-4 py-3 text-right">Des {previousYear}</th>
              <th className="px-4 py-3 text-right">{currentMonthName} {selectedYear}</th>
              <th className="px-4 py-3 text-right">YoY</th>
            </tr>
          </thead>
          <tbody>{renderTree(NERACA_TREE)}</tbody>
        </table>
      )}
    </div>
  );
}
