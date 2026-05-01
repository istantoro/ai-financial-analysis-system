"use client";

import { useState } from "react";
import { TabRingkasan } from "../tabs/TabRingkasan";
import { TabNeraca } from "../tabs/TabNeraca";
import { TabRasio } from "../tabs/TabRasio";
import { TabTren } from "../tabs/TabTren";
import { TabSimulasi } from "../tabs/TabSimulasi";
import { TabChat } from "../tabs/TabChat";

const TABS = [
  { id: "ringkasan", label: "Ringkasan P&L" },
  { id: "neraca", label: "Neraca" },
  { id: "rasio", label: "Rasio" },
  { id: "tren", label: "Tren" },
  { id: "simulasi", label: "Simulasi" },
  { id: "chat", label: "Chat dengan Data" },
];

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
        {activeTab === "ringkasan" && <TabRingkasan />}
        {activeTab === "neraca" && <TabNeraca />}
        {activeTab === "rasio" && <TabRasio />}
        {activeTab === "tren" && <TabTren />}
        {activeTab === "simulasi" && <TabSimulasi />}
        {activeTab === "chat" && <TabChat />}
      </div>
    </div>
  );
}
