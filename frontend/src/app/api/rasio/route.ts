import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financialMetrics, neracaMetrics } from "@/lib/db/schema";
import { eq, sql, and, lte } from "drizzle-orm";

async function getFinancialYtd(year: number, month: number) {
  const rows = await db
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
  return Object.fromEntries(rows.map(r => [r.category, r]));
}

async function getNeracaLatest(year: number, month: number) {
  const rows = await db
    .select({
      accountCode: neracaMetrics.accountCode,
      actual: sql<number>`COALESCE(SUM(${neracaMetrics.actual}::numeric), 0)`,
    })
    .from(neracaMetrics)
    .where(
      and(
        eq(neracaMetrics.year, year),
        eq(neracaMetrics.periodType, "monthly"),
        lte(neracaMetrics.month, month)
      )
    )
    .groupBy(neracaMetrics.accountCode);
  return Object.fromEntries(rows.map(r => [r.accountCode, r.actual]));
}

function safeDivide(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year  = parseInt(searchParams.get("year")  || "2026", 10);
  const month = parseInt(searchParams.get("month") || "3",    10);

  try {
    const [fin, finPrior, ner, nerPrior] = await Promise.all([
      getFinancialYtd(year, month),
      getFinancialYtd(year - 1, month),
      getNeracaLatest(year, month),
      getNeracaLatest(year - 1, month),
    ]);

    const n = (v: number | string | undefined) => Number(v) || 0;

    const pendapatan      = n(fin["pendapatan"]?.actual);
    const bebanOps        = n(fin["beban_operasional"]?.actual);
    const labaUsaha       = n(fin["laba_usaha"]?.actual);
    const labaSebPajak    = n(fin["laba_sebelum_pajak"]?.actual);
    const pendNonOps      = n(fin["pendapatan_non_operasional"]?.actual);

    const pPendapatan     = n(finPrior["pendapatan"]?.actual);
    const pLabaUsaha      = n(finPrior["laba_usaha"]?.actual);
    const pLabaSebPajak   = n(finPrior["laba_sebelum_pajak"]?.actual);

    // Neraca accounts — adjust codes to match your actual data
    const aktLancar  = n(ner["NR005_ASET_LANCAR"]  ?? ner["NR005_TOTAL_AKTIVA_LANCAR"] ?? 0);
    const kewLancar  = n(ner["NR005_KEWAJIBAN_LANCAR"] ?? ner["NR005_TOTAL_KEWAJIBAN_LANCAR"] ?? 0);
    const kas        = n(ner["NR005_KAS"] ?? 0) + n(ner["NR005_BANK"] ?? 0);
    const piutang    = n(ner["NR005_PIUTANG_BERSIH"] ?? 0);
    const totalAset  = n(ner["NR005_TOTAL_ASET"] ?? 0);
    const ekuitas    = n(ner["NR005_TOTAL_EKUITAS"] ?? 0);

    const pAktLancar = n(nerPrior["NR005_ASET_LANCAR"] ?? nerPrior["NR005_TOTAL_AKTIVA_LANCAR"] ?? 0);
    const pKewLancar = n(nerPrior["NR005_KEWAJIBAN_LANCAR"] ?? nerPrior["NR005_TOTAL_KEWAJIBAN_LANCAR"] ?? 0);
    const pKas       = n(nerPrior["NR005_KAS"] ?? 0) + n(nerPrior["NR005_BANK"] ?? 0);

    // Days in period (approximate)
    const daysInPeriod = month * 30;

    const gpm          = safeDivide(labaUsaha,    pendapatan) * 100;
    const opm          = safeDivide(labaSebPajak, pendapatan) * 100;
    const bopo         = safeDivide(bebanOps,     pendapatan) * 100;
    const currentRatio = safeDivide(aktLancar, kewLancar);
    const cashRatio    = safeDivide(kas, kewLancar);
    const dso          = safeDivide(piutang * daysInPeriod, pendapatan);
    const roa          = safeDivide(labaSebPajak, totalAset) * 100;

    const pGpm         = safeDivide(n(finPrior["laba_usaha"]?.actual), pPendapatan) * 100;
    const pOpm         = safeDivide(pLabaSebPajak, pPendapatan) * 100;
    const pBopo        = safeDivide(n(finPrior["beban_operasional"]?.actual), pPendapatan) * 100;
    const pCurrentR    = safeDivide(pAktLancar, pKewLancar);
    const pCashR       = safeDivide(pKas, pKewLancar);

    const targetGpm       = n(fin["laba_usaha"]?.target)    / Math.max(n(fin["pendapatan"]?.target), 1) * 100;
    const targetOpm       = n(fin["laba_sebelum_pajak"]?.target) / Math.max(n(fin["pendapatan"]?.target), 1) * 100;
    const targetBopo      = n(fin["beban_operasional"]?.target) / Math.max(n(fin["pendapatan"]?.target), 1) * 100;

    const ratios = [
      { key: "gpm",   label: "Gross Profit Margin",   unit: "%",    current: gpm,   prior: pGpm,   target: targetGpm,   isInverse: false },
      { key: "opm",   label: "Operating Profit Margin",unit: "%",   current: opm,   prior: pOpm,   target: targetOpm,   isInverse: false },
      { key: "bopo",  label: "BOPO",                   unit: "%",    current: bopo,  prior: pBopo,  target: targetBopo,  isInverse: true  },
      { key: "cr",    label: "Current Ratio",          unit: "x",    current: currentRatio, prior: pCurrentR, target: 1.2, isInverse: false },
      { key: "cashr", label: "Cash Ratio",             unit: "x",    current: cashRatio,    prior: pCashR,    target: 0.5, isInverse: false },
      { key: "dso",   label: "Days Sales Outstanding", unit: "hari", current: dso,   prior: 0,      target: 45,  isInverse: true  },
      { key: "roa",   label: "Return on Assets",       unit: "%",    current: roa,   prior: 0,      target: 5,   isInverse: false },
    ].map(r => {
      const achiv = r.isInverse
        ? (r.current <= 0 ? 100 : safeDivide(r.target, r.current) * 100)
        : safeDivide(r.current, r.target) * 100;
      const yoyDelta = r.current - r.prior;
      const status = achiv >= 100 ? "OK" : achiv >= 85 ? "Perhatian" : "Risiko";
      return { ...r, achiv, yoyDelta, status };
    });

    return NextResponse.json({ success: true, ratios });
  } catch (error) {
    console.error("[GET /api/rasio]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
