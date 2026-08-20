# Task 5-7: Search/Filter on Traces Tab + Export Trace as JSON

## Status: Completed

## Changes Made

### Part 1: Trace Search & Filter (DashboardSection.tsx)
- Added `traceSearch` state (`useState('')`) for text search
- Added `traceStatusFilter` state (`useState<string>('all')`) for status filtering
- Updated `filteredTraces` computation to combine agent filter + search + status filter:
  - Search matches against `traceId`, `agentId`, and `status` (case insensitive)
  - Status filter supports: all, success, error
  - Agent filter from `selectedAgentId` is preserved and combined
- Added UI above TraceViewer:
  - Header row with title, count (`X/Y traces`), and search input (with magnifying glass + clear button, matching Issues tab pattern)
  - Quick filter buttons: All (gray), Success (emerald), Error (red) — styled like Issues severity filters
  - "← All agents" button shown when `selectedAgentId` is set, styled as a filter chip
  - Empty state with search icon when no traces match

### Part 2: Export Trace as JSON (TraceViewer.tsx)
- Added `Download` to lucide-react imports
- Each trace tab now wrapped in a flex container with a download button
- Download button: ghost icon style, `text-gray-300` → `hover:text-[#dc2626]`, with `title="Export trace as JSON"`
- On click: creates Blob with `JSON.stringify(trace, null, 2)`, triggers download as `trace-{traceId}.json`, revokes object URL
- Status dot on selected tab uses white color for visibility on red background

## Verification
- ESLint: zero errors
- Dev server: compiles successfully (719ms)
