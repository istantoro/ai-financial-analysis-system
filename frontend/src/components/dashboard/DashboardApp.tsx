"use client";

import { useEffect } from "react";
import { KpiCards } from "./KpiCards";
import { MainTabs } from "./MainTabs";
import { useDashboardStore } from "../../store/dashboardStore";

export function DashboardApp() {
  const { fetchData } = useDashboardStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-[24px] flex flex-col gap-[32px] max-w-[1600px] mx-auto">
      <KpiCards />
      <MainTabs />
    </div>
  );
}
