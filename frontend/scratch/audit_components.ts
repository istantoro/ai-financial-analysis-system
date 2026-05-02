import { db } from "../src/lib/db";
import { componentMetrics } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

async function audit() {
  console.log("--- Unique Categories in component_metrics ---");
  const categories = await db.select({ 
    category: componentMetrics.category,
    count: sql`count(*)`
  }).from(componentMetrics).groupBy(componentMetrics.category);
  console.table(categories);

  console.log("\n--- Unique Component Names in component_metrics for category 'beban' ---");
  const names = await db.select({ 
    name: componentMetrics.componentName,
    count: sql`count(*)`
  }).from(componentMetrics)
    .where(sql`category = 'beban'`)
    .groupBy(componentMetrics.componentName);
  console.table(names);

  console.log("\n--- Total values for category 'beban' in component_metrics YTD Mar 2026 ---");
  const totals = await db.select({
    name: componentMetrics.componentName,
    total_actual: sql`sum(actual)`,
    total_target: sql`sum(target)`
  }).from(componentMetrics)
    .where(sql`year = 2026 AND month <= 3 AND period_type = 'monthly' AND category = 'beban'`)
    .groupBy(componentMetrics.componentName);
  console.table(totals);
  
  process.exit(0);
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
