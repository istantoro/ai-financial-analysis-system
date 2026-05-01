import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financialMetrics } from "@/lib/db/schema";
import { eq, sql, and, lte, inArray } from "drizzle-orm";

async function fetchYtd(year: number, month: number) {
  return db
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
}

async function fetchAnnual(year: number) {
  return db
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

    return NextResponse.json({
      success: true,
      ytdCurrent,
      ytdPrior,
      annual,
    });
  } catch (error) {
    console.error("[GET /api/ringkasan]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
