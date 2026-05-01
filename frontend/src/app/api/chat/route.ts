import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { financialMetrics, componentMetrics, neracaMetrics } from "@/lib/db/schema";
import { sql, eq, and, lte, desc } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MONTH_NAMES = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const B = 1e9;
const fmt = (n: number | string) => (Number(n) / B).toFixed(2);

async function buildFullContext(year: number, month: number) {
  // 1. Level 1 & 2: Ringkasan & Segmen dengan YoY
  const segmentsData = await db.execute(sql`
    WITH current_ytd AS (
      SELECT segment, category, SUM(actual) as actual, SUM(target) as target
      FROM financial_metrics
      WHERE year = ${year} AND month <= ${month} AND period_type = 'monthly'
      GROUP BY segment, category
    ),
    prior_ytd AS (
      SELECT segment, category, SUM(actual) as actual
      FROM financial_metrics
      WHERE year = ${year - 1} AND month <= ${month} AND period_type = 'monthly'
      GROUP BY segment, category
    )
    SELECT 
      c.segment, c.category, 
      c.actual as curr_actual, c.target as curr_target,
      p.actual as prior_actual,
      (c.actual - COALESCE(p.actual, 0)) as variance_yoy,
      (c.actual - c.target) as variance_rka
    FROM current_ytd c
    LEFT JOIN prior_ytd p ON c.segment = p.segment AND c.category = p.category
  `);

  // 2. Level 3: Analisis Varians Komponen (Penyebab Utama Naik/Turun)
  // Kita ambil Top 10 kenaikan dan Top 10 penurunan secara absolut
  const componentVariances = await db.execute(sql`
    WITH current_comp AS (
      SELECT segment, component_name, category, SUM(actual) as actual, SUM(target) as target
      FROM component_metrics
      WHERE year = ${year} AND month <= ${month} AND period_type = 'monthly'
      GROUP BY segment, component_name, category
    ),
    prior_comp AS (
      SELECT segment, component_name, category, SUM(actual) as actual
      FROM component_metrics
      WHERE year = ${year - 1} AND month <= ${month} AND period_type = 'monthly'
      GROUP BY segment, component_name, category
    )
    SELECT 
      c.segment, c.component_name, c.category,
      c.actual as curr_actual, p.actual as prior_actual,
      (c.actual - COALESCE(p.actual, 0)) as diff_yoy,
      (c.actual - c.target) as diff_rka
    FROM current_comp c
    LEFT JOIN prior_comp p ON c.segment = p.segment AND c.component_name = p.component_name AND c.category = p.category
    WHERE ABS(c.actual - COALESCE(p.actual, 0)) > 0 OR ABS(c.actual - c.target) > 0
    ORDER BY ABS(c.actual - COALESCE(p.actual, 0)) DESC
    LIMIT 40
  `);

  // 3. Ringkasan Tren Bulanan (Fakta Historis)
  const monthlyTrends = await db.execute(sql`
    SELECT year, month, category, SUM(actual) as actual
    FROM financial_metrics
    WHERE (year = ${year} OR year = ${year - 1}) AND period_type = 'monthly'
    GROUP BY year, month, category
    ORDER BY year DESC, month DESC
    LIMIT 24
  `);

  // --- Construct Context String ---
  let ctx = `DATA REAL DATABASE PT ISTANTORO HUMAN SOLUTIONS (YTD ${MONTH_NAMES[month]} ${year})\n\n`;

  ctx += `== ANALISIS VARIAN SEGMEN (LV 2) ==\n`;
  (segmentsData as any).forEach((r: any) => {
    ctx += `- ${r.segment} [${r.category}]: Akt=${fmt(r.curr_actual)}M, Prior=${fmt(r.prior_actual)}M, Var YoY=${fmt(r.variance_yoy)}M, Achiv=${((r.curr_actual/r.curr_target)*100).toFixed(1)}%\n`;
  });

  ctx += `\n== PENYEBAB UTAMA PERUBAHAN (LV 3 - DRILL DOWN) ==\n`;
  ctx += `(Daftar komponen dengan perubahan YoY paling signifikan)\n`;
  (componentVariances as any).forEach((r: any) => {
    const direction = Number(r.diff_yoy) > 0 ? "NAIK" : "TURUN";
    ctx += `- [${r.category}] ${r.segment} > ${r.component_name}: ${direction} sebesar ${fmt(Math.abs(r.diff_yoy))}M (Sekarang: ${fmt(r.curr_actual)}M vs Lalu: ${fmt(r.prior_actual)}M)\n`;
  });

  ctx += `\n== TREN HISTORIS BULANAN ==\n`;
  (monthlyTrends as any).forEach((r: any) => {
    if (r.category === 'pendapatan' || r.category === 'laba_usaha') {
      ctx += `- ${MONTH_NAMES[r.month]} ${r.year} | ${r.category}: ${fmt(r.actual)}M\n`;
    }
  });

  return ctx;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, year = 2026, month = 3 } = await req.json();
    const context = await buildFullContext(year, month);

    const systemPrompt = `Kamu adalah Auditor & Analyst Keuangan Senior.
Tugasmu: Menjelaskan alasan naik/turunnya angka keuangan berdasarkan data drill-down Level 2 dan Level 3.

DATA DARI DATABASE:
${context}

INSTRUKSI KETAT:
1. ANALISIS VARIANS: Jika ditanya "Kenapa pendapatan turun/naik?", cari komponen di "PENYEBAB UTAMA PERUBAHAN" yang memiliki selisih (diff_yoy) terbesar. Sebutkan nama komponen spesifik tersebut.
2. JANGAN BERHALUSINASI: Dilarang menyebutkan "faktor eksternal", "ekonomi makro", atau "perubahan pasar" kecuali data di atas secara spesifik menyebutkannya (misal ada komponen biaya promosi naik).
3. STRUKTUR JAWABAN:
   - Mulai dengan angka agregat (Level 1).
   - Breakdown ke Segmen yang paling berpengaruh (Level 2).
   - Sebutkan Komponen spesifik (Level 3) yang menjadi "biang keladi" perubahan.
4. FORMAT: Gunakan Bahasa Indonesia profesional, angka Rp X,XX M.
5. PREDIKSI: Gunakan tren bulanan untuk memberikan proyeksi logis.

Contoh Jawaban: "Pendapatan turun Rp 38M YoY terutama karena Segmen MPO-RAB turun Rp 20M, yang disebabkan oleh penurunan komponen 'Jasa Head Hunter Klien' sebesar Rp 15M."`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.1, // Sangat rendah agar tetap pada fakta
    });

    return NextResponse.json({ success: true, answer: completion.choices[0].message.content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
