## Export Software Frontend

Indian export documentation and Shipping Bills management frontend built on top of [fe-zen-arch](https://github.com/shivamkj/fe-zen-arch.git) — the core shared architecture for B2B SaaS frontends.

### Libraries

- **React 19** [Docs](https://react.dev/reference/react)
- **TypeScript 6 & Vite 8** [Docs](https://vite.dev/)
- **Tailwind CSS 4** [Docs](https://tailwindcss.com/docs/installation)
- **TanStack React Query 5** [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- **React Hook Form 7** [Docs](https://www.react-hook-form.com/get-started)
- **Zustand 5** [Docs](https://zustand.docs.pmnd.rs/)

### Setup & Commands

```bash
# 1. If cloned from Git without submodules, initialize fe-zen-arch first:
git submodule update --init --recursive

# 2. Install workspace dependencies with pnpm:
pnpm install

# 3. Start the Vite development server on http://localhost:5173/
pnpm dev

# 4. Run validation and production build:
pnpm exec tsc --incremental   # TypeScript incremental check
pnpm lint-check               # Prettier + TypeScript + ESLint check
pnpm build                    # Production build to dist/
```

> **Custom Port Note:** `vite.config.js` reads `<port>` and `<entry>` as positional arguments after `--`. If port `5173` is already in use on your machine, stop the process using port `5173` or run `npx vite -- 5174 src/index.tsx` from the repository root (not `pnpm dev --port 5174`).

### Shipping Bills Module Structure (`src/shipping-bills/`)

- `shipping-bill-form.tsx` — Page loader (`ShippingBillPage`) and form coordinator (`BillEditor`)
- `details-tab.tsx` — Tab 1: Shipment basics, Exporter/Consignee selection, ports, cargo & weight details
- `invoice-editor.tsx` — Tab 2: Invoice header, Buyer/Third-party details, freight/insurance/charge rows, and items list
- `invoice-charge-row.tsx` — Reusable `InvoiceChargeRow` for Freight, Insurance, Commission, Discount, and Other deductions
- `goods-item-editor.tsx` — Export line-item editor (RITC/HS code, quantity, unit price, Drawback/RoDTEP/RoSCTL, IGST)
- `containers-packing-section.tsx` — Tab 3: Shipping containers and package number ranges
- `documents-licenses-section.tsx` — Tab 3: Supporting e-Sanchit documents and export licences
- `party-fields.tsx`, `async-party-select.tsx`, `party-dialogs.tsx` — Async party/branch dropdowns and quick-add modals
- `validation.ts`, `model.ts`, `form-types.ts`, `form-primitives.tsx`, `workflow.ts` — Validation schemas, domain models, unified payload converters, and shared form UI helpers
- `shipping-bill-service.ts`, `party-mock-service.ts`, `lookup-service.ts`, `marks-and-numbers-source.ts`, `demo-store.ts` — Asynchronous Promise-based mock services backed by seed data and browser `localStorage`

### Architecture Notes

- `core`, `ui`, `auth`, and `icons` are `fe-zen-arch` workspace packages aliased via `tsconfig.json` paths and `vite.config.js` aliases.
- Forms are built with `useForm` from `core/form` and `Form` / `SubmitButton` from `core/form/components`.
- Routing uses `fe-zen-arch`'s Zustand router (`src/shared/routes.tsx` and `src/shared/route-paths.ts`).
- Don't use React Query `useMutation` directly as the React Hook Form `handleSubmit` callback.
- For Vite Fast Refresh (HMR), `.tsx` component files export only React components (and TypeScript types).
- While standard input elements use `{...register('name')}`, custom select components require `<Select<T> name="name" />`.
