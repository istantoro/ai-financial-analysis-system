"use client";

import { RefreshCw, Download, LogOut, FileText } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";

export function Header() {
  const { selectedMonth, selectedYear, setMonth, setYear } = useDashboardStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[56px] px-6 bg-gradient-to-br from-navy to-blue flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-white font-ui font-semibold text-h2 truncate">AI-Powered Financial Performance Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-white/70 text-sm hidden md:inline">Periode:</span>
          <select 
            value={selectedMonth}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm outline-none focus:border-white/40 cursor-pointer"
          >
            <option value={1} className="text-ink">Januari</option>
            <option value={2} className="text-ink">Februari</option>
            <option value={3} className="text-ink">Maret</option>
            <option value={4} className="text-ink">April</option>
            <option value={5} className="text-ink">Mei</option>
            <option value={6} className="text-ink">Juni</option>
            <option value={7} className="text-ink">Juli</option>
            <option value={8} className="text-ink">Agustus</option>
            <option value={9} className="text-ink">September</option>
            <option value={10} className="text-ink">Oktober</option>
            <option value={11} className="text-ink">November</option>
            <option value={12} className="text-ink">Desember</option>
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm outline-none focus:border-white/40 cursor-pointer"
          >
            <option value={2024} className="text-ink">2024</option>
            <option value={2025} className="text-ink">2025</option>
            <option value={2026} className="text-ink">2026</option>
          </select>
        </div>
        <button className="flex items-center gap-2 h-[28px] px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded transition-colors" title="Generate Management Report">
          <FileText className="w-4 h-4" />
          <span className="text-xs font-medium">Generate Report</span>
        </button>
        <button className="flex items-center justify-center h-[28px] px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="flex items-center justify-center h-[28px] px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded transition-colors" title="Export">
          <Download className="w-4 h-4" />
        </button>
        <button className="flex items-center justify-center h-[28px] px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded transition-colors" title="Logout">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
