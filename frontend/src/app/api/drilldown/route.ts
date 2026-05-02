import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financialMetrics, componentMetrics } from "@/lib/db/schema";
import { eq, sql, and, lte, inArray } from "drizzle-orm";

async function fetchSegments(year: number, month: number, category: string) {
  return db
    .select({
      label: financialMetrics.segment,
      actual: sql<number>`COALESCE(SUM(${financialMetrics.actual}::numeric), 0)`,
      target: sql<number>`COALESCE(SUM(${financialMetrics.target}::numeric), 0)`,
    })
    .from(financialMetrics)
    .where(
      and(
        eq(financialMetrics.year, year),
        eq(financialMetrics.periodType, "monthly"),
        lte(financialMetrics.month, month),
        eq(financialMetrics.category, category)
      )
    )
    .groupBy(financialMetrics.segment);
}

async function fetchComponents(year: number, month: number, category: string, segment: string) {
  // Map category names if needed (e.g. from P&L row name to DB category)
  let dbCategory = category.toLowerCase();
  if (dbCategory.includes("pendapatan")) dbCategory = "pendapatan";
  if (dbCategory.includes("beban") || dbCategory.includes("biaya")) dbCategory = "beban";

  return db
    .select({
      label: componentMetrics.componentName,
      actual: sql<number>`COALESCE(SUM(${componentMetrics.actual}::numeric), 0)`,
      target: sql<number>`COALESCE(SUM(${componentMetrics.target}::numeric), 0)`,
    })
    .from(componentMetrics)
    .where(
      and(
        eq(componentMetrics.year, year),
        eq(componentMetrics.periodType, "monthly"),
        lte(componentMetrics.month, month),
        eq(componentMetrics.category, dbCategory),
        eq(componentMetrics.segment, segment)
      )
    )
    .groupBy(componentMetrics.componentName);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year     = parseInt(searchParams.get("year") || "2026", 10);
  const month    = parseInt(searchParams.get("month") || "3", 10);
  const category = searchParams.get("category") || "";
  const segment  = searchParams.get("segment") || "";

  try {
    // Determine depth: if segment is provided, we fetch Level 3 (Components)
    if (segment) {
      // Special logic for Laba Usaha in Level 3 (shows Pendapatan vs Beban for that segment)
      if (category.toLowerCase().includes("laba usaha")) {
        const [pen, beb] = await Promise.all([
          fetchSegments(year, month, "pendapatan"),
          fetchSegments(year, month, "beban_operasional")
        ]);
        const p = pen.find(r => r.label === segment);
        const b = beb.find(r => r.label === segment);
        
        return NextResponse.json({
          success: true,
          rows: [
            { label: "Pendapatan", actual: p?.actual ?? 0, target: p?.target ?? 0, hasChildren: false },
            { label: "Beban",      actual: b?.actual ?? 0, target: b?.target ?? 0, hasChildren: false },
            { label: "Laba Usaha (Hasil)", actual: (p?.actual ?? 0) - (b?.actual ?? 0), target: (p?.target ?? 0) - (b?.target ?? 0), hasChildren: false, isSubtotal: true }
          ]
        });
      }

      const components = await fetchComponents(year, month, category, segment);
      const prior = await fetchComponents(year - 1, month, category, segment);
      const annual = await fetchComponents(year - 1, 12, category, segment);

      return NextResponse.json({
        success: true,
        rows: components.map(c => ({
          ...c,
          prior: prior.find(p => p.label === c.label)?.actual ?? 0,
          annual: annual.find(a => a.label === c.label)?.actual ?? 0,
          hasChildren: false
        }))
      });
    }

    // Fetch Level 2 (Segments)
    let dbCat = category.toLowerCase();
    
    // Special handling for Biaya Pemasaran (Row 4)
    if (dbCat.includes("pemasaran") || dbCat.includes("adm umum")) {
      const segments = [
        'Biaya Pemasaran', 
        'Biaya Remunerasi Pekerja', 
        'Biaya Tenaga Kerja Lainnya',
        'Biaya Penyusutan Aktiva Tetap', 
        'Biaya Transportasi dan Perjalanan', 
        'Biaya Operasional Kantor'
      ];

      const fetchCompSegments = async (y: number, m: number, isAnnual: boolean) => {
        return db
          .select({
            label: componentMetrics.segment,
            actual: sql<number>`COALESCE(SUM(${componentMetrics.actual}::numeric), 0)`,
            target: sql<number>`COALESCE(SUM(${componentMetrics.target}::numeric), 0)`,
          })
          .from(componentMetrics)
          .where(
            and(
              eq(componentMetrics.year, y),
              isAnnual ? eq(componentMetrics.periodType, "annual") : and(eq(componentMetrics.periodType, "monthly"), lte(componentMetrics.month, m)),
              inArray(componentMetrics.segment, segments)
            )
          )
          .groupBy(componentMetrics.segment);
      };

      const [curr, pri, ann] = await Promise.all([
        fetchCompSegments(year, month, false),
        fetchCompSegments(year - 1, month, false),
        fetchCompSegments(year - 1, 12, true)
      ]);

      return NextResponse.json({
        success: true,
        rows: curr.map(c => ({
          ...c,
          prior: pri.find(p => p.label === c.label)?.actual ?? 0,
          annual: ann.find(a => a.label === c.label)?.actual ?? 0,
          hasChildren: true
        }))
      });
    }

    if (dbCat.includes("pendapatan")) dbCat = "pendapatan";
    else if (dbCat.includes("laba usaha")) dbCat = "laba_usaha";
    else if (dbCat.includes("biaya non ops") || dbCat.includes("beban non ops")) dbCat = "beban_non_operasional";
    else if (dbCat.includes("pendapatan non ops")) dbCat = "pendapatan_non_operasional";
    else dbCat = "beban_operasional";

    const [curr, pri, ann] = await Promise.all([
      fetchSegments(year, month, dbCat),
      fetchSegments(year - 1, month, dbCat),
      fetchSegments(year - 1, 12, dbCat)
    ]);

    return NextResponse.json({
      success: true,
      rows: curr.map(c => ({
        ...c,
        prior: pri.find(p => p.label === c.label)?.actual ?? 0,
        annual: ann.find(a => a.label === c.label)?.actual ?? 0,
        hasChildren: true // Level 2 can drill to Level 3
      }))
    });

  } catch (error) {
    console.error("[GET /api/drilldown]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
