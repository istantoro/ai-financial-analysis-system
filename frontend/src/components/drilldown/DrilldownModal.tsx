"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeft, BarChart3, PieChart, Table, Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";
import { formatRupiah } from "../../lib/formatters";

interface DrilldownModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

interface DataRow {
  label:       string;
  actual:      number;
  target:      number;
  prior:       number;
  annual:      number;
  hasChildren: boolean;
  isSubtotal?: boolean;
}

export function DrilldownModal({ title, isOpen, onClose }: DrilldownModalProps) {
  const { selectedMonth, selectedYear } = useDashboardStore();
  const [history, setHistory] = useState<string[]>([]);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentMonthName = MONTH_NAMES[selectedMonth];
  const previousYear = selectedYear - 1;

  useEffect(() => {
    if (isOpen) {
      setHistory([title]);
      fetchData(title);
    } else {
      setHistory([]);
      setRows([]);
    }
  }, [isOpen, title]);

  const fetchData = async (currentTitle: string, segment?: string) => {
    setIsLoading(true);
    try {
      // Find the base category from history[0]
      const baseCategory = history.length > 0 ? history[0] : currentTitle;
      const url = `/api/drilldown?year=${selectedYear}&month=${selectedMonth}&category=${encodeURIComponent(baseCategory)}${segment ? `&segment=${encodeURIComponent(segment)}` : ""}`;
      
      const res = await fetch(url);
      const d = await res.json();
      if (d.success) {
        // Sort by actual descending
        const sortedRows = (d.rows as DataRow[]).sort((a, b) => b.actual - a.actual);
        setRows(sortedRows);
      }
    } catch (error) {
      console.error("Drilldown fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || history.length === 0) return null;

  const currentTitle = history[history.length - 1];

  const handleRowClick = (label: string, hasChildren: boolean) => {
    if (hasChildren) {
      setHistory([...history, label]);
      fetchData(history[0], label);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      fetchData(newHistory[0]);
    }
  };

  const achiv = (curr: any, tgt: any) => {
    const c = Number(curr) || 0;
    const t = Number(tgt) || 0;
    return t === 0 ? 0 : (c / t) * 100;
  };

  const yoy = (curr: any, prior: any) => {
    const c = Number(curr) || 0;
    const p = Number(prior) || 0;
    return p === 0 ? null : ((c - p) / Math.abs(p)) * 100;
  };

  // Calculate total for contribution - useMemo ensures it updates when rows change
  const totalActual = (rows || []).reduce((s, r) => s + (r.isSubtotal ? 0 : (Number(r.actual) || 0)), 0) || 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface-low">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              disabled={history.length <= 1}
              className={`p-1 rounded transition-colors ${history.length > 1 ? "hover:bg-surface-high text-ink" : "text-line cursor-not-allowed"}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-ui font-semibold text-lg text-ink">
              {history.length > 1 ? `Detail: ${currentTitle}` : currentTitle}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-high rounded text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-line flex gap-6 shrink-0">
          <button className="py-3 border-b-2 border-blue text-blue font-medium text-sm flex items-center gap-2">
            <Table className="w-4 h-4" /> Tabel Data
          </button>
          <button className="py-3 border-b-2 border-transparent text-muted hover:text-ink text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Komposisi
          </button>
          <button className="py-3 border-b-2 border-transparent text-muted hover:text-ink text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Actual vs Target
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-surface-container overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-blue animate-spin" />
              <p className="text-sm text-muted">Memuat data dari database...</p>
            </div>
          ) : (
            <div className="bg-white border border-line rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm border-collapse">
                <thead className="bg-surface-high text-xs text-ink font-semibold border-b border-line sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left w-[240px]">Segmen / Komponen</th>
                    <th className="px-4 py-3 text-right">YTD {currentMonthName} {previousYear}</th>
                    <th className="px-4 py-3 text-right">Des {previousYear}</th>
                    <th className="px-4 py-3 text-right">YTD {currentMonthName} {selectedYear}</th>
                    <th className="px-4 py-3 text-right">YoY</th>
                    <th className="px-4 py-3 text-right">Realisasi RKA YTD</th>
                    <th className="px-4 py-3 text-right">Realisasi RKA Tahunan</th>
                    <th className="px-4 py-3 text-right">Komposisi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-muted italic">Tidak ada data detail untuk periode ini.</td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => {
                      const currVal    = Number(row.actual) || 0;
                      const achivPct   = achiv(row.actual, row.target);
                      const yoyPct     = yoy(row.actual, row.prior);
                      const rkaTahunan = achiv(row.actual, row.annual);
                      const kontribusi = totalActual === 0 ? 0 : (currVal / totalActual) * 100;

                      return (
                        <tr key={idx} className={`border-b border-line transition-colors ${row.isSubtotal ? "bg-blue/5 font-semibold text-navy" : "bg-white hover:bg-surface-low"}`}>
                          <td className="px-4 py-3 font-ui text-left">
                            {row.hasChildren ? (
                              <button
                                onClick={() => handleRowClick(row.label, row.hasChildren)}
                                className="text-blue hover:underline focus:outline-none font-medium text-left"
                              >
                                {row.label}
                              </button>
                            ) : (
                              <span className="text-ink">{row.label}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">{formatRupiah(row.prior)}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">{formatRupiah(row.annual)}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">{formatRupiah(row.actual)}</td>
                          <td className={`px-4 py-3 text-right font-mono tabular-nums ${yoyPct === null ? "text-muted" : yoyPct >= 0 ? "text-success" : "text-danger"}`}>
                            {yoyPct === null ? "—" : `${yoyPct >= 0 ? "+" : ""}${yoyPct.toFixed(1)}%`}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              achivPct >= 100 ? "bg-green-bg text-success" :
                              achivPct >= 85  ? "bg-amber-bg text-warning" :
                                                "bg-red-bg text-danger"
                            }`}>
                              {achivPct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums">{rkaTahunan.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-muted">{kontribusi.toFixed(1)}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-muted mt-4 text-center">
            {history.length === 1
              ? "* Klik nama segmen untuk melihat detail komponen pembentuknya langsung dari database."
              : "* Ini adalah level detail terdalam untuk komponen ini."}
          </p>
        </div>
      </div>
    </div>
  );
}
