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
  hasFetched: boolean;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  fetchData: () => Promise<void>;
}

// Stable fetch function — defined outside store to avoid re-creation
let _isFetching = false;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  selectedMonth: 3,
  selectedYear: 2026,
  kpiData: [],
  priorKpiData: [],
  isLoading: false,
  hasFetched: false,
  setMonth: (month) => {
    set({ selectedMonth: month, hasFetched: false });
    // Defer to avoid state update collision
    setTimeout(() => get().fetchData(), 0);
  },
  setYear: (year) => {
    set({ selectedYear: year, hasFetched: false });
    setTimeout(() => get().fetchData(), 0);
  },
  fetchData: async () => {
    if (_isFetching) return; // prevent duplicate concurrent calls
    _isFetching = true;
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
          hasFetched: true,
        });
      } else {
        set({ isLoading: false, hasFetched: true });
      }
    } catch {
      set({ isLoading: false, hasFetched: true });
    } finally {
      _isFetching = false;
    }
  },
}));

