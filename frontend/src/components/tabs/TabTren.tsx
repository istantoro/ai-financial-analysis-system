import { useState } from "react";
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

const months = ["Mar 25", "Apr 25", "Mei 25", "Jun 25", "Jul 25", "Agu 25", "Sep 25", "Okt 25", "Nov 25", "Des 25", "Jan 26", "Feb 26", "Mar 26"];

// Mock Data for Top Chart (Tren P&L)
const dataPendapatan = [540, 330, 340, 345, 335, 325, 360, 345, 375, 385, 355, 350, 470];
const dataBeban = [510, 310, 315, 318, 305, 285, 320, 305, 325, 335, 330, 320, 430];
const dataLabaUsaha = [30, 20, 25, 27, 30, 40, 40, 40, 50, 50, 25, 30, 40];

// Mock Data for Bottom Chart (Rasio)
const dataCashRatio = [2.5, 1.3, 1.6, 1.7, 2.1, 2.0, 1.7, 1.6, 1.9, 3.6, 2.9, 1.6, 1.5];
const dataCurrentRatio = [6.2, 3.7, 4.3, 4.6, 5.3, 5.2, 3.4, 3.2, 4.1, 6.9, 6.1, 2.9, 3.0];

export function TabTren() {
  const [segmen, setSegmen] = useState("Semua Segmen");
  const [rasio1, setRasio1] = useState("Cash Ratio");
  const [rasio2, setRasio2] = useState("Current Ratio");

  const topChartData = {
    labels: months,
    datasets: [
      {
        label: "Pendapatan",
        data: dataPendapatan,
        borderColor: "#3b82f6", // blue
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: "white",
        pointBorderColor: "#3b82f6",
      },
      {
        label: "Beban (COGS)",
        data: dataBeban,
        borderColor: "#a16207", // brown/orange
        backgroundColor: "rgba(161, 98, 7, 0.0)",
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "white",
        pointBorderColor: "#a16207",
      },
      {
        label: "Laba Usaha",
        data: dataLabaUsaha,
        borderColor: "#059669", // green
        backgroundColor: "rgba(5, 150, 105, 0.0)",
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "white",
        pointBorderColor: "#059669",
      },
    ],
  };

  const topChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: false,
          boxWidth: 40,
          boxHeight: 12,
          padding: 20,
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 600,
        ticks: {
          stepSize: 100,
          callback: (value: any) => `${value} B`,
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
          color: "#6b7280",
        },
        grid: {
          color: "#f3f4f6",
        },
        border: {
          display: false,
        },
      },
      x: {
        ticks: {
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
          color: "#6b7280",
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  const bottomChartData = {
    labels: months,
    datasets: [
      {
        label: "Cash Ratio",
        data: dataCashRatio,
        borderColor: "#3b82f6", // blue
        backgroundColor: "rgba(59, 130, 246, 0)",
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "white",
        pointBorderColor: "#3b82f6",
      },
      {
        label: "Current Ratio",
        data: dataCurrentRatio,
        borderColor: "#f97316", // orange
        backgroundColor: "rgba(249, 115, 22, 0)",
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "white",
        pointBorderColor: "#f97316",
      },
    ],
  };

  const bottomChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: false,
          boxWidth: 40,
          boxHeight: 12,
          padding: 20,
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 1,
        max: 7,
        ticks: {
          stepSize: 1,
          callback: (value: any) => `${value.toFixed(2)}x`,
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
          color: "#3b82f6", // The left axis labels are blue in screenshot
        },
        title: {
          display: true,
          text: "Cash Ratio",
          color: "#3b82f6",
          font: {
            family: "Inter, sans-serif",
            size: 12,
          },
        },
        grid: {
          color: "#f3f4f6",
        },
        border: {
          display: false,
        },
      },
      x: {
        ticks: {
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
          color: "#6b7280",
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Chart Card */}
      <div className="bg-white border border-line rounded-xl shadow-sm">
        <div className="p-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy font-ui">Tren 12 Bulan Terakhir</h2>
            <p className="text-sm text-muted">
              Window aktual terakhir untuk Semua Segmen, saat ini Mar 25 – Mar 26.
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
          <Line data={topChartData} options={topChartOptions} />
        </div>
      </div>

      {/* Bottom Chart Card */}
      <div className="bg-white border border-line rounded-xl shadow-sm">
        <div className="p-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy font-ui">Perbandingan Tren Rasio</h2>
            <p className="text-sm text-muted">
              Bandingkan dua rasio yang dipilih pada window periode yang sama.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue">Rasio 1</span>
              <select
                value={rasio1}
                onChange={(e) => setRasio1(e.target.value)}
                className="px-3 py-1.5 border border-blue/40 rounded bg-blue/5 text-sm font-medium text-blue focus:outline-none focus:border-blue transition-colors cursor-pointer"
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
                className="px-3 py-1.5 border border-orange-500/40 rounded bg-orange-50 text-sm font-medium text-orange-500 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
              >
                <option value="Cash Ratio">Cash Ratio</option>
                <option value="Quick Ratio">Quick Ratio</option>
                <option value="Current Ratio">Current Ratio</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 h-[400px]">
          <Line data={bottomChartData} options={bottomChartOptions} />
        </div>
      </div>
    </div>
  );
}
