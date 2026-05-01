import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { neracaMetrics } from "@/lib/db/schema";
import { eq, sql, and, lte } from "drizzle-orm";

async function fetchNeraca(year: number, month: number) {
  return db
    .select({
      accountCode:  neracaMetrics.accountCode,
      accountName:  neracaMetrics.accountName,
      accountGroup: neracaMetrics.accountGroup,
      actual: sql<number>`COALESCE(SUM(${neracaMetrics.actual}::numeric), 0)`,
      target: sql<number>`COALESCE(SUM(${neracaMetrics.target}::numeric), 0)`,
    })
    .from(neracaMetrics)
    .where(
      and(
        eq(neracaMetrics.year, year),
        eq(neracaMetrics.periodType, "monthly"),
        lte(neracaMetrics.month, month)
      )
    )
    .groupBy(neracaMetrics.accountCode, neracaMetrics.accountName, neracaMetrics.accountGroup)
    .orderBy(neracaMetrics.accountCode);
}

async function fetchNeracaAnnual(year: number) {
  return db
    .select({
      accountCode:  neracaMetrics.accountCode,
      accountName:  neracaMetrics.accountName,
      accountGroup: neracaMetrics.accountGroup,
      actual: sql<number>`COALESCE(SUM(${neracaMetrics.actual}::numeric), 0)`,
    })
    .from(neracaMetrics)
    .where(
      and(
        eq(neracaMetrics.year, year),
        eq(neracaMetrics.periodType, "annual")
      )
    )
    .groupBy(neracaMetrics.accountCode, neracaMetrics.accountName, neracaMetrics.accountGroup)
    .orderBy(neracaMetrics.accountCode);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = parseInt(searchParams.get("year")  || "2026", 10);
  const month = parseInt(searchParams.get("month") || "3",    10);

  try {
    const [current, prior, annual] = await Promise.all([
      fetchNeraca(year, month),
      fetchNeraca(year - 1, month),
      fetchNeracaAnnual(year - 1),
    ]);

    return NextResponse.json({ success: true, current, prior, annual });
  } catch (error) {
    console.error("[GET /api/neraca]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
