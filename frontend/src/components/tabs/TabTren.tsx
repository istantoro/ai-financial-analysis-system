"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

export function TabTren() {
  const { selectedMonth, selectedYear } = useDashboardStore();
  const [segmen, setSegmen] = useState("Semua Segmen");
  const [rasio1, setRasio1] = useState("Cash Ratio");
  const [rasio2, setRasio2] = useState("Current Ratio");
  const [isLoading, setIsLoading] = useState(true);
  const [rawData, setRawData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/tren?year=${selectedYear}&month=${selectedMonth}&segment=${encodeURIComponent(segmen)}`);
        const d = await res.json();
        if (d.success) setRawData(d.data);
      } catch (err) {
        console.error("Failed to fetch trend data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth, segmen]);

  // Process data for charts
  const processedData = useMemo(() => {
    if (!rawData) return null;

    // 1. Generate month labels (12 months back from selected)
    const labels: string[] = [];
    const periods: { y: number; m: number }[] = [];
    for (let i = 12; i >= 0; i--) {
      let m = selectedMonth - i;
      let y = selectedYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      labels.push(`${MONTH_NAMES[m]} ${y % 100}`);
      periods.push({ y, m });
    }

    // 2. Extract P&L values
    const dataPendapatan = periods.map(p => {
      const match = rawData.plData.find((d: any) => d.year === p.y && d.month === p.m && d.category === "pendapatan");
      return (Number(match?.actual) || 0) / 1e9;
    });
    const dataBeban = periods.map(p => {
      const match = rawData.plData.find((d: any) => d.year === p.y && d.month === p.m && d.category === "beban_operasional");
      return (Number(match?.actual) || 0) / 1e9;
    });
    const dataLabaUsaha = periods.map(p => {
      const match = rawData.plData.find((d: any) => d.year === p.y && d.month === p.m && d.category === "laba_usaha");
      return (Number(match?.actual) || 0) / 1e9;
    });

    // 3. Extract Ratio values
    const calculateRatio = (y: number, m: number, type: string) => {
      const getAcc = (code: string) => Number(rawData.neracaData.find((d: any) => d.year === y && d.month === m && d.accountCode.startsWith(code))?.actual) || 0;
      
      const kas = getAcc("NR007");
      const bank = getAcc("NR008");
      const deposito = getAcc("NR009");
      const piutang = getAcc("NR018");
      const asetLancar = getAcc("NR006") || getAcc("NR024");
      const liabLancar = getAcc("NR051");

      if (liabLancar === 0) return 0;
      if (type === "Cash Ratio") return (kas + bank + deposito) / liabLancar;
      if (type === "Quick Ratio") return (kas + bank + deposito + piutang) / liabLancar;
      if (type === "Current Ratio") return asetLancar / liabLancar;
      return 0;
    };

    const dataRasio1 = periods.map(p => calculateRatio(p.y, p.m, rasio1));
    const dataRasio2 = periods.map(p => calculateRatio(p.y, p.m, rasio2));

    return { labels, dataPendapatan, dataBeban, dataLabaUsaha, dataRasio1, dataRasio2 };
  }, [rawData, selectedYear, selectedMonth, rasio1, rasio2]);

  const topChartData = {
    labels: processedData?.labels || [],
    datasets: [
      {
        label: "Pendapatan",
        data: processedData?.dataPendapatan || [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Beban (COGS)",
        data: processedData?.dataBeban || [],
        borderColor: "#a16207",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Laba Usaha",
        data: processedData?.dataLabaUsaha || [],
        borderColor: "#059669",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const bottomChartData = {
    labels: processedData?.labels || [],
    datasets: [
      {
        label: rasio1,
        data: processedData?.dataRasio1 || [],
        borderColor: "#3b82f6",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: rasio2,
        data: processedData?.dataRasio2 || [],
        borderColor: "#f97316",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      y: {
        ticks: { font: { size: 10 }, color: "#6b7280" },
        grid: { color: "#f3f4f6" },
      },
      x: {
        ticks: { font: { size: 10 }, color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Chart Card */}
      <div className="bg-white border border-line rounded-xl shadow-sm relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 text-blue animate-spin" />
          </div>
        )}
        <div className="p-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy font-ui">Tren 12 Bulan Terakhir</h2>
            <p className="text-sm text-muted">
              Data historis untuk {segmen} (dalam Miliar Rp).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-ink">Segmen bisnis</span>
            <select
              value={segmen}
              onChange={(e) => setSegmen(e.target.value)}
              className="px-3 py-1.5 border border-line rounded bg-surface-low text-sm font-medium text-ink focus:outline-none focus:border-blue transition-colors cursor-pointer"
            >
              <option value="Semua Segmen">Semua Segmen</option>
              <option value="MPO - TAD">MPO - TAD</option>
              <option value="MPO - RAB">MPO - RAB</option>
              <option value="BPO">BPO</option>
              <option value="KPO - DIKLAT">KPO - DIKLAT</option>
              <option value="KPO - TRAINING">KPO - TRAINING</option>
            </select>
          </div>
        </div>
        <div className="p-6 h-[400px]">
          <Line data={topChartData} options={commonOptions} />
        </div>
      </div>

      {/* Bottom Chart Card */}
      <div className="bg-white border border-line rounded-xl shadow-sm relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 text-blue animate-spin" />
          </div>
        )}
        <div className="p-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy font-ui">Perbandingan Tren Rasio</h2>
            <p className="text-sm text-muted">
              Bandingkan dua rasio pilihan dalam window periode yang sama.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue">Rasio 1</span>
              <select
                value={rasio1}
                onChange={(e) => setRasio1(e.target.value)}
                className="px-3 py-1.5 border border-blue/40 rounded bg-blue/5 text-sm font-medium text-blue focus:outline-none focus:border-blue"
              >
                <option value="Cash Ratio">Cash Ratio</option>
                <option value="Quick Ratio">Quick Ratio</option>
                <option value="Current Ratio">Current Ratio</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-orange-500">Rasio 2</span>
              <select
                value={rasio2}
                onChange={(e) => setRasio2(e.target.value)}
                className="px-3 py-1.5 border border-orange-500/40 rounded bg-orange-50 text-sm font-medium text-orange-500 focus:outline-none focus:border-orange-500"
              >
                <option value="Cash Ratio">Cash Ratio</option>
                <option value="Quick Ratio">Quick Ratio</option>
                <option value="Current Ratio">Current Ratio</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 h-[400px]">
          <Line data={bottomChartData} options={commonOptions} />
        </div>
      </div>
    </div>
  );
}
