import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { financialMetrics, componentMetrics } from "@/lib/db/schema";
import { sql, eq, and, lte } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getFullData(year: number, month: number) {
  const B = 1e9;
  const fmt = (n: any) => (Number(n) / B).toFixed(2);

  // 1. P&L Summary (Lv 1)
  const plSummary = await db.execute(sql`
    SELECT category, SUM(actual) as actual, SUM(target) as target
    FROM financial_metrics
    WHERE year = ${year} AND month <= ${month} AND period_type = 'monthly'
    GROUP BY category
  `);

  // 2. Segment Analysis (Lv 2)
  const segmentData = await db.execute(sql`
    SELECT segment, category, SUM(actual) as actual, SUM(target) as target
    FROM financial_metrics
    WHERE year = ${year} AND month <= ${month} AND period_type = 'monthly'
    GROUP BY segment, category
  `);

  // 3. Drilldown Components (Lv 3) - Top 20 variances
  const componentVariances = await db.execute(sql`
    WITH current_comp AS (
      SELECT segment, component_name, category, SUM(actual) as actual
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
    SELECT c.segment, c.component_name, c.category, c.actual, p.actual as prior, (c.actual - COALESCE(p.actual, 0)) as diff
    FROM current_comp c
    LEFT JOIN prior_comp p ON c.segment = p.segment AND c.component_name = p.component_name AND c.category = p.category
    ORDER BY ABS(c.actual - COALESCE(p.actual, 0)) DESC
    LIMIT 30
  `);

  // 4. Trend Data (12 Months)
  const trendData = await db.execute(sql`
    SELECT year, month, category, SUM(actual) as actual
    FROM financial_metrics
    WHERE (year = ${year} OR year = ${year - 1}) AND period_type = 'monthly'
    GROUP BY year, month, category
    ORDER BY year ASC, month ASC
  `);

  return {
    summary: (plSummary as any).map((r: any) => `${r.category}: Akt=${fmt(r.actual)}M, Tgt=${fmt(r.target)}M`).join("\n"),
    segments: (segmentData as any).map((r: any) => `${r.segment} | ${r.category}: Akt=${fmt(r.actual)}M, Tgt=${fmt(r.target)}M`).join("\n"),
    components: (componentVariances as any).map((r: any) => `${r.segment} > ${r.component_name} (${r.category}): Akt=${fmt(r.actual)}M, Prior=${fmt(r.prior)}M, Diff=${fmt(r.diff)}M`).join("\n"),
    trends: (trendData as any).filter((r: any) => r.category === 'pendapatan' || r.category === 'laba_usaha').map((r: any) => `${r.month}/${r.year} [${r.category}]: ${fmt(r.actual)}M`).join("\n"),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { year, month } = await req.json();
    const data = await getFullData(year, month);

    const systemPrompt = `You are a Senior Financial Analyst Agent. 
Follow the mindset from 'Agent Analyst.md': Insight-driven, clear drivers, and actionable recommendations.

DATA FOR REPORT (YTD ${month}/${year}):
---
P&L SUMMARY:
${data.summary}

SEGMENT BREAKDOWN:
${data.segments}

DETAILED COMPONENT VARIANCES (Lv 3):
${data.components}

12-MONTH HISTORICAL TREND:
${data.trends}
---

OUTPUT SPECIFICATION:
Generate a structured Management Report in Markdown format.
1. EXECUTIVE SUMMARY (Mindset: Insight -> Impact -> Action)
2. P&L ANALYSIS (Explain WHY revenue/cost/profit changed using Lv 2 & Lv 3 data)
3. TREND & FORECASTING (Predict next 3 months using run-rate and historical growth. Provide 3 scenarios: Optimistic, Base, Pessimistic)
4. ACTIONABLE DECISIONS (What must management do right now?)

Use professional Indonesian language. Use 'Rp X,XX M' format.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Generate the full management report now." }],
      temperature: 0.2,
    });

    return NextResponse.json({ success: true, report: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("[REPORT API]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
