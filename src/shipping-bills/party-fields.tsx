/**
 * Exporter / consignee / buyer / third-party picker: a party dropdown plus its
 * branch (address) dropdown.
 *
 * All lookups go through `partyMockService`; the component never reads the demo
 * store, so replacing the mock with an API changes nothing here.
 */

import { useEffect } from 'react'
import { AsyncPartySelect } from './async-search-select'
import type { BillFormContext, BranchPath, OwnerPath } from './form-types'
import { partyMockService } from './party-mock-service'

export function PartyFields({
  formCtx,
  ownerName,
  branchName,
  label,
  kind,
  required = true,
  onAddBranch,
  onQuickAdd
}: {
  formCtx: BillFormContext
  ownerName: OwnerPath
  branchName: BranchPath
  label: string
  kind: 'exporter' | 'business'
  required?: boolean
  onAddBranch: (ownerId: number) => void
  onQuickAdd: () => void
}) {
  const ownerId = formCtx.hooks.watch(ownerName)
  const hasOwner = ownerId !== undefined && ownerId !== ''

  // If the chosen party has branches but the selected one does not belong to it
  // any more (e.g. the exporter was changed), clear the stale selection.
  useEffect(() => {
    let active = true

    async function clearStaleBranch() {
      const selectedBranch = formCtx.hooks.getValues(branchName)
      if (!hasOwner || selectedBranch === undefined || selectedBranch === '') return
      try {
        const branches = await partyMockService.getBranches(kind, ownerId)
        if (!active || branches.length === 0) return
        if (!branches.some((branch) => String(branch.id) === selectedBranch)) {
          formCtx.hooks.setValue(branchName, '', { shouldValidate: true })
        }
      } catch {
        // A failed lookup keeps the saved value; it must not wipe the user's selection.
      }
    }

    void clearStaleBranch()
    return () => {
      active = false
    }
  }, [branchName, formCtx.hooks, hasOwner, kind, ownerId])

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{label}</span>
          <button type="button" className="text-primary-700 text-xs font-medium hover:underline" onClick={onQuickAdd}>
            + Add new
          </button>
        </div>
        <AsyncPartySelect
          name={ownerName}
          placeholder={`Search & select ${kind}...`}
          rules={{ required }}
          fetchOptions={async (query) => {
            if (kind === 'exporter') {
              const res = await partyMockService.searchExporters(query)
              return res.map((item) => ({
                value: String(item.id),
                label: item.name,
                sublabel: item.iec !== '' ? `IEC: ${item.iec}` : undefined
              }))
            }
            const res = await partyMockService.searchConsignees(query)
            return res.map((item) => ({
              value: String(item.id),
              label: item.name
            }))
          }}
          getInitialLabel={async (id) => {
            if (kind === 'exporter') {
              const item = await partyMockService.getExporterById(id)
              return item ? item.name : ''
            }
            const item = await partyMockService.getConsigneeById(id)
            return item ? item.name : ''
          }}
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Branch / address</span>
          {hasOwner && (
            <button
              type="button"
              className="text-primary-700 text-xs font-medium hover:underline"
              onClick={() => onAddBranch(Number(ownerId))}>
              + Add branch
            </button>
          )}
        </div>
        <AsyncPartySelect
          name={branchName}
          placeholder={hasOwner ? 'Search & select branch...' : `Choose ${kind} first`}
          disabled={!hasOwner}
          rules={{ required: required || hasOwner }}
          deps={[ownerId]}
          fetchOptions={async (query) => {
            if (!hasOwner) return []
            if (kind === 'exporter') {
              const res = await partyMockService.searchExporterBranches(ownerId, query)
              return res.map((branch) => ({
                value: String(branch.id),
                label: `${branch.branchName} · ${branch.city}`,
                sublabel: branch.address1
              }))
            }
            const res = await partyMockService.searchConsigneeBranches(ownerId, query)
            return res.map((branch) => ({
              value: String(branch.id),
              label: `${branch.branchName} · ${branch.city}`,
              sublabel: branch.address1
            }))
          }}
          getInitialLabel={async (id) => {
            if (!hasOwner) return ''
            const branch = await partyMockService.getBranchById(kind, ownerId, id)
            return branch ? `${branch.branchName} · ${branch.city}` : ''
          }}
        />
      </div>
    </div>
  )
}
