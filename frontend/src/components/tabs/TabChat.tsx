"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, SendHorizontal, Loader2, User, Bot, RotateCcw } from "lucide-react";
import { useDashboardStore } from "../../store/dashboardStore";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Mengapa pendapatan naik atau turun bulan ini dibanding bulan lalu?",
  "Segmen mana yang paling berkontribusi & mana yang paling berisiko?",
  "Proyeksikan pendapatan akhir tahun berdasarkan run-rate saat ini",
  "Analisis tren laba usaha dari 2022 hingga sekarang",
  "Komponen biaya apa yang paling membebani dan kenapa?",
  "Bandingkan achievement MPO-TAD vs BPO vs MPO-RAB",
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser ? "bg-blue text-white" : "bg-blue/10 text-blue"}`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-blue text-white rounded-tr-sm" : "bg-surface-low text-ink border border-line rounded-tl-sm"}`}>
        {msg.content}
      </div>
    </div>
  );
}

export function TabChat() {
  const { selectedMonth, selectedYear } = useDashboardStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MONTH_NAMES = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          year: selectedYear,
          month: selectedMonth,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...updated, { role: "assistant", content: data.answer }]);
      } else {
        setMessages([...updated, { role: "assistant", content: "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi." }]);
      }
    } catch {
      setMessages([...updated, { role: "assistant", content: "Koneksi gagal. Pastikan Anda terhubung ke internet dan coba lagi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[640px] bg-white rounded-lg border border-line overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-line flex items-center justify-between bg-surface-low shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue/10 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue" />
          </div>
          <div>
            <h2 className="font-ui font-semibold text-ink text-sm">AI Financial Assistant</h2>
            <p className="text-xs text-muted">Data: YTD {MONTH_NAMES[selectedMonth]} {selectedYear} • GPT-4o-mini</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors px-2 py-1 rounded hover:bg-surface-high"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto gap-5">
            <div className="w-14 h-14 bg-blue/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-blue" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink mb-1">Halo! Tanya apa saja tentang data keuangan</h3>
              <p className="text-sm text-muted">
                AI ini membaca langsung dari database — angka yang diberikan akurat sesuai data YTD {MONTH_NAMES[selectedMonth]} {selectedYear}.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 bg-white border border-line rounded-full text-xs hover:border-blue hover:text-blue hover:bg-blue/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue" />
            </div>
            <div className="bg-surface-low border border-line rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-muted animate-spin" />
              <span className="text-sm text-muted">Menganalisis data...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-line shrink-0">
        <div className="flex items-end gap-2 bg-surface-low border border-line rounded-2xl p-2 focus-within:border-blue focus-within:ring-1 focus-within:ring-blue/30 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Tanya AI tentang data keuangan... (Enter untuk kirim)"
            className="flex-1 bg-transparent border-none outline-none resize-none max-h-[150px] min-h-[44px] py-2.5 px-3 text-sm text-ink placeholder:text-muted leading-relaxed"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-blue text-white rounded-xl hover:bg-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 mb-0.5"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-muted mt-2">
          Jawaban didasarkan pada data database YTD {MONTH_NAMES[selectedMonth]} {selectedYear}. Selalu verifikasi dengan laporan resmi.
        </p>
      </div>
    </div>
  );
}
