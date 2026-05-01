"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";
import { DrilldownModal } from "../drilldown/DrilldownModal";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

interface Ratio {
  key:       string;
  label:     string;
  unit:      string;
  current:   number;
  prior:     number;
  target:    number;
  achiv:     number;
  yoyDelta:  number;
  status:    string;
  isInverse: boolean;
}

function formatValue(value: number, unit: string): string {
  if (unit === "%")    return `${value.toFixed(1)}%`;
  if (unit === "x")    return `${value.toFixed(2)}x`;
  if (unit === "hari") return `${Math.round(value)} hari`;
  return value.toFixed(1);
}

export function TabRasio() {
  const { selectedMonth, selectedYear } = useDashboardStore();
  const [ratios, setRatios]     = useState<Ratio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen]  = useState(false);
  const [activeTitle, setActiveTitle] = useState("");

  const currentMonthName = MONTH_NAMES[selectedMonth];
  const previousYear = selectedYear - 1;

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/rasio?year=${selectedYear}&month=${selectedMonth}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setRatios(d.ratios);
      })
      .finally(() => setIsLoading(false));
  }, [selectedYear, selectedMonth]);

  return (
    <div className="overflow-x-auto relative">
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin w-6 h-6 text-muted" />
        </div>
      )}
      {!isLoading && (
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead className="bg-surface-high text-ink text-xs font-semibold sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left w-[260px]">Kategori</th>
              <th className="px-4 py-3 text-right">YTD {currentMonthName} {previousYear}</th>
              <th className="px-4 py-3 text-right">Target</th>
              <th className="px-4 py-3 text-right">YTD {currentMonthName} {selectedYear}</th>
              <th className="px-4 py-3 text-right">YoY Delta</th>
              <th className="px-4 py-3 text-right">Realisasi RKA YTD</th>
              <th className="px-4 py-3 text-center w-[60px]">Detail</th>
            </tr>
          </thead>
          <tbody>
            {ratios.map((row, idx) => {
              const yoyPos = row.isInverse ? row.yoyDelta <= 0 : row.yoyDelta >= 0;
              return (
                <tr
                  key={idx}
                  className="border-b border-line transition-colors bg-white hover:bg-surface-low"
                >
                  <td className="px-4 py-3 text-left font-ui">
                    <button
                      onClick={() => { setActiveTitle(row.label); setModalOpen(true); }}
                      className="text-left font-ui text-ink hover:text-blue hover:underline transition-colors focus:outline-none"
                    >
                      {row.label}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {formatValue(row.prior, row.unit)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted">
                    {formatValue(row.target, row.unit)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold">
                    {formatValue(row.current, row.unit)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono tabular-nums ${yoyPos ? "text-success" : "text-danger"}`}>
                    {row.yoyDelta >= 0 ? "+" : ""}{formatValue(row.yoyDelta, row.unit)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      row.status === "OK"        ? "bg-green-bg text-success" :
                      row.status === "Perhatian" ? "bg-amber-bg text-warning" :
                                                   "bg-red-bg text-danger"
                    }`}>
                      {row.achiv.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => { setActiveTitle(row.label); setModalOpen(true); }}
                      className="p-1 rounded text-muted hover:bg-surface-high hover:text-ink transition-colors"
                      title="Drilldown"
                    >
                      <ChevronRight className="w-4 h-4 mx-auto" />
                    </button>
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
        title={`Detail Rasio: ${activeTitle}`}
      />
    </div>
  );
}
