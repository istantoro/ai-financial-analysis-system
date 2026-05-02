import { db } from "../src/lib/db";
import { financialMetrics } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

async function audit() {
  console.log("--- Unique Categories in financial_metrics ---");
  const categories = await db.select({ 
    category: financialMetrics.category,
    count: sql`count(*)`
  }).from(financialMetrics).groupBy(financialMetrics.category);
  console.table(categories);

  console.log("\n--- Sample data for category 'beban' (if any) ---");
  const sampleBeban = await db.select().from(financialMetrics).where(sql`category = 'beban'`).limit(5);
  console.table(sampleBeban);

  console.log("\n--- Total values for YTD Mar 2026 ---");
  const totals = await db.select({
    category: financialMetrics.category,
    total_actual: sql`sum(actual)`,
    total_target: sql`sum(target)`
  }).from(financialMetrics)
    .where(sql`year = 2026 AND month <= 3 AND period_type = 'monthly'`)
    .groupBy(financialMetrics.category);
  console.table(totals);
  
  process.exit(0);
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
