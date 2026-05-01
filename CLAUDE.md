# CLAUDE.md — Engineering Context untuk AI Coding Agent

> Baca dokumen ini sebelum menulis satu baris kode.
> Dokumen ini adalah **sumber kebenaran tunggal** untuk semua keputusan engineering.
> Jika ada konflik antara dokumen ini dengan instruksi lain, **dokumen ini yang menang**.

---

## Identitas Proyek

```
Nama:     AI-Powered Financial Performance Dashboard
Stack:    Next.js 15 · React 19 · TypeScript 5 · Tailwind CSS 4
Database: MySQL / TiDB via Drizzle ORM
LLM:      Anthropic Claude API (claude-sonnet-4-5)
PRD:      ./PRD.md    ← baca untuk spesifikasi fitur lengkap
Design:   ./DESIGN.md ← baca untuk semua token visual
```

---

## Cara Agent Harus Bekerja

### Sebelum menulis kode

1. Baca bagian PRD yang relevan dengan task saat ini
2. Periksa apakah tipe yang dibutuhkan sudah ada di `src/types/`
3. Periksa apakah query yang dibutuhkan sudah ada di `src/lib/db/queries/`
4. Tentukan file mana yang dibuat atau dimodifikasi — jangan buat file baru jika sudah ada yang sesuai

### Saat menulis kode

- Tulis kode **sekali, benar, lengkap** — jangan draft yang perlu diperbaiki lagi
- Tambahkan JSDoc singkat pada fungsi publik dan tipe kompleks
- Jangan tinggalkan `TODO` atau `// fix later` — selesaikan atau catat di `BACKLOG.md`
- Setiap file harus bisa dibaca dari atas ke bawah tanpa bolak-balik

### Setelah menulis kode

- Pastikan tidak ada import yang tidak digunakan
- Pastikan tidak ada `console.log` yang tertinggal
- Pastikan semua error path ditangani

---

## Struktur File & Folder

```
src/
├── app/                      # Next.js App Router — hanya routing dan layout
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── dashboard/route.ts
│   │   ├── dashboard/workbook/route.ts
│   │   ├── drilldown/route.ts
│   │   ├── chat/route.ts
│   │   └── report/route.ts
│   ├── globals.css
│   └── layout.tsx
│
├── components/               # UI — presentasi saja, tidak ada logika bisnis
│   ├── dashboard/            # Shell komponen utama
│   ├── tabs/                 # Satu file per tab
│   ├── drilldown/            # Modal drilldown
│   ├── chat/                 # Chat panel
│   ├── charts/               # Wrapper Chart.js
│   └── ui/                   # shadcn/ui — jangan edit manual
│
├── lib/                      # Semua logika bisnis, komputasi, integrasi
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema — satu-satunya definisi DB
│   │   ├── index.ts          # Singleton DB connection
│   │   └── queries/          # Query functions per domain
│   ├── ratios/               # Kalkulasi rasio keuangan
│   ├── llm/                  # Anthropic integration
│   ├── workbook/             # Excel parser dan importer
│   ├── compute.ts            # computeAll() — orkestrasi kalkulasi
│   ├── formatters.ts         # Format angka dan mata uang
│   └── utils.ts              # Utility murni (cn, safeDivide, dll)
│
├── hooks/                    # Custom React hooks
├── stores/                   # Zustand stores
├── types/                    # TypeScript types dan interfaces
└── env.ts                    # Environment variables (t3-oss/env-nextjs)
```

### Aturan Folder

```
❌ Jangan buat folder di luar struktur di atas tanpa mendokumentasikan alasannya
❌ Jangan taruh logika bisnis di dalam components/
❌ Jangan fetch/query langsung di dalam komponen
✅ API routes: tipis — parse request → panggil lib/ → return response
✅ Komponen: tipis — terima props → render → emit events
```

---

## Konvensi TypeScript

### Setup

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Aturan Tipe

```ts
// ✅ Props interface selalu di atas komponen
interface KpiCardProps {
  label:       string;
  ytdActual:   number;
  ytdTarget:   number;
  achievement: number;
  status:      "OK" | "Perhatian" | "Risiko";
  sparkline:   number[];
}

// ❌ Dilarang: any
const data: any = await fetch(...)           // DILARANG

// ✅ Gunakan unknown + type guard
const data: unknown = await fetch(...)
if (isFinancialMetric(data)) { ... }

// ✅ Discriminated union untuk async state
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

### Naming

| Jenis | Konvensi | Contoh |
|---|---|---|
| Component | PascalCase | `KpiCards.tsx` |
| Hook | camelCase + `use` | `useDashboard.ts` |
| Util function | camelCase | `formatRupiah` |
| Type / Interface | PascalCase | `FinancialMetric` |
| Constant | SCREAMING_SNAKE | `ACHIEVEMENT_STATUS` |
| DB column | snake_case | `snapshot_id` |
| API endpoint | kebab-case | `/api/dashboard/workbook` |
| CSS variable | kebab-case | `--color-navy` |
| Zod schema | camelCase + `Schema` | `financialMetricSchema` |

---

## Konvensi Komponen React

### Struktur File

```tsx
// Urutan wajib dalam setiap file komponen:

// 1. Imports — react → next → lib → components → types
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import type { KpiCard as KpiCardType } from "@/types/dashboard";

// 2. Types & interfaces
interface KpiCardProps {
  data:         KpiCardType;
  onDrilldown?: () => void;
}

// 3. Constants lokal (jika ada)
const TREND_COLORS = { positive: "text-success", negative: "text-danger" } as const;

// 4. Komponen utama — named export
export function KpiCard({ data, onDrilldown }: KpiCardProps) {
  // 4a. Hooks
  const [isHovered, setIsHovered] = useState(false);

  // 4b. Derived values
  const formattedValue = formatRupiah(data.ytdActual);

  // 4c. Handlers
  const handleClick = useCallback(() => {
    onDrilldown?.();
  }, [onDrilldown]);

  // 4d. Return
  return (
    <div className="..." onClick={handleClick}>
      {/* ... */}
    </div>
  );
}

// 5. Sub-komponen kecil yang hanya dipakai di file ini
function SparklineBar({ values }: { values: number[] }) {
  return <div>{/* ... */}</div>;
}
```

### Aturan Komponen

```
✅ Satu komponen per file (sub-komponen kecil boleh di file yang sama)
✅ Semua export: named export — tidak ada default export di components/
✅ Props: destructure di parameter
✅ Handler: prefix "handle" (handleClick, handleSubmit)
✅ Boolean props: prefix "is/has/can/should" (isLoading, hasError)
✅ Max 250 baris per file — lebih dari itu, pecah menjadi sub-komponen
❌ Jangan gunakan useEffect untuk transformasi data
❌ Jangan fetch data di dalam komponen client
```

---

## Konvensi Styling

```tsx
// ✅ Gunakan Tailwind tokens yang didefinisikan di tailwind.config.ts
<div className="bg-navy2 text-white border border-line rounded">

// ❌ Jangan hardcode warna
<div className="bg-[#0f2044] text-white">  // DILARANG

// ✅ Gunakan cn() untuk conditional classes
import { cn } from "@/lib/utils";
<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "danger" && "text-danger"
)}>

// ✅ Angka keuangan: wajib font-mono tabular-nums
<span className="font-mono tabular-nums text-right">{formatRupiah(value)}</span>
```

### Token Warna → Tailwind Class

| Situasi | Class |
|---|---|
| Background halaman | `bg-surface-container` |
| Card / panel | `bg-white border border-line` |
| Header | `bg-gradient-to-br from-navy to-blue` |
| Text utama | `text-ink` |
| Text sekunder | `text-muted` |
| Badge OK | `bg-green-bg text-success` |
| Badge Perhatian | `bg-amber-bg text-warning` |
| Badge Risiko | `bg-red-bg text-danger` |

---

## Konvensi Keuangan

```ts
// ✅ Semua pembagian keuangan: wajib safeDivide
import { safeDivide } from "@/lib/utils";
const gpm = safeDivide(labaUsaha, pendapatan) * 100;

// ❌ Dilarang: divide langsung
const gpm = labaUsaha / pendapatan * 100;  // NaN/Infinity jika pendapatan = 0

// ✅ Semua format angka: gunakan lib/formatters.ts
formatRupiah(1_250_000_000)       // → "Rp 1,25 M"
formatRupiah(1_250_000_000_000)   // → "Rp 1,25 T"
formatPersen(84.2)                // → "84.2%"
formatRasio(1.32, "x")           // → "1.32x"
formatDelta(3.2)                  // → "+3.20 pt"
formatDelta(-1.5)                 // → "-1.50 pt"

// ❌ Dilarang: format inline di komponen
<span>{(value / 1_000_000_000).toFixed(2) + " M"}</span>  // DILARANG

// ✅ Kalkulasi keuangan: HANYA di lib/ratios/compute.ts
export function computeGpm(labaUsaha: number, pendapatan: number): number {
  return safeDivide(labaUsaha, pendapatan) * 100;
}

export function computeAchievement(actual: number, target: number, isInverse = false): number {
  if (isInverse) {
    if (actual <= 0) return 100;
    return safeDivide(target, actual) * 100;
  }
  return safeDivide(actual, target) * 100;
}

export function getStatus(achievement: number): "OK" | "Perhatian" | "Risiko" {
  if (achievement >= 100) return "OK";
  if (achievement >= 85)  return "Perhatian";
  return "Risiko";
}
```

---

## Konvensi Database & API

### Query Functions

```ts
// ✅ Semua query: di lib/db/queries/, dikelompokkan per domain
// lib/db/queries/financial.ts

export async function getFinancialMetricsByPeriod(
  snapshotId: string,
  period: string
): Promise<FinancialMetric[]> {
  return db
    .select()
    .from(financialMetrics)
    .where(
      and(
        eq(financialMetrics.snapshotId, snapshotId),
        eq(financialMetrics.period, period)
      )
    );
}

// ✅ Selalu filter dengan snapshotId
// ✅ Return tipe eksplisit — jangan andalkan inferensi Drizzle
// ❌ Jangan raw SQL kecuali query kompleks yang tidak bisa di-express Drizzle
```

### API Routes

```ts
// ✅ Pola API route yang benar
export async function GET(request: NextRequest) {
  try {
    // 1. Parse & validasi input dengan Zod
    const params = querySchema.parse(...)

    // 2. Panggil lib/
    const data = await getBootstrapData(params.snapshotId);

    // 3. Return response
    return NextResponse.json(data);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Parameter tidak valid" }, { status: 400 });
    }
    console.error("[GET /api/dashboard]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ Error handling hierarki:
// ZodError → 400 | Business error → 404/422 | Unknown → 500 + log
// ❌ Jangan expose stack trace ke client
```

---

## Konvensi Error Handling

```ts
// ✅ Result pattern untuk fungsi yang bisa gagal
type Result<T, E = string> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

export async function parseWorkbook(file: File): Promise<Result<WorkbookData>> {
  try {
    const data = await parseExcel(file);
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Parse gagal" };
  }
}

// Pemanggil:
const result = await parseWorkbook(file);
if (!result.ok) {
  toast.error(result.error);
  return;
}
// result.value aman digunakan di sini
```

---

## Konvensi LLM

```ts
// ✅ Streaming selalu — jangan blocking response untuk chat
export async function POST(request: NextRequest) {
  const stream = await anthropic.messages.stream({
    model:      LLM_MODEL,
    max_tokens: LLM_MAX_TOKENS,
    system:     buildSystemPrompt(snapshotId, period),
    messages,
  });

  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}

// ✅ Validasi SQL output dari LLM sebelum dieksekusi:
//    - Hanya SELECT yang diizinkan
//    - Tidak boleh: DROP, DELETE, UPDATE, INSERT, ALTER
//    - Hanya tabel yang ada di schema yang boleh di-query
```

---

## Konvensi Git

### Branch

```
main          ← production-ready, protected, merge via PR only
develop       ← integration branch
feat/<name>   ← fitur baru (feat/kpi-cards)
fix/<name>    ← bug fix   (fix/drilldown-modal)
chore/<name>  ← non-functional (chore/update-deps)
docs/<name>   ← dokumentasi (docs/update-prd)
```

### Commit Message

```
feat(kpi):       add sparkline chart to KPI cards
feat(drilldown): implement 3-level drill down modal
fix(ratio):      correct DSO calculation for annual period
refactor(db):    extract financial queries to dedicated module
chore(deps):     upgrade drizzle-orm to 0.31
docs(prd):       add LLM integration spec
test(ratio):     add unit tests for computeGpm
```

**Aturan:**
- Max 72 karakter di baris pertama
- Imperative mood: "add" bukan "added"
- Satu commit = satu perubahan logis
- Jangan commit file yang berisi secret

### Pull Request Template

```markdown
## Apa yang berubah
<!-- Deskripsi singkat -->

## Cara test

## Checklist
- [ ] pnpm type-check → tidak ada error
- [ ] pnpm lint → tidak ada warning
- [ ] Tidak ada console.log tertinggal
- [ ] Props interface terdefinisi untuk komponen baru
- [ ] Fungsi keuangan menggunakan safeDivide
- [ ] Angka keuangan menggunakan formatters.ts
- [ ] Warna menggunakan CSS variables / Tailwind tokens
- [ ] Error path ditangani
```

---

## Struktur GitHub yang Profesional

### File Root Wajib

```
/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                   # Lint + type-check + test
│   │   └── deploy.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── src/
├── public/
├── .env.example                     # Template env (tanpa nilai asli)
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── CLAUDE.md                        ← dokumen ini
├── PRD.md
├── DESIGN.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── README.md
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### `.gitignore` Wajib

```gitignore
node_modules/
.next/
out/

# ENV — JANGAN PERNAH COMMIT
.env
.env.local
.env.*.local

*.db
*.sqlite
coverage/
playwright-report/
.DS_Store
```

---

## Tooling

### ESLint

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended-type-checked"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any":         "error",
    "@typescript-eslint/no-unused-vars":          "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-floating-promises":    "error",
    "no-console": ["warn", { "allow": ["error"] }]
  }
}
```

### Prettier

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Package Scripts

```json
{
  "scripts": {
    "dev":         "next dev",
    "build":       "next build",
    "lint":        "next lint",
    "lint:fix":    "next lint --fix",
    "type-check":  "tsc --noEmit",
    "format":      "prettier --write .",
    "db:generate": "drizzle-kit generate",
    "db:push":     "drizzle-kit push",
    "db:studio":   "drizzle-kit studio",
    "db:seed":     "tsx src/scripts/seed.ts",
    "test":        "vitest",
    "test:e2e":    "playwright test"
  }
}
```

### CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:    { branches: [main, develop] }
  pull_request: { branches: [main, develop] }

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test --run
```

---

## Testing

### Apa yang Ditest

```
Unit test (Vitest):
✅ lib/ratios/compute.ts      — semua kalkulasi rasio
✅ lib/formatters.ts          — semua format angka
✅ lib/utils.ts               — safeDivide, cn
✅ lib/workbook/validator.ts  — validasi sheet

Integration (Vitest + mock DB):
✅ lib/db/queries/            — dengan DB mock
✅ API routes                 — request/response

E2E (Playwright):
✅ Load dashboard → ringkasan → drill down
✅ Upload workbook → data refresh
✅ Chat → kirim pesan → dapat jawaban

Tidak perlu ditest:
❌ Komponen UI murni tanpa logika
❌ shadcn/ui components
❌ Drizzle schema definitions
```

### Contoh Unit Test

```ts
// src/lib/ratios/__tests__/compute.test.ts
import { describe, it, expect } from "vitest";
import { computeGpm, computeAchievement, getStatus } from "../compute";

describe("computeGpm", () => {
  it("menghitung dengan benar", () =>
    expect(computeGpm(300_000_000, 1_000_000_000)).toBe(30));
  it("mengembalikan 0 jika pendapatan = 0", () =>
    expect(computeGpm(300_000_000, 0)).toBe(0));
});

describe("computeAchievement", () => {
  it("normal: actual/target * 100",       () => expect(computeAchievement(960, 1000)).toBe(96));
  it("inverse: target/actual * 100",      () => expect(computeAchievement(80, 100, true)).toBe(125));
  it("inverse dengan actual = 0 → 100",   () => expect(computeAchievement(0, 100, true)).toBe(100));
});

describe("getStatus", () => {
  it(">= 100 → OK",       () => expect(getStatus(100)).toBe("OK"));
  it("85–99 → Perhatian", () => expect(getStatus(90)).toBe("Perhatian"));
  it("< 85 → Risiko",    () => expect(getStatus(80)).toBe("Risiko"));
});
```

---

## Hard Rules — Tidak Boleh Dilanggar

```
❌ Commit file .env atau secret apapun ke repository
❌ Gunakan `any` tanpa komentar justifikasi
❌ Hardcode warna hex di JSX/TSX
❌ Lakukan kalkulasi keuangan di dalam komponen
❌ Buat file > 300 baris tanpa memecahnya
❌ Tinggalkan console.log di luar development
❌ Buat query DB di dalam komponen atau API route langsung
❌ Skip error handling pada Promise atau async function
❌ Bypass TypeScript dengan @ts-ignore tanpa penjelasan
❌ Install library baru tanpa mencatatnya di PRD.md
```

---

## Checklist Sebelum Setiap PR

```
□ pnpm type-check  → tidak ada error
□ pnpm lint        → tidak ada warning
□ pnpm format      → semua file terformat
□ pnpm test        → semua test pass
□ Tidak ada console.log tertinggal
□ Tidak ada import yang tidak digunakan
□ Props interface terdefinisi untuk komponen baru
□ Fungsi keuangan baru ada unit test-nya
□ Angka keuangan di UI: font-mono tabular-nums
□ Warna: CSS variable atau Tailwind token
□ Error path ditangani (try/catch, loading, empty state)
□ File baru di lokasi yang benar sesuai struktur folder
```

---

*CLAUDE.md · v0.1 · April 2025*
*Baca juga: [PRD.md](./PRD.md) · [DESIGN.md](./DESIGN.md)*
