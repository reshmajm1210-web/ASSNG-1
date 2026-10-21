# Export Software Frontend

React frontend for creating and managing Shipping Bills for Indian export jobs (CHA workflow), built on top of [fe-zen-arch](https://github.com/shivamkj/fe-zen-arch.git) — the core shared architecture for B2B SaaS frontends.

### Libraries

- **React 19** [Docs](https://react.dev/reference/react)
- **Tailwind CSS 4** [Docs](https://tailwindcss.com/docs/installation)
- **React Query** [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- **React Hook Form** [Docs](https://www.react-hook-form.com/get-started)
- **Zustand** [Docs](https://zustand.docs.pmnd.rs/)

### Setup

```bash
git submodule update --init   # restores fe-zen-arch (see below if missing)
pnpm install
pnpm dev                      # dev server on port 5173
pnpm lint-check               # prettier + tsc + eslint (fe-zen-arch lint pipeline)
pnpm build                    # production build
```

#### Restoring the `fe-zen-arch` submodule

The repo includes `fe-zen-arch` as a Git submodule (`https://github.com/shivamkj/fe-zen-arch.git`, pinned to commit `4c461bae2da35e6046bf94c2cc94b520db2aa16f`).

- If you cloned this repo with Git: run `git submodule update --init`.
- If you downloaded a ZIP that already contains the `fe-zen-arch/` folder: nothing to do.
- If the folder is empty: `git clone https://github.com/shivamkj/fe-zen-arch.git fe-zen-arch && cd fe-zen-arch && git checkout 4c461bae2da35e6046bf94c2cc94b520db2aa16f`.

### Project architecture

```
src/
├── dashboard/          List dashboard (bill list, search, flat-file download)
├── data/               Static reference data (scheme codes, quantity codes, states, e-Sanchit
│                       document codes, trade agreements, option lists, seed shipping bills)
├── shared/             Routes, layout, request interceptors
└── shipping-bills/     Shipping bill domain:
    ├── shipping-bill-form.tsx        Form orchestrator (tabs, draft save, quick-add dialogs)
    ├── details-tab / invoice-editor / item-editor / charges-row
    │   containers-tab / packing-tab / documents-tab / licenses-tab
    │                               Small reusable form sections
    ├── async-search-select.tsx       Searchable select backed by async services
    ├── shipping-bill-validation.ts   Validation schema (fe-zen-arch schema builder)
    ├── shipping-bill-payload.ts      Form <-> payload conversions + flat-file builder
    ├── shipping-bill-service.ts      Async mock service for shipping bills (CRUD + flat file)
    ├── party-mock-service.ts         Async mock service for parties, branches, ports
    ├── reference-data-service.ts     Async mock service for all dropdown option lists
    ├── marks-and-numbers-source.ts   Marks & numbers data source (per exporter)
    ├── demo-store.ts                 Local mock database (browser localStorage)
    └── party-dialogs.tsx             Quick-add exporter/business/branch dialogs
```

#### Layer responsibilities

- **UI (components, tabs, dialogs)** — render forms and lists, call service functions only. UI code never touches `localStorage` or the mock store directly.
- **Service layer** (`shipping-bill-service`, `party-mock-service`, `reference-data-service`) — asynchronous Promise-based functions with simulated network delays and explicit errors. This layer is the single replacement point for a real HTTP API later.
- **Mock store** (`demo-store.ts`) — the local database persisted in `localStorage` (`export-software-shipping-bills-v2`). Only service functions read/write it. Previously saved data is merged and preserved across refactors.
- **Payload conversion** (`shipping-bill-payload.ts`) — one consistent implementation of `toShippingBillPayload()` (domain payload stored with each bill) and `toHttpShippingBillPayload()` (simulated `POST /api/shipping-bills` request body), plus `normalizeApiBill()` and the ICEGATE-style flat file (`.sb`) generator.

The dashboard fetches bills through React Query (`shippingBillService.list()`) and shows loading, error and empty states. `list()` returns the 23 seed bills plus every bill saved in the mock store, so newly saved bills appear immediately and survive a browser refresh.

### Validation rules and domain assumptions

Validation uses the existing fe-zen-arch schema builder (`s`) in `src/shipping-bills/shipping-bill-validation.ts` — no extra validation library.

- Required fields: job date, exporter + branch, consignee + branch, loading and destination ports, invoice number/date/currency/contract, item RITC code, goods description, quantity and unit price.
- Quantity and unit price must be above zero; invoice total cannot be negative.
- **Net weight must not exceed gross weight.**
- **Packing range start number must not exceed the packing range end number.**
- **Invoice date must not be later than the job date.** Domain assumption: the job date is the CHA job opening date and is therefore on or before any commercial invoice date for that job.

Domain terms used in the UI: **IEC** (exporter's Import-Export Code), **RITC/HS code** (product classification), **FOB/CIF** (trade terms for cost and responsibility), **Drawback/RODTEP** (export refund/incentive schemes, subject to eligibility), **e-Sanchit** (electronic submission of supporting documents to Customs).

### AI Usage & Approach

- The code in this repository was written, refactored and checked with the assistance of an AI coding agent (Arena.ai Agent Mode), working in the existing codebase — the application was not rebuilt from scratch.
- The refactoring approach: recover the existing project, keep the UI/fields/workflows intact, split the large form file into small components, centralize validation and payload conversion, and route all data access through async mock services over the existing localStorage store.
- Checks that were actually run: `pnpm lint-check` (passes — 0 errors), `pnpm build` (passes), plus automated Node smoke tests of the service layer (bill list/create/update/persistence, error handling, flat file, party quick-add) and dev-server/preview module load checks.
- Manual browser testing (clicking through the UI in a real browser) was not available in the build environment and is not claimed.

<!-- Personal notes to complete before submitting:
- [ ] Why this project / what I learned while building it
- [ ] Which parts of the code I wrote myself vs. changed with AI assistance
- [ ] Results of my own manual testing in the browser
- [ ] Any decisions I made about the domain rules or UI
-->

### Notes

- `core`, `ui`, `auth`, `icons` are fe-zen-arch workspace packages, aliased via tsconfig paths & vite aliases.
- Forms are built with `useForm` from `core/form` + `Form` / `SubmitButton` from `core/form/components`.
- Routing uses fe-zen-arch's zustand router: routes in `src/shared/routes.tsx`, paths in `src/shared/route-paths.ts`.
- There is no real backend. The hardcoded server URL was removed; every module talks to the async mock services described above.
- Don't use react-query mutation for react-hook-form submit handlers.
- For HMR, a file should export only React components (constants live in separate modules).
- While most input elements use `...register('name')`, custom elements like select require `<Select<T> name="name" />` instead.
