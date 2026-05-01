---
name: IHS Enterprise Identity
colors:
  surface: '#fbf8fc'
  surface-dim: '#dbd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f6'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e4e2e5'
  on-surface: '#1b1b1e'
  on-surface-variant: '#45464e'
  inverse-surface: '#303033'
  inverse-on-surface: '#f2f0f4'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4e5e85'
  primary: '#000924'
  on-primary: '#ffffff'
  primary-container: '#0f2044'
  on-primary-container: '#7988b2'
  inverse-primary: '#b6c6f3'
  secondary: '#1d4ed8'
  on-secondary: '#ffffff'
  secondary-container: '#4069f2'
  on-secondary-container: '#fffbff'
  tertiary: '#160700'
  on-tertiary: '#ffffff'
  tertiary-container: '#381900'
  on-tertiary-container: '#b07e59'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b6c6f3'
  on-primary-fixed: '#081a3e'
  on-primary-fixed-variant: '#37466c'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b5'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#f4bb91'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#653d1e'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e2e5'
typography:
  h1:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  h2:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-xs:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-tabular:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  card-gap: 16px
  control-height-sm: 28px
  control-height-md: 36px
  section-margin: 32px
---

## Brand & Style

This design system is engineered for the high-stakes environment of human capital management and financial oversight. The brand personality is institutional, precise, and authoritative, designed to instill confidence in stakeholders at Istantoro Human Solutions. 

The aesthetic follows a **Corporate Modern** approach with a focus on data density. It prioritizes information throughput over decorative whitespace. Visual weight is anchored by deep navy-blue gradients in the primary navigation and headers, contrasted against a calm, slate-blue surface. The interface feels like a high-performance instrument—efficient, cold, and reliable.

## Colors

The color palette is built on a foundation of "Navy" and "Surface Slate." 

- **Primary Navy (#0f2044):** Used for global navigation, headers, and primary actions. It serves as the grounding force of the interface.
- **Surface (#e8edf5):** This is the application backdrop. It reduces eye strain compared to pure white while maintaining high contrast with text.
- **Semantic Palette:** Green, Red, and Amber are strictly reserved for financial performance indicators and system status. They are desaturated slightly to fit the professional tone.
- **Line (#d7deeb):** A specific shade for borders and dividers to ensure clean separation without visual clutter.

## Typography

The design system utilizes a dual-font strategy to separate intent. **IBM Plex Sans** (represented here by the Work Sans scale) is the primary UI typeface, chosen for its industrial clarity and excellent legibility at small sizes. 

For all numerical data, currency, and timestamps, **IBM Plex Mono** is mandatory. This ensures that columns of numbers align perfectly in data tables, facilitating rapid scanning and comparison. Typography is intentionally compact, with tighter line-heights to support the data-dense requirements of an enterprise dashboard.

## Layout & Spacing

This design system employs a **Fluid Grid** model with a strictly enforced 4px baseline. Layouts should utilize a 12-column grid for main content areas, allowing widgets to span 3, 4, 6, or 12 columns. 

To achieve the "enterprise-grade" density, internal component padding is minimized. Margins between disparate functional groups are kept at a consistent 16px or 24px, ensuring that while the interface is dense, it does not feel suffocated. The header remains fixed at the top, utilizing a Navy-to-Blue linear gradient (135deg) to provide a clear entry point for the eye.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows. 

- **Level 0 (Background):** The Surface (#e8edf5) layer.
- **Level 1 (Cards/Content):** Pure white (#ffffff) surfaces with a 1px border using the Line color (#d7deeb).
- **Interaction Depth:** A subtle, 2px diffused shadow (4% opacity) is only used when a component is hovered or active to indicate "clickability."

This approach maintains a flat, professional "sheet" aesthetic that feels integrated into the dashboard rather than floating above it.

## Shapes

The shape language is **Soft**. A consistent 4px radius (`rounded-sm` or `0.25rem`) is applied to buttons, input fields, and cards. This provides a subtle modern touch without compromising the "serious" nature of a financial tool. 

Circular shapes are used exclusively for user avatars or status indicators (e.g., online/offline dots). Larger containers like modals may use a slightly increased radius of 8px to distinguish them from background widgets.

## Components

Components follow the **Shadcn/Radix** architectural pattern, optimized for high-density layouts.

- **Data Tables:** These are the core of the design system. Use a zebra-stripe pattern with the Surface color on alternate rows. Headers must be semi-bold with a subtle bottom border. All numerical columns must use IBM Plex Mono.
- **KPI Cards:** White background, 1px border. The primary metric should be bold Navy, while the secondary "trend" indicator (Green or Red) should be accompanied by a Lucide-React `TrendingUp` or `TrendingDown` icon.
- **Inputs & Controls:** Focused states use a 1px Blue (#1d4ed8) ring with a 0px offset to maintain the grid alignment. For native sliders (`<input type="range">`), use a custom webkit-slider-thumb styling (blue circular thumb, thin grey track) to maintain a modern aesthetic without heavy dependencies.
- **Charts:** Chart.js visualizations should use the primary Navy, Blue, and secondary semantic colors. Fill areas for line charts should use a 10% opacity gradient of the stroke color. Lines should be smooth (tension 0.4).
- **Drilldown Interactions:** Use two distinct patterns:
  1. **Modal Popup:** For P&L and Ratio drilldowns where data requires separate detailed visualization (Tables + Charts).
  2. **Inline Tree-View:** For Neraca (Balance Sheet) where data is hierarchical and requires contextual expanding/collapsing without leaving the table.
- **Simulation Blocks:** For forecasting output cards (e.g., in Tab Simulasi), use solid bold semantic colors (`bg-blue-600`, `bg-emerald-700`, `bg-purple-600`, `bg-amber-700`) with white text to sharply contrast against the rest of the dashboard and draw immediate attention to projected outcomes.