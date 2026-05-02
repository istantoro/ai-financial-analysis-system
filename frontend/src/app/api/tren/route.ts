import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financialMetrics, neracaMetrics } from "@/lib/db/schema";
import { eq, sql, and, lte, gte, or } from "drizzle-orm";

async function fetchTrendData(year: number, month: number, segment: string = "Semua Segmen") {
  // Calculate start period (12 months ago)
  let startYear = year;
  let startMonth = month - 12;
  if (startMonth <= 0) {
    startYear -= 1;
    startMonth += 12;
  }

  // 1. P&L Trend (Pendapatan, Beban, Laba Usaha)
  const plFilters = [
    eq(financialMetrics.periodType, "monthly"),
    or(
      and(eq(financialMetrics.year, year), lte(financialMetrics.month, month)),
      and(eq(financialMetrics.year, startYear), gte(financialMetrics.month, startMonth)),
      and(sql`${financialMetrics.year} > ${startYear}`, sql`${financialMetrics.year} < ${year}`)
    )
  ];

  if (segment !== "Semua Segmen") {
    plFilters.push(eq(financialMetrics.segment, segment));
  }

  const plData = await db
    .select({
      year: financialMetrics.year,
      month: financialMetrics.month,
      category: financialMetrics.category,
      actual: sql<number>`SUM(${financialMetrics.actual}::numeric)`,
    })
    .from(financialMetrics)
    .where(and(...plFilters))
    .groupBy(financialMetrics.year, financialMetrics.month, financialMetrics.category)
    .orderBy(financialMetrics.year, financialMetrics.month);

  // 2. Ratio Trend (Needed for Cash/Current Ratio)
  // We need Cash, Current Assets, and Current Liabilities for each month
  const neracaData = await db
    .select({
      year: neracaMetrics.year,
      month: neracaMetrics.month,
      accountCode: neracaMetrics.accountCode,
      actual: sql<number>`SUM(${neracaMetrics.actual}::numeric)`,
    })
    .from(neracaMetrics)
    .where(and(
      eq(neracaMetrics.periodType, "monthly"),
      or(
        and(eq(neracaMetrics.year, year), lte(neracaMetrics.month, month)),
        and(eq(neracaMetrics.year, startYear), gte(neracaMetrics.month, startMonth)),
        and(sql`${neracaMetrics.year} > ${startYear}`, sql`${neracaMetrics.year} < ${year}`)
      )
    ))
    .groupBy(neracaMetrics.year, neracaMetrics.month, neracaMetrics.accountCode);

  return { plData, neracaData };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || "2026");
  const month = parseInt(searchParams.get("month") || "3");
  const segment = searchParams.get("segment") || "Semua Segmen";

  try {
    const data = await fetchTrendData(year, month, segment);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[GET /api/tren]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
