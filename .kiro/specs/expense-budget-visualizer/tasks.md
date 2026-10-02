# Implementation Plan: Expense & Budget Visualizer

## Overview

Build a zero-dependency, single-page client-side web app in three files: `index.html`, `css/styles.css`, and `js/app.js`. All logic lives inside a single IIFE in `js/app.js`. State is persisted via `localStorage`. The UI is composed of six sections rendered by targeted re-render functions, and a Canvas 2D doughnut chart replaces any charting library.

## Tasks

- [x] 1. Create project scaffold and HTML structure
  - Create `index.html` in the project root with all six section skeletons (`#summary`, `#chart-section`, `#transaction-section`, `#form-section`, `#category-section`, `#limit-section`) and the `#toast` element
  - Link `css/styles.css` in `<head>` and load `js/app.js` as a deferred `<script>` before `</body>`
  - Create `css/styles.css` as an empty file
  - Create `js/app.js` as an empty IIFE stub: `(function () { 'use strict'; })();`
  - _Requirements: 10.2, 10.3_

- [x] 2. Implement CSS foundation — variables, reset, and mobile-first layout
  - [x] 2.1 Define CSS custom properties on `:root` (colors, spacing, radius, min-touch, font-base) and apply a `box-sizing: border-box` reset
    - _Requirements: 9.3, 9.4_
  - [x] 2.2 Write mobile-first base layout: `body` as a flex column, section `order` values, canvas and image `max-width: 100%`, `.transaction-title` truncation
    - _Requirements: 9.1, 9.4, 9.5_
  - [x] 2.3 Write the `@media (min-width: 600px)` desktop grid layout with two columns and full-width spans for `#summary` and `#limit-section`
    - _Requirements: 9.2_
  - [x] 2.4 Add styles for `.income` / `.expense` list items (color, sign), `.over-limit` warning highlight, `#toast` with opacity transition, and button/input minimum touch targets
    - _Requirements: 2.6, 7.3, 9.3_

- [x] 3. Implement core data layer inside the IIFE
  - [x] 3.1 Define `AppState` object, `generateId()` helper (using `crypto.randomUUID` with Math.random fallback), and predefined categories array
    - _Requirements: 5.1_
  - [x] 3.2 Implement `StorageService` module: `checkAvailability()`, `read(key, fallback)`, `write(key, value)`, and `init()` — all with `try/catch`; call `showToast()` on write failure
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x] 3.3 Implement `loadAppState()` that calls `StorageService.init()` and populates `AppState.transactions`, `AppState.categories`, and `AppState.limits` from storage (or defaults)
    - _Requirements: 8.2, 8.3_
  - [ ]* 3.4 Write property test for StorageService round-trip (Property 3)
    - **Property 3: Transaction persistence round-trip**
    - **Validates: Requirements 2.3, 3.2, 8.1, 8.2**
    - Tag: `// Feature: expense-budget-visualizer, Property 3: Transaction persistence round-trip`

- [x] 4. Implement `Validators` and `SpendingService` pure functions
  - [x] 4.1 Implement `isValidTitle(s)` (non-empty after trim, max 100 chars) and `isValidAmount(v)` (numeric, > 0, ≤ 999,999,999.99) and `isValidCategoryName(name, categories)` (non-blank, ≤ 50 chars, case-insensitive uniqueness check)
    - _Requirements: 3.3, 3.4, 3.5, 5.3, 5.4_
  - [ ]* 4.2 Write property test for whitespace title rejection (Property 4)
    - **Property 4: Whitespace-only and empty titles are rejected by the validator**
    - **Validates: Requirements 3.3, 5.4**
    - Tag: `// Feature: expense-budget-visualizer, Property 4: Whitespace-only and empty titles are rejected`
  - [ ]* 4.3 Write property test for out-of-range amount rejection (Property 5)
    - **Property 5: Out-of-range and non-numeric amounts are rejected**
    - **Validates: Requirements 3.4, 3.5, 7.5**
    - Tag: `// Feature: expense-budget-visualizer, Property 5: Out-of-range and non-numeric amounts are rejected`
  - [ ]* 4.4 Write property test for case-insensitive category uniqueness (Property 9)
    - **Property 9: Category names are unique case-insensitively**
    - **Validates: Requirements 5.3**
    - Tag: `// Feature: expense-budget-visualizer, Property 9: Category names are unique case-insensitively`
  - [x] 4.5 Implement `SpendingService.getMonthlyStatus()`: filters expense transactions to the current calendar month, aggregates totals per category, merges with limits, and returns a `Map<categoryName, { total, limit, isOver }>`
    - _Requirements: 7.1, 7.3, 7.6, 7.7_
  - [ ]* 4.6 Write property test for over-limit detection (Property 10)
    - **Property 10: Monthly spending over-limit detection is correct for all numeric inputs**
    - **Validates: Requirements 7.1, 7.3, 7.6, 7.7**
    - Tag: `// Feature: expense-budget-visualizer, Property 10: Monthly spending over-limit detection is correct for all numeric inputs`

- [x] 5. Implement `SortService` and balance calculation
  - [x] 5.1 Implement `computeBalance(transactions)` (sum income minus sum expense) and `formatBalance(value)` (currency symbol + two decimal places with `toLocaleString` or `toFixed`)
    - _Requirements: 1.1, 1.4, 1.5_
  - [ ]* 5.2 Write property test for balance sum (Property 1)
    - **Property 1: Balance is the signed sum of all transactions**
    - **Validates: Requirements 1.1, 1.3**
    - Tag: `// Feature: expense-budget-visualizer, Property 1: Balance is the signed sum of all transactions`
  - [ ]* 5.3 Write property test for balance formatting (Property 2)
    - **Property 2: Balance formatting preserves two decimal places and currency prefix**
    - **Validates: Requirements 1.4, 1.5**
    - Tag: `// Feature: expense-budget-visualizer, Property 2: Balance formatting preserves two decimal places and currency prefix`
  - [x] 5.4 Implement `SortService.sortTransactions(txs, order)` supporting `amount-desc`, `amount-asc`, `category-asc`, `category-desc`, each with date-descending as a tiebreaker
    - _Requirements: 6.3, 6.4, 6.5, 6.6_
  - [ ]* 5.5 Write property test for amount sort tiebreaker (Property 7)
    - **Property 7: Amount-based sort respects tiebreaker by date descending**
    - **Validates: Requirements 6.3, 6.4**
    - Tag: `// Feature: expense-budget-visualizer, Property 7: Amount-based sort respects tiebreaker by date descending`
  - [ ]* 5.6 Write property test for category sort tiebreaker (Property 8)
    - **Property 8: Category-based sort respects tiebreaker by date descending**
    - **Validates: Requirements 6.5, 6.6**
    - Tag: `// Feature: expense-budget-visualizer, Property 8: Category-based sort respects tiebreaker by date descending`

- [ ] 6. Checkpoint — Verify pure logic functions
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement AppState mutation helpers and persistence wiring
  - [ ] 7.1 Implement `addTransaction(tx)`: unshift to `AppState.transactions`, call `saveTransactions()`, then call `renderBalance()`, `renderTransactionList()`, `renderChart()`
    - _Requirements: 2.3, 3.2, 8.1_
  - [ ] 7.2 Implement `deleteTransaction(id)`: filter out the target, call `saveTransactions()`, then call `renderBalance()`, `renderTransactionList()`, `renderChart()`
    - _Requirements: 2.4, 8.1_
  - [ ]* 7.3 Write property test for delete removes exactly one entry (Property 6)
    - **Property 6: Deletion removes exactly the target entry and no others**
    - **Validates: Requirements 2.4**
    - Tag: `// Feature: expense-budget-visualizer, Property 6: Deletion removes exactly the target entry and no others`
  - [ ] 7.4 Implement `addCategory(name)`: push to `AppState.categories`, call `saveCategories()`, then call `renderCategories()` and `refreshCategorySelect()`
    - _Requirements: 5.2, 8.1_
  - [ ] 7.5 Implement `setLimit(category, limit)` and `removeLimit(category)`: update `AppState.limits`, call `saveLimits()`, then call `renderTransactionList()`, `renderChart()`, `renderLimits()`
    - _Requirements: 7.1, 7.2, 7.4, 7.7, 8.1_

- [ ] 8. Implement render functions
  - [ ] 8.1 Implement `renderBalance()`: read `#balance-amount`, set `textContent` to `formatBalance(computeBalance(AppState.transactions))`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  - [ ] 8.2 Implement `renderTransactionList()`: call `SortService.sortTransactions`, build `<li>` elements with `data-id`, `data-category`, income/expense CSS class, title/amount/date/category text, delete button, and `over-limit` class from `getMonthlyStatus()`; render empty-state `<li>` when list is empty
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 6.2, 7.3_
  - [ ] 8.3 Implement `renderCategories()`: render `#category-list` with all category names; mark predefined ones as non-deletable; update `#limit-category-select` in `#limit-section`
    - _Requirements: 5.1, 5.2_
  - [ ] 8.4 Implement `refreshCategorySelect()`: repopulate the `<select>` inside `#form-section` with the current `AppState.categories` list
    - _Requirements: 3.1, 5.2_
  - [ ] 8.5 Implement `renderLimits()`: populate `#limits-table` with each category, its current limit (or "—"), and a clear button; re-render `#limit-category-select`
    - _Requirements: 7.1, 7.2_

- [ ] 9. Implement `ChartRenderer` — Canvas 2D doughnut chart and legend
  - [ ] 9.1 Implement `aggregateExpenses(transactions)`: filter to expense type, sum per category, sort descending; if more than 10 categories, keep top 10 and fold the rest into a single "Other" entry
    - _Requirements: 4.1, 4.3, 4.6_
  - [ ]* 9.2 Write property test for chart "Other" grouping (Property 11)
    - **Property 11: Chart aggregation caps at 10 categories and folds the rest into "Other"**
    - **Validates: Requirements 4.3, 4.6**
    - Tag: `// Feature: expense-budget-visualizer, Property 11: Chart aggregation caps at 10 categories and folds the rest into "Other"`
  - [ ] 9.3 Implement `renderChart()`: show/hide canvas and `#chart-empty` placeholder; draw doughnut arcs using Canvas 2D (startAngle tracks cumulative angle, doughnut hole via reverse arc); apply `#e74c3c` stroke to over-limit category arcs; call `renderLegend()`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 7.3_
  - [ ] 9.4 Implement `renderLegend()`: append colored swatches, category names, and formatted total amounts to `#chart-legend`; append ⚠ icon to over-limit legend entries
    - _Requirements: 4.4, 7.3_

- [ ] 10. Implement event handlers and `init()` wiring
  - [ ] 10.1 Implement `handleAddTransaction(e)`: prevent default, run validators for all five fields (title, amount, date, category, type), show inline `<span class="field-error">` messages on failure, build `Transaction` object with `generateId()`, call `addTransaction()`, clear form, return focus to title input
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ] 10.2 Implement `handleDeleteTransaction(id)`: call `deleteTransaction(id)` (with optional confirm dialog)
    - _Requirements: 2.4_
  - [ ] 10.3 Implement `handleSortChange(value)`: set `AppState.sortOrder`, call `renderTransactionList()`; ensure controls default to `amount-desc` and the selection is preserved during the session
    - _Requirements: 6.1, 6.2, 6.7, 6.8_
  - [ ] 10.4 Implement `handleAddCategory()`: validate with `isValidCategoryName`, show inline error on failure, call `addCategory(name)`, clear input
    - _Requirements: 5.2, 5.3, 5.4_
  - [ ] 10.5 Implement `handleSetLimit()` and `handleClearLimit()`: validate limit value (`isValidAmount`), show inline error on failure, call `setLimit()` or `removeLimit()`, clear input
    - _Requirements: 7.1, 7.5, 7.7_
  - [ ] 10.6 Implement `showToast(message, durationMs)`: set `#toast` `textContent`, add `visible` CSS class, remove it after `durationMs` milliseconds
    - _Requirements: 8.3, 8.4_
  - [ ] 10.7 Implement `init()`: register all event listeners with delegation on stable container elements, call `loadAppState()`, then call all render functions to paint the initial UI
    - _Requirements: 1.2, 2.1, 8.2, 10.3_

- [ ] 11. Checkpoint — Verify full UI integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Finalize CSS styling and accessibility polish
  - [ ] 12.1 Style all form elements, `#summary` header, section cards, and `#limits-table` for clear visual hierarchy; apply font, color, and spacing tokens from CSS custom properties
    - _Requirements: NFR-3_
  - [ ] 12.2 Add `aria-live="polite"` on `#toast` (already in HTML), ensure all form `<input>` and `<select>` elements have associated `<label>` elements, and add `role="status"` where needed for screen reader announcements
    - _Requirements: 10.1_
  - [ ] 12.3 Verify `min-height: 44px; min-width: 44px` applies to all `button`, `input`, and `select` elements and that no content overflows at 320 px viewport width
    - _Requirements: 9.3, 9.4, 9.5_

- [ ] 13. Final checkpoint — Full verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations per property
- Each property test file must include the tag comment format: `// Feature: expense-budget-visualizer, Property N: <property text>`
- The IIFE in `js/app.js` is the single entry point — no module bundler is required
- `renderBalance()`, `renderTransactionList()`, and `renderChart()` are always called together after any transaction mutation to keep the three regions in sync
- `StorageService` must be initialized before any read/write call; `init()` is the sole caller of `loadAppState()`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "3.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4", "3.2"] },
    { "id": 2, "tasks": ["3.3", "4.1", "5.1"] },
    { "id": 3, "tasks": ["3.4", "4.2", "4.3", "4.4", "4.5", "5.2", "5.3", "5.4"] },
    { "id": 4, "tasks": ["4.6", "5.5", "5.6", "7.1", "7.2"] },
    { "id": 5, "tasks": ["7.3", "7.4", "7.5", "8.1", "8.2"] },
    { "id": 6, "tasks": ["8.3", "8.4", "8.5", "9.1"] },
    { "id": 7, "tasks": ["9.2", "9.3"] },
    { "id": 8, "tasks": ["9.4", "10.1", "10.2", "10.3", "10.4", "10.5", "10.6"] },
    { "id": 9, "tasks": ["10.7"] },
    { "id": 10, "tasks": ["12.1", "12.2", "12.3"] }
  ]
}
```
