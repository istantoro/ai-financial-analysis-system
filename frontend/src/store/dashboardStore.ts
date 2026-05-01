import { create } from 'zustand';

interface KpiMetric {
  category: string;
  actual: number;
  target: number;
}

interface DashboardState {
  selectedMonth: number;
  selectedYear: number;
  kpiData: KpiMetric[];
  priorKpiData: KpiMetric[];
  isLoading: boolean;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  fetchData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  selectedMonth: 3,
  selectedYear: 2026,
  kpiData: [],
  priorKpiData: [],
  isLoading: false,
  setMonth: (month) => {
    set({ selectedMonth: month });
    get().fetchData();
  },
  setYear: (year) => {
    set({ selectedYear: year });
    get().fetchData();
  },
  fetchData: async () => {
    const { selectedYear, selectedMonth } = get();
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/dashboard?year=${selectedYear}&month=${selectedMonth}`);
      const json = await res.json();
      if (json.success) {
        set({
          kpiData: json.metrics,
          priorKpiData: json.priorMetrics,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

