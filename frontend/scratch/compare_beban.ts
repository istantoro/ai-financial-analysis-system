import { db } from "../src/lib/db";
import { componentMetrics } from "../src/lib/db/schema";
import { sql, and, eq, lte } from "drizzle-orm";

async function compare() {
  const year = 2026;
  const month = 3;

  console.log(`--- Auditing Biaya Pemasaran dan Adm Umum for YTD ${month} ${year} ---`);

  // 1. Sum of all components with category 'beban' (excluding special summary segments)
  const allBeban = await db.select({
    total: sql`sum(actual)`
  }).from(componentMetrics)
    .where(and(
      eq(componentMetrics.year, year),
      lte(componentMetrics.month, month),
      eq(componentMetrics.periodType, "monthly"),
      eq(componentMetrics.category, "beban"),
      sql`segment NOT LIKE '__reported_summary__%'`
    ));
  
  console.log("Sum of all 'beban' components (excluding summaries):", allBeban[0].total);

  // 2. Value from the special summary segment
  const summaryBeban = await db.select({
    total: sql`sum(actual)`
  }).from(componentMetrics)
    .where(and(
      eq(componentMetrics.year, year),
      lte(componentMetrics.month, month),
      eq(componentMetrics.periodType, "monthly"),
      eq(componentMetrics.segment, "__reported_summary__biaya_pemasaran_adm_umum")
    ));
  
  console.log("Value from '__reported_summary__biaya_pemasaran_adm_umum':", summaryBeban[0].total);

  // 3. Just to be sure, check if Row 2 (beban_pokok) is included in component_metrics
  // (In financial_metrics it was called 'beban_operasional')
  const catPendapatan = await db.select({
    total: sql`sum(actual)`
  }).from(componentMetrics)
    .where(and(
      eq(componentMetrics.year, year),
      lte(componentMetrics.month, month),
      eq(componentMetrics.periodType, "monthly"),
      eq(componentMetrics.category, "pendapatan"),
      sql`segment NOT LIKE '__reported_summary__%'`
    ));
  console.log("Sum of all 'pendapatan' components (excluding summaries):", catPendapatan[0].total);

  process.exit(0);
}

compare().catch(err => {
  console.error(err);
  process.exit(1);
});
