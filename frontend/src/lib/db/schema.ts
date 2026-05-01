import { pgTable, varchar, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";

export const dashboardSnapshots = pgTable("dashboard_snapshots", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sourceFile: varchar("source_file", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const periods = pgTable("periods", {
  id: varchar("id", { length: 20 }).primaryKey(),  // "2025-03" atau "2025"
  periodType: varchar("period_type", { length: 10 }).notNull(), // "monthly" | "annual"
  year: integer("year").notNull(),
  month: integer("month"),                                // null untuk annual
  label: varchar("label", { length: 50 }),
});

export const financialMetrics = pgTable("financial_metrics", {
  id: varchar("id", { length: 100 }).primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 100 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  periodType: varchar("period_type", { length: 10 }).notNull(),
  year: integer("year").notNull(),
  month: integer("month"),
  segment: varchar("segment", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  // category values: pendapatan | beban_operasional | laba_usaha |
  //                  pendapatan_non_operasional | beban_non_operasional | laba_sebelum_pajak
  actual: numeric("actual", { precision: 20, scale: 2 }),
  target: numeric("target", { precision: 20, scale: 2 }),
}, (table) => [
  index("idx_fm_snapshot_period").on(table.snapshotId, table.period),
  index("idx_fm_snapshot_segment").on(table.snapshotId, table.segment, table.category),
]);

export const componentMetrics = pgTable("component_metrics", {
  id: varchar("id", { length: 100 }).primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 100 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  periodType: varchar("period_type", { length: 10 }).notNull(),
  year: integer("year").notNull(),
  month: integer("month"),
  segment: varchar("segment", { length: 100 }).notNull(),
  componentName: varchar("component_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  // category values: pendapatan | beban
  actual: numeric("actual", { precision: 20, scale: 2 }),
  target: numeric("target", { precision: 20, scale: 2 }),
}, (table) => [
  index("idx_cm_snapshot_period").on(table.snapshotId, table.period),
  index("idx_cm_segment_category").on(table.snapshotId, table.segment, table.category),
]);

export const neracaMetrics = pgTable("neraca_metrics", {
  id: varchar("id", { length: 100 }).primaryKey(),
  snapshotId: varchar("snapshot_id", { length: 100 }).notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  periodType: varchar("period_type", { length: 10 }).notNull(),
  year: integer("year").notNull(),
  month: integer("month"),
  accountCode: varchar("account_code", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountGroup: varchar("account_group", { length: 100 }),
  actual: numeric("actual", { precision: 20, scale: 2 }),
  target: numeric("target", { precision: 20, scale: 2 }),
}, (table) => [
  index("idx_nr_snapshot_period").on(table.snapshotId, table.period),
  index("idx_nr_account_code").on(table.snapshotId, table.accountCode),
]);
