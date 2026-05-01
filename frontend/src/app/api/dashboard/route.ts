import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financialMetrics } from "@/lib/db/schema";
import { eq, sql, and, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = parseInt(searchParams.get("year")  || "2026", 10);
  const month = parseInt(searchParams.get("month") || "3",    10);

  try {
    // YTD: SUM all monthly rows for the given year where month <= selectedMonth
    const ytdMetrics = await db
      .select({
        category: financialMetrics.category,
        actual:   sql<number>`COALESCE(SUM(${financialMetrics.actual}::numeric), 0)`,
        target:   sql<number>`COALESCE(SUM(${financialMetrics.target}::numeric), 0)`,
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

    // Also fetch prior year YTD for YoY comparison
    const priorYtdMetrics = await db
      .select({
        category: financialMetrics.category,
        actual:   sql<number>`COALESCE(SUM(${financialMetrics.actual}::numeric), 0)`,
      })
      .from(financialMetrics)
      .where(
        and(
          eq(financialMetrics.year, year - 1),
          eq(financialMetrics.periodType, "monthly"),
          lte(financialMetrics.month, month)
        )
      )
      .groupBy(financialMetrics.category);

    return NextResponse.json({
      success: true,
      year,
      month,
      metrics: ytdMetrics,
      priorMetrics: priorYtdMetrics,
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
