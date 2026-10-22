## Export Software Frontend

Built on top of [fe-zen-arch](git@github.com:shivamkj/fe-zen-arch.git) — the core shared architecture for B2B SaaS frontends.

An export job needs a **shipping bill** before goods leave the country. This app lets a CHA (customs
house agent) create a shipping bill, search and edit existing ones, and download the flat file that
is used for filing.

### Libraries

- **React** [Docs](https://react.dev/reference/react)
- **Tailwind CSS** [Docs](https://tailwindcss.com/docs/installation)
- **React Query** [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- **React Hook Form** [Docs](https://www.react-hook-form.com/get-started)
- **Zustand** [Docs](https://zustand.docs.pmnd.rs/)

### Setup

```bash
pnpm install   # fe-zen-arch is included as a git submodule, init it first if missing
pnpm dev       # dev server on port 5173
pnpm lint      # prettier + tsc + eslint (fe-zen-arch lint pipeline, auto-fixes)
pnpm lint-check # same pipeline without --fix: what CI should use
pnpm build     # production build
```

Type checking on its own:

```bash
pnpm exec tsc --noEmit                # full check
pnpm exec tsc --noEmit --incremental  # incremental, uses node_modules/.tmp/tsconfig.app.tsbuildinfo
```

### Architecture

Three layers, and dependencies only ever point downwards:

```
UI components            src/dashboard/*, src/shipping-bills/*-tab.tsx, *-editor.tsx
      ↓  async calls
Service layer            shippingBillService, partyMockService, referenceDataService, mockDelay
      ↓
Data layer               demo-store (localStorage) + src/data/* (read-only master data)
```

Rule of thumb: **a component never imports `demo-store` or a `src/data/*` array.** It calls a
service, which returns a `Promise`. That is what makes the mock replaceable with a real HTTP API:
only the service bodies change.

```
src/
├── index.tsx                    app bootstrap (router, React Query, toasts)
├── shared/
│   ├── routes.tsx               route table
│   ├── route-paths.ts           route helpers (dashboard, new bill, edit bill)
│   └── application-layout.tsx   page shell
├── dashboard/
│   └── list-dashboard.tsx       bill list: search, stats, open, flat-file download
├── data/                        read-only master data and demo fixtures
│   ├── demo-shipping-bills.ts   demo "server" records for the dashboard
│   ├── ports.ts                 port codes (loading + destination)
│   ├── scheme-codes.ts          scheme codes + drawback/RODTEP/ROSCTL flags
│   ├── quantity-code.ts         UQC (unit of quantity) codes
│   ├── e-sanchit-codes.ts       e-Sanchit document type codes
│   ├── states.ts, trade-agrements.ts, types.ts
├── shipping-bills/
│   ├── shipping-bill-form.tsx   screen coordinator: state, tabs, save, dialogs
│   ├── shipping-bill-schema.ts  all validation rules
│   ├── form-types.ts            shared prop types + form constants
│   ├── form-sections.tsx        SectionHeading / Advanced / PersistentTab
│   ├── details-tab.tsx          tab 1
│   ├── invoice-editor.tsx       tab 2: one invoice
│   ├── item-editor.tsx          tab 2: one goods item
│   ├── containers-tab.tsx       tab 3: containers (+ packing)
│   ├── packing-tab.tsx          tab 3: packing ranges
│   ├── documents-tab.tsx        tab 3: e-Sanchit supporting documents
│   ├── licenses-tab.tsx         tab 3: licences
│   ├── charges-row.tsx          reusable freight/insurance/… row
│   ├── async-search-select.tsx  reusable async dropdown
│   ├── party-fields.tsx         reusable party + branch picker
│   ├── party-dialogs.tsx        quick-add exporter / business / branch dialogs
│   ├── shipping-bill-service.ts async shipping bill API (mock)
│   ├── party-mock-service.ts    async party API (mock)
│   ├── reference-data-service.ts async dropdown/master data API (mock)
│   ├── mock-network.ts          shared fake latency + error type
│   ├── demo-store.ts            the only module that touches localStorage
│   ├── model.ts                 types, empty defaults, totals
│   ├── shipping-bill-payload.ts payload conversion + flat file generation
│   ├── marks-and-numbers-source.ts marks & numbers data source
│   └── workflow.ts              the four workflow step cards
```

### UI components and what each one owns

| Component                                | Responsibility                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `shipping-bill-form.tsx` (`BillEditor`)  | Form state, active tab, save workflow, quick-add dialogs, tab composition. No field markup of its own. |
| `ShippingBillPage` (same file)           | Reads `:id` from the route, loads the bill asynchronously, shows loading / not-found.                  |
| `details-tab.tsx`                        | Parties, route, regulatory exceptions, package detail, marks & numbers.                                |
| `invoice-editor.tsx`                     | One invoice: header, money rows, buyer/third party, item list, invoice total.                          |
| `item-editor.tsx`                        | One goods item, including the collapsible customs/tax/incentive section.                               |
| `containers-tab.tsx` / `packing-tab.tsx` | Container details and the packing list ranges.                                                         |
| `documents-tab.tsx`                      | Supporting documents and their issuing/beneficiary details.                                            |
| `licenses-tab.tsx`                       | Licence records.                                                                                       |
| `list-dashboard.tsx`                     | Bill list, search, stats and flat-file download.                                                       |

### Reusable components

- **`ChargesRow`** — the invoice has five money rows (freight, insurance, commission, discount,
  other deductions). They share layout and behaviour (you may enter _either_ a percentage rate
  _or_ an amount; leaving the currency empty means "invoice currency"). Previously this was five
  near-identical copies of the same JSX; now the field names are derived from a `kind` prop.
- **`AsyncPartySelect`** — one searchable dropdown. It receives the search function as a prop, so the
  same component serves parties, branches, ports, document types and file types.
- **`PartyFields`** — party dropdown plus its branch dropdown, including "＋ Add new" and
  "＋ Add branch".
- **`SectionHeading`, `Advanced`, `PersistentTab`** — layout helpers. `PersistentTab` keeps hidden
  tabs mounted so React Hook Form validates the whole bill on submit.

### Service layer

| Service                | Functions                                                                                                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shippingBillService`  | `list`, `get`, `create`, `update`, `save`, `getFlatFile`, `downloadFlatFile`, `toApiPayload`                                                                                                                                                       |
| `partyMockService`     | `searchExporters`, `listExporters`, `searchExporterBranches`, `searchConsignees`, `listBusinesses`, `searchConsigneeBranches`, `getExporterById`, `getConsigneeById`, `getBranches`, `getBranchById`, `saveExporter`, `saveBusiness`, `saveBranch` |
| `referenceDataService` | `loadReferenceData`, `searchLoadingPorts`, `searchDestinationPorts`, `getPortByCode`, `searchDocumentCodes`, `searchFileTypes`, `getMarksAndNumbers`                                                                                               |

All of them return Promises and simulate latency through `mock-network.ts` (250 ms for
list/get/save, 100 ms for single-record lookups). Failures are **thrown**, never swallowed: the UI
either shows an inline error state (dashboard, not-found page) or a toast (save actions).

`demo-store.ts` is the only module that reads or writes `localStorage` (key
`export-software-shipping-bills-v2`). It also merges newly added seed parties into an existing
browser store, so stored bills are never overwritten.

### Asynchronous data flow

1. The dashboard mounts and React Query calls `shippingBillService.list()`.
2. The service merges **saved bills** (demo store) with **demo fixture bills**
   (`src/data/demo-shipping-bills.ts`), newest first, and resolves after the mock latency.
3. While the query is loading the list area shows `Loading shipping bills...`; on failure it shows
   the error message plus **Try again**; with no rows it shows the empty state.
4. Opening a bill routes to `/shipping-bills/:id`; the page queries `shippingBillService.get(id)`.
5. Saving calls `shippingBillService.save(values, draftId)`; the store writes to `localStorage`
   synchronously _inside the service_, and the promise resolves only after that call succeeded.
6. `Save & Next` and `Previous` save a draft the same way, so the two paths behave identically.
7. Reference data (ports, codes, currencies, …) is loaded once with React Query under the
   `['reference-data']` key and passed down as props.

### Validation rules

Declared in `shipping-bill-schema.ts` using the framework's own schema builder (`s`), so no extra
validation library is involved. Rules are resolved by the **leaf** field name, which is why the
schema lists `quantity`, `invoiceDate` and so on rather than full paths.

Required: job date, exporter + branch, consignee + branch, loading port, final destination port,
invoice number, invoice date, currency, contract type, RITC/HS code, goods description, quantity,
unit and unit price.

Value rules:

- quantity and unit price must be above zero;
- invoice total cannot be negative;
- **net weight cannot be greater than the gross weight**;
- **the packing end number cannot be smaller than the packing start number**;
- **the invoice date cannot be later than the job date**.

The last three are cross-field rules implemented with `refine((value, formData) => …)`. The messages
are shown by the normal `InputError` component next to the offending field.

### Domain terms and assumptions

- **IEC** — the exporter's Import-Export Code issued by DGFT; used to identify the exporter.
- **RITC / HS code** — the product classification code that decides duty and incentive eligibility.
- **FOB / CIF / CF / CI** — trade terms that decide who pays freight and insurance, and how the
  invoice value is built. They are selected per invoice (`contractType`).
- **Drawback / RODTEP / ROSCTL** — export refund or incentive schemes. The scheme code decides
  whether the drawback fields are shown.
- **e-Sanchit** — electronic submission of supporting documents to Customs; documents are captured
  with a document type code and an image reference number.
- **Job date as the upper bound for invoice dates** — assumption: the job is booked before any
  invoice is raised for it, so an invoice dated after the job date is treated as a data-entry error.
- **There is no backend.** All data is mock data held in `localStorage` plus read-only fixtures.
  `toApiPayload` documents the body a real `POST /api/shipping-bills` would receive, and the service
  functions are the only place that would need to change.
- **Demo fixture bills** (ids 1000–1028) are read-only. Saving a bill with the same id stores a copy
  in `localStorage`, which then wins over the fixture.
- **Business parties** are searched through their consignee records; a business that is only marked
  as buyer/third party is not offered in the dropdowns. This matches the previous behaviour and is
  left unchanged.
- **Flat file** — generated in the browser as `^`-separated ICEGATE-style records
  (`shipping_bill_<job>.sb`).

### Checks before committing

```bash
pnpm build       # production build
pnpm exec tsc --noEmit --incremental
pnpm lint-check  # prettier --check + tsc --incremental + eslint, no auto-fix
```

`pnpm lint-check` requires the working tree to be already formatted: its first step runs
`prettier --write` and fails the run if it had to change anything. Run `pnpm lint` before it.

### Notes

- `core`, `ui`, `auth`, `icons` are fe-zen-arch workspace packages, aliased via tsconfig paths & vite aliases.
- Forms are built directly with `useForm` from `core/form` + `Form` / `SubmitButton` from `core/form/components` — no generic form templates.
- Routing uses fe-zen-arch's zustand router: routes defined in `src/shared/routes.tsx`, paths in `src/shared/route-paths.ts`.
- Auth uses the fe-zen-arch auth module (routes, interceptors, login pages) out of the box.
- Don't use react-query mutation for react-hook-form submit handler.
- For HMR (hot refresh), the file must export only react component, and not any other constant or object.
- While most input elements use `...register('name')`, custom elements like select require `<Select<T> name="name" />` instead.
- Component filenames must be kebab-case (`details-tab.tsx`, not `DetailsTab.tsx`) — enforced by the
  `check-file` ESLint rule.
- `src/shared/interceptors.ts` keeps its `console.error` on purpose: it is the app's global error
  reporting hook, not debug logging.

### AI Usage & Approach

This section records how the refactoring was done. Parts that describe _my own_ review, learning and
manual testing are marked **[TO CONFIRM]** — they must be completed by me, not invented.

**Tooling used**

- An AI coding agent (Arena.ai Agent Mode) working directly in the repository.
- The repository's existing toolchain for verification: `pnpm build`, `pnpm exec tsc --noEmit`,
  `pnpm lint-check` (prettier + tsc + eslint from `fe-zen-arch/scripts/lint.sh`). No new packages
  were installed and no framework file was modified.

**How AI assisted**

1. Read the existing code and located the real cause of each reported problem before changing
   anything (including the invoice/item index bug at the "Unit of rate" field).
2. Proposed a file-by-file plan, which I approved before implementation started.
3. Moved data access behind services, split the 1,761-line form into focused components, extracted
   the repeated charge rows, consolidated the two payload converters' shared helpers, added the three
   cross-field validation rules, replaced the dashboard's manual fetching with React Query, and
   removed the development `console.log` calls.
4. Ran the checks and reported actual output rather than assumptions.

**Implementation decisions I reviewed with the AI [TO CONFIRM]**

- [ ] Keeping two payload shapes (stored document vs HTTP body) instead of forcing one.
- [ ] Removing the LAN backend calls and making the mock service the only data path.
- [ ] Renaming the dashboard button from "Sync from API" to "Refresh".
- [ ] Merging demo fixture bills with saved bills so a newly created bill appears on the dashboard.
- [ ] Treating the job date as the upper boundary for invoice dates.
- [ ] …add anything else I want to record here…

**What I learned [TO CONFIRM]**

- …for example: why leaf-name validation is used, why `PersistentTab` keeps hidden tabs mounted,
  why UI code should not import the store, how React Query handles loading/error/empty states…

**How the work was validated**

Automated (actually executed by the agent, results reproduced below): production build, TypeScript
check, lint check, plus two small throwaway scripts that (a) called the new `refine` validators with
sample values and (b) reproduced the old invoice/item index expression to show it threw while the new
one did not.

Manual/browser testing [TO CONFIRM]: the development server was **not** started by the agent, so the
following were not tested in a browser and were left for me to perform:

- [ ] Dashboard loads and lists bills; search filters by job number, invoice, exporter, consignee.
- [ ] Create a new bill, fill details, add invoices/items, use Save & Next through the tabs.
- [ ] Quick-add an exporter and a consignee, then confirm the branch is auto-selected.
- [ ] Enter freight/insurance/commission/discount/other deductions and check the rate-amount lock.
- [ ] Add a second invoice with one item and confirm the goods section no longer crashes.
- [ ] Save, reload the page and confirm the bill is still listed and editable.
- [ ] Trigger the three cross-field validation messages.
- [ ] Download the flat file from the dashboard.
- [ ] Check the loading, empty and error states of the dashboard list.
