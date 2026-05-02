import { db } from "../src/lib/db";
import { componentMetrics } from "../src/lib/db/schema";
import { sql, and, eq, inArray, lte } from "drizzle-orm";

async function auditRow4() {
  const year = 2026;
  const month = 3;
  const segments = [
    'Biaya Pemasaran', 
    'Biaya Remunerasi Pekerja', 
    'Biaya Tenaga Kerja Lainnya',
    'Biaya Penyusutan Aktiva Tetap', 
    'Biaya Transportasi dan Perjalanan', 
    'Biaya Operasional Kantor'
  ];

  console.log(`--- Audit Row 4 (Biaya Pemasaran & Adm Umum) for YTD ${month}/${year} ---`);

  const result = await db.select({
    segment: componentMetrics.segment,
    actual: sql`sum(actual)`,
    target: sql`sum(target)`
  }).from(componentMetrics)
    .where(and(
      eq(componentMetrics.year, year),
      lte(componentMetrics.month, month),
      eq(componentMetrics.periodType, "monthly"),
      inArray(componentMetrics.segment, segments)
    ))
    .groupBy(componentMetrics.segment);
  
  console.table(result);

  const totalActual = result.reduce((acc, curr) => acc + Number(curr.actual), 0);
  const totalTarget = result.reduce((acc, curr) => acc + Number(curr.target), 0);

  console.log("\nTOTAL Row 4 (Sum of 6 segments):");
  console.log("Actual:", totalActual);
  console.log("Target:", totalTarget);

  process.exit(0);
}

auditRow4().catch(err => {
  console.error(err);
  process.exit(1);
});
