import { NextRequest, NextResponse } from "next/server";

// Cache API response for 60 seconds — reduces repeated DB queries on tab switch
export const revalidate = 60;
import { db } from "@/lib/db";
import { financialMetrics, componentMetrics } from "@/lib/db/schema";
import { eq, sql, and, lte, inArray } from "drizzle-orm";

async function fetchYtd(year: number, month: number) {
  const finData = await db
    .select({
      category: financialMetrics.category,
      actual: sql<number>`COALESCE(SUM(${financialMetrics.actual}::numeric), 0)`,
      target: sql<number>`COALESCE(SUM(${financialMetrics.target}::numeric), 0)`,
    })
    .from(financialMetrics)
    .where(
      and(
        eq(financialMetrics.year, year),
        eq(financialMetrics.periodType, "monthly"),
        lte(financialMetrics.month, month)
      )
    )
    .groupBy(financialMetrics.category);

  // Row 4 (beban) and Row 5 (laba_operasional) are stored in component_metrics summaries
  const opexData = await db
    .select({
      category: sql<string>`CASE 
        WHEN ${componentMetrics.segment} = '__reported_summary__biaya_pemasaran_adm_umum' THEN 'beban'
        WHEN ${componentMetrics.segment} = '__reported_summary__laba_operasional' THEN 'laba_operasional'
        ELSE 'unknown'
      END`,
      actual: sql<number>`COALESCE(SUM(${componentMetrics.actual}::numeric), 0)`,
      target: sql<number>`COALESCE(SUM(${componentMetrics.target}::numeric), 0)`,
    })
    .from(componentMetrics)
    .where(
      and(
        eq(componentMetrics.year, year),
        eq(componentMetrics.periodType, "monthly"),
        lte(componentMetrics.month, month),
        inArray(componentMetrics.segment, [
          "__reported_summary__biaya_pemasaran_adm_umum",
          "__reported_summary__laba_operasional"
        ])
      )
    )
    .groupBy(componentMetrics.segment);

  return [...finData, ...opexData];
}

async function fetchAnnual(year: number) {
  const finData = await db
    .select({
      category: financialMetrics.category,
      actual: sql<number>`COALESCE(SUM(${financialMetrics.actual}::numeric), 0)`,
      target: sql<number>`COALESCE(SUM(${financialMetrics.target}::numeric), 0)`,
    })
    .from(financialMetrics)
    .where(
      and(
        eq(financialMetrics.year, year),
        eq(financialMetrics.periodType, "annual")
      )
    )
    .groupBy(financialMetrics.category);

  // Row 4 (beban) and Row 5 (laba_operasional) are stored in component_metrics summaries
  const opexData = await db
    .select({
      category: sql<string>`CASE 
        WHEN ${componentMetrics.segment} = '__reported_summary__biaya_pemasaran_adm_umum' THEN 'beban'
        WHEN ${componentMetrics.segment} = '__reported_summary__laba_operasional' THEN 'laba_operasional'
        ELSE 'unknown'
      END`,
      actual: sql<number>`COALESCE(SUM(${componentMetrics.actual}::numeric), 0)`,
      target: sql<number>`COALESCE(SUM(${componentMetrics.target}::numeric), 0)`,
    })
    .from(componentMetrics)
    .where(
      and(
        eq(componentMetrics.year, year),
        eq(componentMetrics.periodType, "annual"),
        inArray(componentMetrics.segment, [
          "__reported_summary__biaya_pemasaran_adm_umum",
          "__reported_summary__laba_operasional"
        ])
      )
    )
    .groupBy(componentMetrics.segment);

  return [...finData, ...opexData];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = parseInt(searchParams.get("year")  || "2026", 10);
  const month = parseInt(searchParams.get("month") || "3",    10);

  try {
    const [ytdCurrent, ytdPrior, annual] = await Promise.all([
      fetchYtd(year, month),
      fetchYtd(year - 1, month),
      fetchAnnual(year - 1),
    ]);

    return NextResponse.json(
      { success: true, ytdCurrent, ytdPrior, annual },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (error) {
    console.error("[GET /api/ringkasan]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
