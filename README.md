# StayNest — PG Management SaaS (Owner Dashboard)

A production-grade, responsive **PG Management System — Owner Dashboard** built for commercial Indian Paying Guest (PG) and co-living property operations.

---

## 🚀 How to View Your Dashboard

The local development server is **already running in the background**!

1. Open your web browser (Chrome, Edge, Firefox, Brave, Safari).
2. Navigate to:
   ```
   http://localhost:5173/
   ```
3. You will immediately see the **StayNest Owner Dashboard** populated with realistic Indian PG sample data across Bangalore & Gurugram.

### Starting / Stopping the Dev Server manually
```bash
# Start local dev server
npm run dev

# Build production bundle with TypeScript checks
npm run build

# Preview production build
npm run preview
```

---

## 🏢 Key Features & Modules

### 1. Persistent Shell & Context
- **Global Property Selector**: Switch between `"All Properties (3)"`, `"StayNest Elite - Koramangala"`, `"StayNest Comfort - HSR Layout"`, and `"StayNest Co-Living - Cyber City"`. Updates all metrics, rooms, payments, and complaints across the dashboard in real-time.
- **Collapsible Sidebar**: Accessible desktop navigation with badge counts (overdue rent alerts, active maintenance tickets) and mobile offcanvas drawer.
- **Notifications Panel**: Unread alerts for overdue rent, tenant vacation notices, and urgent tickets.
- **Reset Demo Data**: Instant one-click rollback to clean sample data at any time from the topbar or settings.

### 2. Overview Dashboard
- **8 Dynamic Metric Cards**:
  - Total Properties, Total Rooms, Occupied Beds, Available Beds, Rent Collected (Current Month), Pending/Overdue Rent, Monthly Expenses, and Net Operating Cash Flow.
- **Quick Operational Actions**: 1-click modal launchers for *Add Property*, *Add Room*, *Add Tenant*, *Record Payment*, *Add Expense*, and *Log Maintenance Ticket*.
- **Accessible Visual Charts**:
  - Stacked monthly rent collection vs outstanding dues (May – Oct 2026).
  - Income vs operating expenses comparative cash flow and operating margin gauge.
- **Urgent Action Banners**: High-priority alert banner for overdue tenant payments with direct review action.

### 3. Property Management (`/properties`)
- Toggleable **Card Grid** and **Data Table** views.
- Occupancy gauges, floor structures, caretaker contact numbers, and amenities tags.
- Detailed modal displaying full addresses, manager contacts, room counts, and active resident roster.
- Full CRUD: Add property, edit information, and archive property with confirmation dialog.

### 4. Rooms & Bed Slots (`/rooms`)
- Visual bed slot blocks (**Bed A**, **Bed B**, **Bed C**) color-coded by occupancy status.
- Strict constraint enforcement preventing over-occupancy beyond room capacity.
- Filters by PG property, floor, sharing type (*Single*, *Double*, *Triple*, *Four*), and vacancy status.
- Detailed room modal showing resident names assigned to each individual bed.

### 5. Tenant Management (`/tenants`)
- Directory with search by name, room number, or mobile number (+91).
- **Cascading Onboarding Modal**: Selecting a property dynamically loads its rooms with vacant beds, auto-populating rent and security deposits.
- **Bed Transfer with Automatic State Sync**: Reassigning a tenant to a new bed automatically frees up their previous bed slot in real-time.
- **Move-Out / Vacate Handling**: Marking a tenant as moved out immediately frees their bed slot for new bookings.
- Tenant profile drawer displaying stay agreement dates, emergency contacts, and complete rent payment history.

### 6. Rent & Payments (`/payments`)
- Full support for Indian payment methods: **UPI** (*Google Pay*, *PhonePe*, *Paytm*), **Bank Transfer** (*NEFT/IMPS*), and **Cash**.
- Handles partial rent collections and maintains accurate outstanding balances.
- **Official Indian PG Rent Receipt Modal**: Complete with receipt numbers (e.g. `REC-2026-1001`), billing period, breakdown of rent, late fee, discount, UTR reference, and a print trigger (`window.print()`).
- Filter tabs: *All Collections*, *Fully Paid*, *Partially Paid*, *Overdue Dues*, and *Pending*.
- CSV Export of all collection records.

### 7. Operating Expenses (`/expenses`)
- Categorized expense tracking: *Electricity (BESCOM/DHBVN)*, *Water Tankers*, *High-speed Internet (Airtel Leased Line)*, *Groceries & Food*, *Staff Salaries*, *Housekeeping Supplies*, and *Repairs*.
- Category totals with percentage breakdown of operational overhead.
- Full CRUD and CSV export.

### 8. Complaints & Maintenance (`/maintenance`)
- Ticket tracking with priority badges (*Urgent*, *High*, *Medium*, *Low*) and status flows (*Open*, *In Progress*, *On Hold*, *Resolved*, *Closed*).
- Staff technician assignment (*Ramu Electrician & Plumber*, *Property Manager*, etc.).
- Repair cost logging and internal technician notes history.

### 9. Staff & Team (`/staff`)
- Directory of property managers, wardens, head cooks, security guards, and cleaning personnel.
- Track assigned properties, monthly salaries, contact numbers, and active assigned maintenance tickets.

### 10. Reports & Analytics (`/reports`)
- Comprehensive property yield table showing gross collections, arrears, expenses, and net operating surplus.
- Net Operating Income (NOI) estimation with clear managerial accounting disclaimers.
- Resident turnover and upcoming notice period expirations.
- Functional **CSV Export** for financial reports and resident rosters.

### 11. Settings & Prototype Persistence (`/settings`)
- Owner profile (Name, email, phone, PAN, GSTIN).
- Business defaults: Currency in INR (₹), default rent due day (5th of each month), grace period days, security deposit multiples.
- WhatsApp rent reminders, SMS overdue alerts, and email statement toggles.
- Architecture details and prototype demo reset controls.

---

## 🛠️ Technology Stack & Architecture

- **Core**: React 19, TypeScript
- **Bundler & Dev Server**: Vite
- **Routing**: React Router DOM v7
- **Styling**: Vanilla CSS with comprehensive CSS custom properties (`tokens.css`, `global.css`, `layout.css`, `components.css`).
  - *Strictly Zero Tailwind CSS, Bootstrap, or Material UI.*
- **Icons**: Lucide React
- **Persistence**: `storageService.ts` abstraction layer over browser `localStorage` with failover and reset mechanisms.
  - Designed with stable IDs (`prop_01`, `room_101`, `bed_101_A`, `tnt_01`, `pay_1001`, `cmp_101`, `stf_01`) for future integration with backend REST/GraphQL APIs and partner dashboards (Tenant Dashboard & Admin Dashboard).

---

## 📂 Project Structure

```
src/
  app/
    App.tsx                # App root with providers
    router.tsx             # Route definitions
  components/
    layout/
      Layout.tsx           # App shell wrapper
      Sidebar.tsx          # Collapsible responsive sidebar
      Topbar.tsx           # Property selector, search, notifications
      PageHeader.tsx       # Standard page header with action buttons
    ui/
      Button.tsx           # Reusable button with variants & sizes
      Input.tsx            # Form input with prefix/suffix icons & error states
      Select.tsx           # Form select dropdown
      Modal.tsx            # Accessible modal dialog
      ConfirmDialog.tsx    # Confirmation for destructive actions
      StatCard.tsx         # KPI cards with trend badges
      StatusBadge.tsx      # Semantic colored badges with indicator dots
      EmptyState.tsx       # Friendly empty states
      Tabs.tsx             # Filter tabs with counters
      Toast.tsx            # Auto-dismissing notification toasts
  context/
    AppContext.tsx         # Global PG state, property filtering, CRUD mutations
    ToastContext.tsx       # Toast notifications provider
  features/
    dashboard/             # Overview page & SVG charts
    properties/            # Property cards, table, and details modal
    rooms/                 # Room management & bed visualizer map
    tenants/               # Resident directory, bed transfers & move-outs
    payments/              # Rent records, partial payments & printable receipts
    expenses/              # Operating expenses & category breakdown
    maintenance/           # Maintenance tickets, notes & technician assignments
    staff/                 # Staff directory & assigned properties
    reports/               # Financial yield reports & CSV exports
    settings/              # Owner profile, defaults & system status
  services/
    mockData.ts            # Realistic Indian PG dataset
    storageService.ts      # Local persistence & reset engine
  types/
    common.ts              # Base entities, OwnerProfile, Notifications
    property.ts            # Property models & amenities
    room.ts                # Room & Bed slot models
    tenant.ts              # Resident & emergency contact models
    payment.ts             # Rent invoices, payments & receipt types
    expense.ts             # Operating expense models
    complaint.ts           # Maintenance & complaint models
    staff.ts               # Staff employee models
  utils/
    formatters.ts          # INR currency, Indian dates, phone formatters
    csvExport.ts           # Real browser CSV file generator
  styles/
    tokens.css             # CSS variables (colors, typography, spacing, shadows)
    global.css             # CSS resets, base elements
    layout.css             # Sidebar, topbar, grid layouts
    components.css         # UI component styling
  main.tsx                 # Application entry point
```

---

## 🤝 Tri-Dashboard Compatibility Notice

The domain models in `src/types/` and services are structured to be exported into a shared package for seamless integration with the **Tenant Dashboard** and **Admin Dashboard**:
- Relationships use stable IDs rather than display strings.
- Status values use normalized enum literals.
- All monetary figures follow Indian Rupee (`INR`) conventions.
