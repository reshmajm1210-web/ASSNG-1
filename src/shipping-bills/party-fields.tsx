import { useEffect, useState } from 'react'
import { AsyncPartySelect } from './async-party-select'
import type { BillFormContext, BranchPath, PartyOwnerPath } from './form-types'
import type { Business, Exporter } from './model'
import { BusinessRole, partyMockService } from './party-mock-service'

interface PartyFieldsProps {
  formCtx: BillFormContext
  ownerName: PartyOwnerPath
  branchName: BranchPath
  label: string
  kind: 'exporter' | 'business'
  role?: BusinessRole
  required?: boolean
  partyVersion?: number
  onAddBranch: (ownerId: number) => void
  onQuickAdd: () => void
}

export function PartyFields({
  formCtx,
  ownerName,
  branchName,
  label,
  kind,
  role,
  required = true,
  partyVersion = 0,
  onAddBranch,
  onQuickAdd
}: PartyFieldsProps) {
  const ownerId = formCtx.hooks.watch(ownerName) ?? ''
  const [owner, setOwner] = useState<Exporter | Business | undefined>(undefined)

  useEffect(() => {
    let active = true
    if (!ownerId) {
      setOwner(undefined)
      return () => {
        active = false
      }
    }

    void partyMockService
      .getPartyById(kind, ownerId)
      .then((resolved) => {
        if (!active) return
        setOwner(resolved)
        const selectedBranch = formCtx.hooks.getValues(branchName)
        if (
          selectedBranch &&
          resolved &&
          resolved.branches.length > 0 &&
          !resolved.branches.some((branch) => String(branch.id) === selectedBranch)
        ) {
          formCtx.hooks.setValue(branchName, '', { shouldValidate: true })
        }
      })
      .catch(() => {
        if (active) setOwner(undefined)
      })

    return () => {
      active = false
    }
  }, [branchName, formCtx.hooks, kind, ownerId, partyVersion])

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
          deps={[partyVersion]}
          fetchOptions={async (query) => {
            if (kind === 'exporter') {
              const res = await partyMockService.searchExporters(query, ownerId)
              return res.map((item) => ({
                value: String(item.id),
                label: item.name,
                sublabel: item.iec ? `IEC: ${item.iec}` : undefined
              }))
            }
            const res = await partyMockService.searchBusinesses(query, role, ownerId)
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
            const item = await partyMockService.getBusinessById(id)
            return item ? item.name : ''
          }}
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Branch / address</span>
          {owner && (
            <button
              type="button"
              className="text-primary-700 text-xs font-medium hover:underline"
              onClick={() => onAddBranch(owner.id)}>
              + Add branch
            </button>
          )}
        </div>
        <AsyncPartySelect
          name={branchName}
          placeholder={ownerId ? 'Search & select branch...' : `Choose ${kind} first`}
          disabled={!ownerId}
          rules={{ required: required || Boolean(ownerId) }}
          deps={[ownerId, partyVersion]}
          fetchOptions={async (query) => {
            if (!ownerId) return []
            const res =
              kind === 'exporter'
                ? await partyMockService.searchExporterBranches(ownerId, query)
                : await partyMockService.searchBusinessBranches(ownerId, query)
            return res.map((branch) => ({
              value: String(branch.id),
              label: `${branch.branchName} · ${branch.city}`,
              sublabel: branch.address1
            }))
          }}
          getInitialLabel={async (id) => {
            if (!ownerId) return ''
            const branch = await partyMockService.getBranchById(kind, ownerId, id)
            return branch ? `${branch.branchName} · ${branch.city}` : ''
          }}
        />
      </div>
    </div>
  )
}
