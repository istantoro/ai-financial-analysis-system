"use client";

import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";
import { formatRupiah, formatPersen } from "../../lib/formatters";

export function KpiCards() {
  const { kpiData, priorKpiData, isLoading } = useDashboardStore();

  const getMetric = (data: typeof kpiData, category: string) =>
    data.find(m => m.category === category) ?? { actual: 0, target: 0 };

  const pendapatan   = getMetric(kpiData, "pendapatan");
  const labaUsaha    = getMetric(kpiData, "laba_usaha");
  const labaSebPajak = getMetric(kpiData, "laba_sebelum_pajak");

  const priorPendapatan   = getMetric(priorKpiData, "pendapatan");
  const priorLabaUsaha    = getMetric(priorKpiData, "laba_usaha");
  const priorLabaSebPajak = getMetric(priorKpiData, "laba_sebelum_pajak");

  const getAchiv = (a: number | string, t: number | string) => {
    const act = Number(a) || 0;
    const tgt = Number(t) || 0;
    return tgt === 0 ? 0 : (act / tgt) * 100;
  };

  const getYoY = (curr: number | string, prior: number | string) => {
    const c = Number(curr) || 0;
    const p = Number(prior) || 0;
    if (p === 0) return 0;
    return ((c - p) / p) * 100;
  };

  const getDelta = (curr: number | string, prior: number | string) => {
    const yoy = getYoY(curr, prior);
    return `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`;
  };

  
  const getStatus = (achiv: number) => achiv >= 100 ? "OK" : achiv >= 85 ? "Perhatian" : "Risiko";

  const cards = [
    { 
      label: "Pendapatan YTD", 
      value: formatRupiah(pendapatan.actual), 
      target: formatRupiah(pendapatan.target), 
      achiv: formatPersen(getAchiv(pendapatan.actual, pendapatan.target)), 
      delta: getDelta(pendapatan.actual, priorPendapatan.actual),
      status: getStatus(getAchiv(pendapatan.actual, pendapatan.target)),
    },
    { 
      label: "Laba Usaha YTD", 
      value: formatRupiah(labaUsaha.actual), 
      target: formatRupiah(labaUsaha.target), 
      achiv: formatPersen(getAchiv(labaUsaha.actual, labaUsaha.target)), 
      delta: getDelta(labaUsaha.actual, priorLabaUsaha.actual),
      status: getStatus(getAchiv(labaUsaha.actual, labaUsaha.target)),
    },
    { 
      label: "Laba Sebelum Pajak YTD", 
      value: formatRupiah(labaSebPajak.actual), 
      target: formatRupiah(labaSebPajak.target), 
      achiv: formatPersen(getAchiv(labaSebPajak.actual, labaSebPajak.target)), 
      delta: getDelta(labaSebPajak.actual, priorLabaSebPajak.actual),
      status: getStatus(getAchiv(labaSebPajak.actual, labaSebPajak.target)),
    },
    { 
      label: "Beban Operasional YTD", 
      value: formatRupiah(getMetric(kpiData, "beban_operasional").actual), 
      target: formatRupiah(getMetric(kpiData, "beban_operasional").target), 
      achiv: formatPersen(getAchiv(getMetric(kpiData, "beban_operasional").actual, getMetric(kpiData, "beban_operasional").target)), 
      delta: getDelta(getMetric(kpiData, "beban_operasional").actual, getMetric(priorKpiData, "beban_operasional").actual),
      status: getStatus(getAchiv(getMetric(kpiData, "beban_operasional").actual, getMetric(kpiData, "beban_operasional").target)),
    },
  ];

  if (isLoading && kpiData.length === 0) {
    return <div className="flex h-[180px] items-center justify-center"><Loader2 className="animate-spin text-white w-8 h-8"/></div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((kpi, idx) => (
        <div key={idx} className="bg-navy2 text-white border border-white/10 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-white/70 text-sm font-ui">{kpi.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${kpi.status === 'OK' ? 'bg-green-bg text-success' : 'bg-amber-bg text-warning'}`}>
              {kpi.status}
            </span>
          </div>
          <div className="font-mono text-3xl font-bold mb-2">
            {kpi.value}
          </div>
          <div className="text-white/50 text-xs font-mono mb-1">
            Target: {kpi.target}
          </div>
          <div className="flex items-center gap-2 font-mono text-sm">
            <span>Achiv: {kpi.achiv}</span>
            <span className={`flex items-center ${kpi.delta.startsWith('+') ? 'text-success' : 'text-danger'}`}>
              {kpi.delta.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {kpi.delta}
            </span>
          </div>
          {/* Sparkline Placeholder */}
          <div className="h-8 mt-3 flex items-end gap-1">
            {[40, 60, 45, 80, 50, 75].map((h, i) => (
              <div key={i} className="bg-blue flex-1 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
