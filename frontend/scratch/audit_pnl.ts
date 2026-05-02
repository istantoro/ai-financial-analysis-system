import { db } from "../src/lib/db";
import { financialMetrics, componentMetrics } from "../src/lib/db/schema";
import { sql, and, eq } from "drizzle-orm";

async function auditPnL() {
  const year = 2026;
  const month = 3;

  console.log(`--- P&L Audit for ${month}/${year} (MONTHLY ONLY) ---`);

  const finRows = await db.select({
    category: financialMetrics.category,
    actual: financialMetrics.actual,
    target: financialMetrics.target,
    segment: financialMetrics.segment
  }).from(financialMetrics)
    .where(and(
      eq(financialMetrics.year, year),
      eq(financialMetrics.month, month),
      eq(financialMetrics.periodType, "monthly")
    ));
  
  console.log("\nFinancial Metrics (by category):");
  const finSummary: any = {};
  finRows.forEach(r => {
    if (!finSummary[r.category]) finSummary[r.category] = 0;
    finSummary[r.category] += Number(r.actual);
  });
  console.table(finSummary);

  const compSummaryRows = await db.select({
    segment: componentMetrics.segment,
    actual: componentMetrics.actual,
    target: componentMetrics.target,
    name: componentMetrics.componentName
  }).from(componentMetrics)
    .where(and(
      eq(componentMetrics.year, year),
      eq(componentMetrics.month, month),
      eq(componentMetrics.periodType, "monthly"),
      sql`segment LIKE '__reported_summary__%'`
    ));
  
  console.log("\nReported Summary Components:");
  console.table(compSummaryRows);

  process.exit(0);
}

auditPnL().catch(err => {
  console.error(err);
  process.exit(1);
});
