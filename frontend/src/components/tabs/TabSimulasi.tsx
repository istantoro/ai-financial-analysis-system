import { useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";

const SEGMENTS = [
  "MPO - TAD",
  "MPO - RAB",
  "BPO",
  "KPO - DIKLAT",
  "KPO - TRAINING",
];

const SCENARIOS = [
  {
    id: "dorong_pertumbuhan",
    title: "Dorong Pertumbuhan",
    desc: "Dorong segmen inti dengan kenaikan volume ringan sambil menjaga kualitas konversi kas.",
  },
  {
    id: "jaga_margin",
    title: "Jaga Margin",
    desc: "Fokus pada efisiensi biaya dan OPEX sambil mempercepat penagihan.",
  },
  {
    id: "uji_tekanan",
    title: "Uji Tekanan",
    desc: "Simulasi tekanan pendapatan, kenaikan biaya, dan perlambatan penagihan.",
  },
];

export function TabSimulasi() {
  const { selectedMonth, selectedYear } = useDashboardStore();
  
  // Custom Slider Style Class
  const sliderClass = `w-full h-1 bg-surface-high rounded-lg appearance-none cursor-pointer focus:outline-none 
    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
    [&::-webkit-slider-thumb]:bg-blue [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer`;

  const [activeScenario, setActiveScenario] = useState("dorong_pertumbuhan");
  const [segmentValues, setSegmentValues] = useState<Record<string, number>>(
    SEGMENTS.reduce((acc, seg) => ({ ...acc, [seg]: 0 }), {})
  );
  
  const [biaya, setBiaya] = useState(0);
  const [opex, setOpex] = useState(0);
  const [dso, setDso] = useState(0);

  const handleReset = () => {
    setSegmentValues(SEGMENTS.reduce((acc, seg) => ({ ...acc, [seg]: 0 }), {}));
    setBiaya(0);
    setOpex(0);
    setDso(0);
  };

  const handleScenarioChange = (id: string) => {
    setActiveScenario(id);
    if (id === "dorong_pertumbuhan") {
      setSegmentValues(SEGMENTS.reduce((acc, seg) => ({ ...acc, [seg]: 5 }), {}));
      setBiaya(2);
      setOpex(2);
      setDso(-2);
    } else if (id === "jaga_margin") {
      setSegmentValues(SEGMENTS.reduce((acc, seg) => ({ ...acc, [seg]: 0 }), {}));
      setBiaya(-5);
      setOpex(-5);
      setDso(-5);
    } else if (id === "uji_tekanan") {
      setSegmentValues(SEGMENTS.reduce((acc, seg) => ({ ...acc, [seg]: -10 }), {}));
      setBiaya(10);
      setOpex(10);
      setDso(15);
    }
  };

  const handleSegmentChange = (seg: string, val: number) => {
    setSegmentValues(prev => ({ ...prev, [seg]: val }));
    setActiveScenario(""); // Custom
  };

  // Mock calculated results based on sliders
  const avgGrowth = Object.values(segmentValues).reduce((a, b) => a + b, 0) / SEGMENTS.length;
  const simulatedPendapatan = 1250 * (1 + avgGrowth / 100);
  const simulatedLabaKotor = simulatedPendapatan * 0.4 * (1 - biaya / 100);
  const simulatedLabaOps = simulatedLabaKotor - (100 * (1 + opex / 100));
  const simulatedKas = simulatedLabaOps * (1 - dso / 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Periode, Skenario, Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Periode Dasar */}
        <div className="bg-white border border-line rounded-xl p-5 shadow-sm col-span-1">
          <h3 className="text-xs font-bold text-muted tracking-wider mb-4 uppercase">Periode Dasar</h3>
          <div className="border border-line rounded-lg py-3 px-4 text-center mb-4">
            <span className="text-2xl font-bold text-navy font-mono">Mar 26</span>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted">
            <div className="flex justify-between">
              <span>Bulan lalu:</span>
              <span className="font-medium">Feb 26</span>
            </div>
            <div className="flex justify-between">
              <span>YoY:</span>
              <span className="font-medium">Mar 25</span>
            </div>
          </div>
        </div>

        {/* Pilihan Skenario */}
        <div className="bg-white border border-line rounded-xl p-5 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted tracking-wider uppercase">Pilihan Skenario</h3>
            <button 
              onClick={handleReset}
              className="text-xs font-medium text-ink bg-surface-high hover:bg-line px-3 py-1.5 rounded transition-colors"
            >
              Atur Ulang
            </button>
          </div>
          <p className="text-sm text-muted mb-4">
            Pilih skenario cepat, lalu sesuaikan per segmen bila diperlukan.
          </p>
          <div className="flex flex-col gap-3">
            {SCENARIOS.map(scen => (
              <button 
                key={scen.id}
                onClick={() => handleScenarioChange(scen.id)}
                className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                  activeScenario === scen.id 
                    ? 'border-blue bg-blue/5' 
                    : 'border-line bg-white hover:border-blue/50'
                }`}
              >
                <span className="font-bold text-navy mr-2">{scen.title}</span>
                <span className="text-muted text-xs leading-relaxed">{scen.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ringkasan Skenario */}
        <div className="bg-white border border-line rounded-xl p-5 shadow-sm col-span-1">
          <h3 className="text-xs font-bold text-muted tracking-wider uppercase mb-4">Ringkasan Skenario</h3>
          <div className="mb-4">
            <div className="text-2xl font-bold text-navy font-mono mb-1">
              {(simulatedLabaOps / 10).toFixed(2)} M
            </div>
            <div className="text-success text-sm font-medium">
              LBT margin +{(avgGrowth > 0 ? avgGrowth * 0.2 : avgGrowth * 0.2).toFixed(1)}%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-green-bg/50 p-3 rounded-lg">
              <div className="text-xs font-bold text-muted uppercase mb-1">Dampak Kas</div>
              <div className={`font-mono font-bold ${dso < 0 ? 'text-success' : dso > 0 ? 'text-danger' : 'text-success'}`}>
                {dso < 0 ? '+' : ''}{Math.round(-dso * 2.5)} M
              </div>
            </div>
            <div className="bg-green-bg/50 p-3 rounded-lg">
              <div className="text-xs font-bold text-muted uppercase mb-1">Perubahan DSO</div>
              <div className={`font-mono font-bold ${dso < 0 ? 'text-success' : dso > 0 ? 'text-danger' : 'text-success'}`}>
                {dso > 0 ? '+' : ''}{dso} hari
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: Segment Sliders & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Perubahan Pendapatan Per Segmen */}
        <div className="bg-white border border-line rounded-xl p-6 shadow-sm col-span-1 lg:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-muted tracking-wider uppercase">Perubahan Pendapatan Per Segmen</h3>
            <span className="bg-surface-high text-xs font-medium px-3 py-1 rounded-full text-ink">
              5 segmen aktif
            </span>
          </div>
          <p className="text-sm text-muted mb-8">
            Rentang perubahan dijaga pada `-20%` sampai `+20%` sesuai perhitungan terbaru.
          </p>

          <div className="flex flex-col gap-6">
            {SEGMENTS.map(seg => (
              <div key={seg} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy font-ui text-sm">{seg}</span>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    segmentValues[seg] > 0 ? 'bg-green-bg text-success' : 
                    segmentValues[seg] < 0 ? 'bg-amber-bg text-danger' : 'bg-surface-high text-success'
                  }`}>
                    {segmentValues[seg] > 0 ? '+' : ''}{segmentValues[seg]}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-20" max="20" step="1"
                  value={segmentValues[seg]}
                  onChange={(e) => handleSegmentChange(seg, parseInt(e.target.value))}
                  className={sliderClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Pengaturan Umum & Sinyal Utama */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-line rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-muted tracking-wider uppercase mb-6">Pengaturan Umum</h3>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-medium text-ink">
                  <span>Perubahan biaya</span>
                  <span className="font-bold font-mono text-navy">{biaya > 0 ? '+' : ''}{biaya}%</span>
                </div>
                <input 
                  type="range" min="-15" max="15" step="1"
                  value={biaya} onChange={(e) => { setBiaya(parseInt(e.target.value)); setActiveScenario(""); }}
                  className={sliderClass}
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-medium text-ink">
                  <span>Perubahan OPEX</span>
                  <span className="font-bold font-mono text-navy">{opex > 0 ? '+' : ''}{opex}%</span>
                </div>
                <input 
                  type="range" min="-15" max="15" step="1"
                  value={opex} onChange={(e) => { setOpex(parseInt(e.target.value)); setActiveScenario(""); }}
                  className={sliderClass}
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-medium text-ink">
                  <span>Perubahan DSO</span>
                  <span className="font-bold font-mono text-navy">{dso > 0 ? '+' : ''}{dso} hari</span>
                </div>
                <input 
                  type="range" min="-30" max="30" step="1"
                  value={dso} onChange={(e) => { setDso(parseInt(e.target.value)); setActiveScenario(""); }}
                  className={sliderClass}
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-line rounded-xl p-5 shadow-sm flex-1">
            <h3 className="text-xs font-bold text-muted tracking-wider uppercase mb-4">Sinyal Utama</h3>
            <div className="text-2xl font-bold text-navy font-ui mb-2">MPO - TAD</div>
            <p className="text-sm text-muted leading-relaxed">
              Pertumbuhan masih bisa dikejar, tetapi perlu kendali biaya dan penagihan yang ketat.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Row: Colorful Result Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1d4ed8] rounded-xl p-5 text-white flex flex-col justify-between shadow-sm min-h-[100px]">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-100">Pendapatan Skenario</div>
          <div className="text-2xl font-bold font-mono mt-2">{simulatedPendapatan.toFixed(1)} M</div>
        </div>
        
        <div className="bg-[#047857] rounded-xl p-5 text-white flex flex-col justify-between shadow-sm min-h-[100px]">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">Laba Kotor Skenario</div>
          <div className="text-2xl font-bold font-mono mt-2">{simulatedLabaKotor.toFixed(1)} M</div>
        </div>
        
        <div className="bg-[#7e22ce] rounded-xl p-5 text-white flex flex-col justify-between shadow-sm min-h-[100px]">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-100">Laba Operasional</div>
          <div className="text-2xl font-bold font-mono mt-2">{simulatedLabaOps.toFixed(1)} M</div>
        </div>
        
        <div className="bg-[#b45309] rounded-xl p-5 text-white flex flex-col justify-between shadow-sm min-h-[100px]">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-100">Kas Proyeksi</div>
          <div className="text-2xl font-bold font-mono mt-2">{simulatedKas.toFixed(1)} M</div>
        </div>
      </div>
      
    </div>
  );
}
