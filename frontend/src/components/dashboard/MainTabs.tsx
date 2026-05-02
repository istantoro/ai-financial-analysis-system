"use client";

import { useState, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy-load tabs — only the active tab's code is downloaded and parsed
const TabRingkasan = lazy(() => import("../tabs/TabRingkasan").then(m => ({ default: m.TabRingkasan })));
const TabNeraca    = lazy(() => import("../tabs/TabNeraca").then(m => ({ default: m.TabNeraca })));
const TabRasio     = lazy(() => import("../tabs/TabRasio").then(m => ({ default: m.TabRasio })));
const TabTren      = lazy(() => import("../tabs/TabTren").then(m => ({ default: m.TabTren })));
const TabSimulasi  = lazy(() => import("../tabs/TabSimulasi").then(m => ({ default: m.TabSimulasi })));
const TabChat      = lazy(() => import("../tabs/TabChat").then(m => ({ default: m.TabChat })));

const TABS = [
  { id: "ringkasan", label: "Ringkasan P&L" },
  { id: "neraca",    label: "Neraca" },
  { id: "rasio",     label: "Rasio" },
  { id: "tren",      label: "Tren" },
  { id: "simulasi",  label: "Simulasi" },
  { id: "chat",      label: "Chat dengan Data" },
];

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-muted" />
    </div>
  );
}

export function MainTabs() {
  const [activeTab, setActiveTab] = useState("ringkasan");

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="flex flex-col w-full md:w-[200px] shrink-0 border-r-0 md:border-r border-line pr-0 md:pr-4 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-ui text-sm font-medium transition-colors text-left rounded-md ${
              activeTab === tab.id
                ? "bg-navy/5 text-blue font-semibold"
                : "text-muted hover:bg-surface-high hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0 bg-white border border-line rounded-lg p-4 shadow-sm w-full">
        <Suspense fallback={<TabFallback />}>
          {activeTab === "ringkasan" && <TabRingkasan />}
          {activeTab === "neraca"    && <TabNeraca />}
          {activeTab === "rasio"     && <TabRasio />}
          {activeTab === "tren"      && <TabTren />}
          {activeTab === "simulasi"  && <TabSimulasi />}
          {activeTab === "chat"      && <TabChat />}
        </Suspense>
      </div>
    </div>
  );
}
