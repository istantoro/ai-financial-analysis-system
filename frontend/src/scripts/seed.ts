import "dotenv/config";
import { db } from "../lib/db";
import {
  dashboardSnapshots,
  periods,
  financialMetrics,
  componentMetrics,
  neracaMetrics,
} from "../lib/db/schema";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

// Helper function to read CSV
const readCsv = <T>(filePath: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

const mapEmptyToNull = (val: string) => (val === "" ? null : val);

const main = async () => {
  const dataDir = path.resolve(__dirname, "../../../files");
  
  console.log("Reading CSV files from:", dataDir);

  try {
    // 1. Dashboard Snapshots
    console.log("Seeding dashboard snapshots...");
    const snapshotsData = await readCsv<any>(path.join(dataDir, "dashboard_snapshots.csv"));
    for (const row of snapshotsData) {
      await db.insert(dashboardSnapshots).values({
        id: row.id,
        name: row.name,
        sourceFile: row.source_file,
        createdAt: row.exported_at ? new Date(row.exported_at) : new Date(),
      }).onConflictDoNothing();
    }

    // 2. Periods
    console.log("Seeding periods...");
    const periodsData = await readCsv<any>(path.join(dataDir, "periods.csv"));
    for (const row of periodsData) {
      await db.insert(periods).values({
        id: row.period,
        periodType: row.period_type,
        year: parseInt(row.year, 10),
        month: mapEmptyToNull(row.month) ? parseInt(row.month, 10) : null,
        label: row.period, // or you can add custom label
      }).onConflictDoNothing();
    }

    // 3. Financial Metrics
    console.log("Seeding financial metrics...");
    const finData = await readCsv<any>(path.join(dataDir, "financial_metrics.csv"));
    // Chunking to avoid large inserts
    const finChunks = chunkArray(finData, 500);
    for (const chunk of finChunks) {
      const values = chunk.map(row => ({
        id: row.id,
        snapshotId: row.snapshot_id,
        period: row.period,
        periodType: row.period_type,
        year: parseInt(row.year, 10),
        month: mapEmptyToNull(row.month) ? parseInt(row.month, 10) : null,
        segment: row.segment,
        category: row.category,
        actual: mapEmptyToNull(row.actual),
        target: mapEmptyToNull(row.target),
      }));
      await db.insert(financialMetrics).values(values).onConflictDoNothing();
    }

    // 4. Component Metrics
    console.log("Seeding component metrics...");
    const compData = await readCsv<any>(path.join(dataDir, "component_metrics.csv"));
    const compChunks = chunkArray(compData, 500);
    for (const chunk of compChunks) {
      const values = chunk.map(row => ({
        id: row.id,
        snapshotId: row.snapshot_id,
        period: row.period,
        periodType: row.period_type,
        year: parseInt(row.year, 10),
        month: mapEmptyToNull(row.month) ? parseInt(row.month, 10) : null,
        segment: row.segment,
        componentName: row.component_name,
        category: row.category,
        actual: mapEmptyToNull(row.actual),
        target: mapEmptyToNull(row.target),
      }));
      await db.insert(componentMetrics).values(values).onConflictDoNothing();
    }

    // 5. Neraca Metrics
    console.log("Seeding neraca metrics...");
    const neracaData = await readCsv<any>(path.join(dataDir, "neraca_metrics.csv"));
    const neracaChunks = chunkArray(neracaData, 500);
    for (const chunk of neracaChunks) {
      const values = chunk.map(row => ({
        id: row.id,
        snapshotId: row.snapshot_id,
        period: row.period,
        periodType: row.period_type,
        year: parseInt(row.year, 10),
        month: mapEmptyToNull(row.month) ? parseInt(row.month, 10) : null,
        accountCode: row.account_code,
        accountName: row.account_name,
        accountGroup: mapEmptyToNull(row.account_group),
        actual: mapEmptyToNull(row.actual),
        target: mapEmptyToNull(row.target),
      }));
      await db.insert(neracaMetrics).values(values).onConflictDoNothing();
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

main();
