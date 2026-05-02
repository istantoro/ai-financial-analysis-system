"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { DrilldownModal } from "../drilldown/DrilldownModal";
import { useDashboardStore } from "../../store/dashboardStore";
import { formatRupiah } from "../../lib/formatters";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

interface FinRow { category: string; actual: number; target: number; }

// Struktur sesuai drilldown-schema.md (Bagian A)
const ROWS_CONFIG = [
  { key: "pendapatan",                   label: "1. Pendapatan",                     isSubtotal: false, drillable: true },
  { key: "beban_operasional",            label: "2. Beban",                          isSubtotal: false, drillable: true },
  { key: "laba_usaha",                   label: "3. Laba Usaha",                     isSubtotal: true,  drillable: true },
  { key: "beban",                        label: "4. Biaya Pemasaran dan Adm Umum",   isSubtotal: false, drillable: true },
  { key: "laba_operasional",             label: "5. Laba Operasional",               isSubtotal: true,  drillable: false },
  { key: "pendapatan_non_operasional",   label: "6. Pendapatan Non Ops",             isSubtotal: false, drillable: true },
  { key: "beban_non_operasional",        label: "7. Biaya Non Ops",                  isSubtotal: false, drillable: true },
  { key: "laba_sebelum_pajak",           label: "8. Laba Sebelum Pajak",             isSubtotal: true,  drillable: false },
];

export function TabRingkasan() {
  const { selectedMonth, selectedYear } = useDashboardStore();
  const [modalOpen, setModalOpen]  = useState(false);
  const [activeTitle, setActiveTitle] = useState("");
  const [data, setData] = useState<{ ytdCurrent: FinRow[], ytdPrior: FinRow[], annual: FinRow[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentMonthName = MONTH_NAMES[selectedMonth];
  const previousYear = selectedYear - 1;

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/ringkasan?year=${selectedYear}&month=${selectedMonth}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d);
      })
      .finally(() => setIsLoading(false));
  }, [selectedYear, selectedMonth]);

  const findVal = (list: FinRow[], key: string) => Number(list.find(r => r.category === key)?.actual ?? 0);
  const findTgt = (list: FinRow[], key: string) => Number(list.find(r => r.category === key)?.target ?? 0);

  const calculateRow = (key: string, list: FinRow[], isTgt = false) => {
    const f = isTgt ? findTgt : findVal;
    
    // Check if the DB already provides this category (e.g. laba_usaha, laba_operasional, etc.)
    const dbVal = list.find(r => r.category === key);
    if (dbVal) return isTgt ? Number(dbVal.target) : Number(dbVal.actual);

    // Fallback to manual calculation if DB row is missing
    if (key === "laba_usaha")       return f(list, "pendapatan") - f(list, "beban_operasional");
    if (key === "laba_operasional") {
      const lu = calculateRow("laba_usaha", list, isTgt);
      return lu - f(list, "beban");
    }
    if (key === "laba_sebelum_pajak") {
      const lo = calculateRow("laba_operasional", list, isTgt);
      return lo + f(list, "pendapatan_non_operasional") - f(list, "beban_non_operasional");
    }
    return f(list, key);
  };

  const achiv = (actual: number, target: number) => target === 0 ? 0 : (actual / target) * 100;
  const yoy = (curr: number, prior: number) => prior === 0 ? 0 : ((curr - prior) / Math.abs(prior)) * 100;

  return (
    <div className="overflow-x-auto relative">
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin w-6 h-6 text-muted" />
        </div>
      )}
      {!isLoading && data && (
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead className="bg-surface-high text-ink text-xs font-semibold sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left w-[280px]">Kategori</th>
              <th className="px-4 py-3 text-right">YTD {currentMonthName} {previousYear}</th>
              <th className="px-4 py-3 text-right">Des {previousYear}</th>
              <th className="px-4 py-3 text-right">YTD {currentMonthName} {selectedYear}</th>
              <th className="px-4 py-3 text-right">YoY</th>
              <th className="px-4 py-3 text-right">Realisasi RKA YTD</th>
              <th className="px-4 py-3 text-right">Realisasi RKA Tahunan</th>
              <th className="px-4 py-3 text-center w-[60px]">Detail</th>
            </tr>
          </thead>
          <tbody>
            {ROWS_CONFIG.map((row, idx) => {
              const curr      = calculateRow(row.key, data.ytdCurrent);
              const prior     = calculateRow(row.key, data.ytdPrior);
              const ann       = calculateRow(row.key, data.annual);
              const tgt       = calculateRow(row.key, data.ytdCurrent, true);
              const annTgt    = calculateRow(row.key, data.annual, true);
              
              const achivPct  = achiv(curr, tgt);
              const yoyPct    = yoy(curr, prior);
              const rkaAnnPct = achiv(curr, annTgt);

              return (
                <tr
                  key={idx}
                  className={`border-b border-line transition-colors ${row.isSubtotal ? "bg-blue/5 font-semibold text-navy" : "bg-white hover:bg-surface-low"}`}
                >
                  <td className="px-4 py-3 text-left">
                    {row.drillable ? (
                      <button
                        onClick={() => { setActiveTitle(row.label); setModalOpen(true); }}
                        className="text-left font-ui text-ink hover:text-blue hover:underline focus:outline-none"
                      >
                        {row.label}
                      </button>
                    ) : (
                      <span className="font-ui">{row.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatRupiah(prior)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatRupiah(ann)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">{formatRupiah(curr)}</td>
                  <td className={`px-4 py-3 text-right font-mono tabular-nums ${yoyPct >= 0 ? "text-success" : "text-danger"}`}>
                    {yoyPct >= 0 ? "+" : ""}{yoyPct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${achivPct >= 100 ? "bg-green-bg text-success" : achivPct >= 85 ? "bg-amber-bg text-warning" : "bg-red-bg text-danger"}`}>
                      {achivPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{rkaAnnPct.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center">
                    {row.drillable && (
                      <button
                        onClick={() => { setActiveTitle(row.label); setModalOpen(true); }}
                        className="p-1 rounded text-muted hover:bg-surface-high hover:text-ink transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <DrilldownModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={activeTitle}
      />
    </div>
  );
}
