"use client";

import { useState } from "react";
import { RefreshCw, Download, LogOut, FileText, Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";

// jsPDF loaded dynamically to avoid Turbopack module resolution issues
// and to improve initial page load time

export function Header() {
  const { selectedMonth, selectedYear, setMonth, setYear } = useDashboardStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: selectedYear, month: selectedMonth }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Dynamic import — avoids Turbopack module resolution issue
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(data.report, 180);
        
        // Add Title
        doc.setFontSize(18);
        doc.setTextColor(0, 51, 102);
        doc.text("EXECUTIVE MANAGEMENT REPORT", 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        doc.text(`Periode: YTD ${monthNames[selectedMonth]} ${selectedYear}`, 105, 27, { align: "center" });
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 32, { align: "center" });

        // Content
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        let y = 45;
        splitText.forEach((line: string) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          
          // Simple Markdown Heading styles in PDF
          if (line.startsWith("# ")) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            y += 4;
          } else if (line.startsWith("## ")) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            y += 2;
          } else if (line.startsWith("### ")) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
          }

          doc.text(line.replace(/^#+ /, ""), 15, y);
          y += 6;
        });

        doc.save(`Management_Report_${selectedYear}_${selectedMonth}.pdf`);
      }
    } catch (error) {
      console.error("Report generation failed:", error);
      alert("Gagal membuat laporan. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[56px] px-6 bg-gradient-to-br from-navy to-blue flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-white font-ui font-semibold text-h2 truncate">AI Financial Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-white/70 text-sm hidden md:inline">Periode:</span>
          <select 
            value={selectedMonth}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm outline-none focus:border-white/40 cursor-pointer"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <option key={m} value={m} className="text-ink">
                {["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][m]}
              </option>
            ))}
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
        
        <button 
          onClick={generateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 h-[28px] px-3 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span className="text-xs font-medium">{isGenerating ? "Analyzing..." : "Generate Report"}</span>
        </button>

        <button 
          onClick={() => window.location.reload()}
          className="flex items-center justify-center h-[28px] px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="flex items-center justify-center h-[28px] px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded transition-colors">
          <Download className="w-4 h-4" />
        </button>
        <button className="flex items-center justify-center h-[28px] px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
