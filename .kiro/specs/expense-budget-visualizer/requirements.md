# Requirements Document

## Introduction

The Expense & Budget Visualizer is a mobile-friendly, client-side web application that helps users track their daily spending. It provides a dashboard showing total balance, a transaction history list, and a visual chart of spending by category. Users can define custom categories, sort transactions, and set per-category spending limits with visual highlights when those limits are exceeded. All data is persisted in the browser's Local Storage — no backend server is required.

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single record of income or expenditure, consisting of a title, amount, date, and category.
- **Balance**: The running total calculated from all transactions (income minus expenses).
- **Category**: A label assigned to a transaction (e.g., Food, Transport). Categories may be predefined or user-defined.
- **Spending Limit**: A user-defined maximum amount for a given category within the current month.
- **Chart**: A visual representation (e.g., pie or bar chart) of spending distribution across categories, rendered using the HTML Canvas API or inline SVG.
- **Local Storage**: The browser's `localStorage` API used to persist all application data client-side.
- **Transaction List**: The scrollable UI panel displaying all recorded transactions in chronological or sorted order.
- **Sort Order**: The currently selected criterion for ordering the Transaction List — either by amount or by category name.

---

## Requirements

### Requirement 1: Display Total Balance

**User Story:** As a user, I want to see my current total balance at a glance, so that I know how much money I have available.

#### Acceptance Criteria

1. THE App SHALL calculate the Balance by summing all income transactions and subtracting all expense transactions stored in Local Storage, where each transaction amount is a numeric value between 0.01 and 999,999,999.99.
2. WHEN the App loads, THE App SHALL display the current Balance prominently on the dashboard as the first visible element in the summary section, above the transaction list.
3. WHEN a Transaction is added or deleted, THE App SHALL recalculate and update the displayed Balance within 500 milliseconds without requiring a page reload.
4. THE App SHALL display the Balance with exactly two decimal places and a single currency symbol prefix (e.g., "$100.00").
5. IF Local Storage contains no transactions, THEN THE App SHALL display a Balance of "0.00" with the currency symbol.

---

### Requirement 2: Transaction History

**User Story:** As a user, I want to view a history of all my transactions, so that I can review past income and expenses.

#### Acceptance Criteria

1. THE App SHALL display all Transactions in a Transaction List on the dashboard.
2. WHEN the App loads, THE App SHALL render the Transaction List in reverse-chronological order by default (most recent first).
3. WHEN a new Transaction is added, THE App SHALL prepend it to the Transaction List and update the view within 1 second.
4. WHEN a Transaction is deleted, THE App SHALL remove it from the Transaction List and update the Balance and Chart within 1 second.
5. THE App SHALL display each Transaction entry with its title, amount, date, and category.
6. THE App SHALL visually distinguish income transactions from expense transactions using color (e.g., green for income, red for expense) and a sign prefix (+ for income, − for expense).
7. IF the Transaction List is empty, THE App SHALL display a message indicating that no transactions have been recorded yet.

---

### Requirement 3: Add a Transaction

**User Story:** As a user, I want to add a new income or expense transaction, so that I can keep my records up to date.

#### Acceptance Criteria

1. THE App SHALL provide a form with fields for title (text, max 100 characters), amount (numeric), date (calendar date), category (selectable from a predefined list), and transaction type (income or expense).
2. WHEN the user submits the form with all required fields populated, THE App SHALL save the Transaction to Local Storage and update the dashboard totals and transaction list to reflect the new entry.
3. IF the user submits the form with one or more required fields empty, THEN THE App SHALL display an inline validation message adjacent to each empty field identifying it as required and prevent saving.
4. IF the user enters a non-numeric value or a value less than or equal to 0 in the amount field, THEN THE App SHALL display a validation message adjacent to the amount field and prevent saving.
5. IF the user enters a value greater than 999,999,999.99 in the amount field, THEN THE App SHALL display a validation message adjacent to the amount field indicating the maximum allowed amount and prevent saving.
6. WHEN a Transaction is saved successfully, THE App SHALL clear all form fields and return focus to the title input within 300 milliseconds.

---

### Requirement 4: Spending Chart by Category

**User Story:** As a user, I want to see a visual breakdown of my spending by category, so that I can understand where my money goes.

#### Acceptance Criteria

1. THE App SHALL render a Chart on the dashboard showing the percentage share and absolute amount of each Category, calculated from all expense transactions.
2. WHEN an expense transaction is added, deleted, or modified, THE App SHALL update the Chart within 500 milliseconds to reflect the current totals for each Category.
3. THE App SHALL assign a distinct color to each Category in the Chart, such that no two Categories visible simultaneously share the same color.
4. THE App SHALL display a legend mapping each color to its Category name and the Category's total spending amount.
5. WHEN there are no expense transactions, THE App SHALL display a placeholder message indicating no spending data is available in place of the Chart.
6. IF the number of Categories with expense transactions exceeds 10, THEN THE App SHALL group Categories beyond the top 10 by total spending amount into a single "Other" segment in the Chart.

---

### Requirement 5: Custom Categories

**User Story:** As a user, I want to create my own spending categories, so that I can organize transactions in a way that fits my lifestyle.

#### Acceptance Criteria

1. THE App SHALL provide a set of predefined categories (e.g., Food, Transport, Health, Entertainment, Other).
2. WHEN the user submits a new category name (max 50 characters, unique within all existing categories), THE App SHALL save it to Local Storage and make it available in the category selection list without requiring a page reload.
3. IF the user attempts to add a Category name that already exists (case-insensitive), THEN THE App SHALL display a validation message and prevent duplication.
4. IF the user submits an empty or blank Category name, THEN THE App SHALL display a validation message and prevent saving.

---

### Requirement 6: Sort Transactions

**User Story:** As a user, I want to sort my transaction history by amount or category, so that I can quickly find and analyze specific transactions.

#### Acceptance Criteria

1. THE App SHALL provide sort controls allowing the user to sort the Transaction List by amount (ascending or descending) or by category name (A–Z or Z–A).
2. WHEN the user selects a Sort Order, THE App SHALL re-render the Transaction List in the chosen order within 300 milliseconds.
3. WHEN the Sort Order is by amount descending, THE App SHALL display the highest-amount transactions first, ordering transactions with equal amounts by their date descending as a tiebreaker.
4. WHEN the Sort Order is by amount ascending, THE App SHALL display the lowest-amount transactions first, ordering transactions with equal amounts by their date descending as a tiebreaker.
5. WHEN the Sort Order is by category name A–Z, THE App SHALL display transactions ordered alphabetically by Category name from A to Z, ordering transactions within the same Category by their date descending as a tiebreaker.
6. WHEN the Sort Order is by category name Z–A, THE App SHALL display transactions ordered alphabetically by Category name from Z to A, ordering transactions within the same Category by their date descending as a tiebreaker.
7. THE App SHALL preserve the selected Sort Order during the current session.
8. IF the Transaction List is empty, THEN THE App SHALL display the sort controls in their default state with amount descending as the default Sort Order and show a message indicating no transactions are available to sort.

---

### Requirement 7: Spending Limit per Category

**User Story:** As a user, I want to set a spending limit for each category, so that I can be alerted when I overspend in a particular area.

#### Acceptance Criteria

1. THE App SHALL allow the user to set a numeric Spending Limit, between 0.01 and 999,999,999.99, for any Category.
2. THE App SHALL save Spending Limits to Local Storage and persist them across page reloads.
3. WHEN the total expense amount for a Category in the current calendar month meets or exceeds its Spending Limit, THE App SHALL visually highlight that Category in both the Transaction List and the Chart using a distinct warning indicator (a warning color or icon different from the default state).
4. WHEN the user updates a Spending Limit, THE App SHALL re-evaluate all Categories and update their visual highlight states within 1 second.
5. IF the user sets a non-numeric or non-positive value as a Spending Limit, THEN THE App SHALL display a validation message indicating the required format and prevent saving the value.
6. IF a Category has no Spending Limit set, THEN THE App SHALL display that Category without any warning highlight regardless of its total expense amount.
7. WHEN the user removes a Spending Limit from a Category, THE App SHALL clear any existing warning highlight for that Category within 1 second.

---

### Requirement 8: Data Persistence via Local Storage

**User Story:** As a user, I want my data to be saved automatically so that I do not lose my transactions when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Transaction, custom Category, or Spending Limit is created, updated, or deleted, THE App SHALL write the updated data set to Local Storage within 1 second.
2. WHEN the App loads, THE App SHALL read all Transactions, custom Categories, and Spending Limits from Local Storage and restore the previous state before rendering any data-dependent UI.
3. IF Local Storage is unavailable or a read fails on load, THEN THE App SHALL display a non-blocking error message informing the user that data persistence is unavailable and continue with an empty initial state.
4. IF a write to Local Storage fails, THEN THE App SHALL display a non-blocking error message informing the user that the change could not be saved.

---

### Requirement 9: Responsive Mobile-Friendly Layout

**User Story:** As a user, I want to use the app comfortably on my phone, so that I can log transactions on the go.

#### Acceptance Criteria

1. THE App SHALL use a single-column responsive layout on screens narrower than 600px, stacking sections in the order: summary (balance), chart, transaction list.
2. THE App SHALL use an adaptive layout on screens 600px and wider, displaying the chart and transaction list side by side with the chart occupying between 40% and 60% of the available width.
3. THE App SHALL render all interactive controls (buttons, inputs, dropdowns) at a minimum touch target size of 44×44 CSS pixels.
4. THE App SHALL ensure all content and controls are fully visible within the viewport without horizontal scrolling on screens as narrow as 320px.
5. THE App SHALL ensure that text content wraps or truncates appropriately at 320px viewport width so that no interactive controls are hidden or clipped.

---

### Requirement 10: Browser Compatibility

**User Story:** As a developer, I want the app to work across modern browsers without a build step, so that any user can open it directly.

#### Acceptance Criteria

1. THE App SHALL pass all acceptance criteria without errors or degraded behavior in the current stable versions of Chrome, Firefox, Edge, and Safari.
2. THE App SHALL be implemented using only HTML, CSS, and vanilla JavaScript — no external frameworks, transpilers, or bundlers are required.
3. THE App SHALL load and become fully interactive within 5 seconds from a single entry-point HTML file opened directly in a browser (file:// protocol or local server) with no additional installation or configuration steps required.
4. IF a browser does not support a required Web API (e.g., localStorage), THEN THE App SHALL display a message informing the user that the browser is not supported.

---

## Technical Constraints

- **TC-1 — Technology Stack**: Structure in HTML, styling in CSS, logic in vanilla JavaScript. No frameworks (React, Vue, Angular, etc.).
- **TC-2 — Data Storage**: All data stored exclusively in the browser's `localStorage` API. No backend or external API calls.
- **TC-3 — Browser Compatibility**: Must work in Chrome, Firefox, Edge, and Safari (current stable versions). May also be packaged as a browser extension.
- **Folder Rules**: One CSS file in `css/`, one JavaScript file in `js/`.

## Non-Functional Requirements

- **NFR-1 — Simplicity**: Clean, minimal interface. No complex setup. No test framework required.
- **NFR-2 — Performance**: Fast initial load. UI interactions respond within 100ms of user input. No noticeable lag when adding or deleting transactions.
- **NFR-3 — Visual Design**: Clear visual hierarchy, readable typography, and a user-friendly aesthetic appropriate for a personal finance tool.
