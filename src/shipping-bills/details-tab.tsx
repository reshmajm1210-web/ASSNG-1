/**
 * Tab 1 — shipment details: exporter and consignee, route (loading port and final
 * destination), the regulatory/route exceptions and the package detail block.
 *
 * Marks & numbers are loaded for the selected exporter through the
 * reference-data service; switching exporter clears the previous selection.
 */

import { useQuery } from 'core/react-query'
import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { AsyncPartySelect } from './async-search-select'
import { Advanced, SectionHeading } from './form-sections'
import type { BillFormContext, QuickAdd, QuickBranch } from './form-types'
import { dateType } from './form-types'
import { portCountry, type ShippingBillFormValues } from './model'
import { PartyFields } from './party-fields'
import { referenceDataService, type ReferenceData } from './reference-data-service'

interface DetailsTabProps {
  formCtx: BillFormContext
  reference: ReferenceData
  onQuickAdd: (quickAdd: QuickAdd) => void
  onAddBranch: (quickBranch: QuickBranch) => void
}

export function DetailsTab({ formCtx, reference, onQuickAdd, onAddBranch }: DetailsTabProps) {
  const values = formCtx.hooks.watch()
  const containers = values.containers
  const { sealTypes, cargoOptions, weightUnits, states: stateOptions } = reference
  const dischargePortOptions = reference.ports.map((port) => ({
    value: port.code,
    label: `${port.name} · ${port.code}`
  }))

  const exporterId = values.exporterId
  const previousExporterId = useRef(exporterId)

  // A different exporter means the saved marks belong to the old exporter.
  useEffect(() => {
    if (previousExporterId.current === exporterId) return
    previousExporterId.current = exporterId
    formCtx.hooks.setValue('marksAndNumbers', '', { shouldValidate: true })
  }, [exporterId, formCtx.hooks])

  const marksQuery = useQuery({
    queryKey: ['marks-and-numbers', exporterId],
    queryFn: () => referenceDataService.getMarksAndNumbers(exporterId),
    enabled: exporterId !== ''
  })
  const marksAndNumbersOptions = marksQuery.data ?? []
  const marksAndNumbersLoading = exporterId !== '' && marksQuery.isFetching

  return (
    <Card>
      <CardHeader title="Shipment basics" description="Parties and route are the core details for this bill." />
      <CardContent className="space-y-5">
        <PartyFields
          formCtx={formCtx}
          ownerName="exporterId"
          branchName="exporterBranchId"
          label="Exporter"
          kind="exporter"
          onQuickAdd={() => onQuickAdd({ kind: 'exporter' })}
          onAddBranch={(ownerId) => onAddBranch({ kind: 'exporter', ownerId, branchName: 'exporterBranchId' })}
        />
        <PartyFields
          formCtx={formCtx}
          ownerName="consigneeId"
          branchName="consigneeBranchId"
          label="Consignee"
          kind="business"
          onQuickAdd={() => onQuickAdd({ kind: 'business', role: 'consignee' })}
          onAddBranch={(ownerId) => onAddBranch({ kind: 'business', ownerId, branchName: 'consigneeBranchId' })}
        />

        <div className="border-t border-gray-200 pt-5">
          <SectionHeading title="Route" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-sm font-medium">Port of loading</span>
              <AsyncPartySelect
                name="loadingPort"
                placeholder="Select Indian port"
                rules={{ required: true }}
                fetchOptions={async (query) => {
                  const res = await referenceDataService.searchLoadingPorts(query)
                  return res.map((port) => ({
                    value: port.code,
                    label: `${port.name} · ${port.code}`,
                    sublabel: `Country: ${port.countryCode}`
                  }))
                }}
                getInitialLabel={async (code) => {
                  const port = await referenceDataService.getPortByCode(code)
                  return port ? `${port.name} · ${port.code}` : code
                }}
              />
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium">Final destination port</span>
              <AsyncPartySelect
                name="finalDestinationPort"
                placeholder="Select destination"
                rules={{ required: true }}
                fetchOptions={async (query) => {
                  const res = await referenceDataService.searchDestinationPorts(query)
                  return res.map((port) => ({
                    value: port.code,
                    label: `${port.name} · ${port.code}`,
                    sublabel: `Country: ${port.countryCode}`
                  }))
                }}
                getInitialLabel={async (code) => {
                  const port = await referenceDataService.getPortByCode(code)
                  return port ? `${port.name} · ${port.code}` : code
                }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Countries are derived from the port codes when saved: {portCountry(values.loadingPort) || '—'} →{' '}
            {portCountry(values.finalDestinationPort) || '—'}.
          </p>
        </div>
        <Advanced title="Regulatory and route exceptions">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select<ShippingBillFormValues>
              label="Discharge port"
              name="dischargePort"
              options={dischargePortOptions}
              placeholder="Defaults to destination"
            />
            <Select<ShippingBillFormValues>
              label="Origin state"
              name="originStateCode"
              options={stateOptions}
              placeholder="Defaults to Branch State Code"
            />
            <div></div>
            <Select<ShippingBillFormValues>
              label="NFEI category"
              name="nfeiCategory"
              options={[
                ['01', 'Free trade sample'],
                ['02', 'Diplomatic goods'],
                ['03', 'Warranty replacement'],
                ['07', 'Gift parcel'],
                ['08', 'Other']
              ].map(([value, label]) => ({ value, label }))}
              placeholder="Not applicable"
            />
            <Input label="RBI waiver number" {...formCtx.hooks.register('rbiWaiverNumber')} />
            <Input label="RBI waiver date" type={dateType} {...formCtx.hooks.register('rbiWaiverDate')} />
          </div>
        </Advanced>

        <div className="border-t border-gray-200 pt-5">
          <SectionHeading title="Package Detail" />
          <div className="grid gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select<ShippingBillFormValues> label="Nature of cargo" name="natureOfCargo" options={cargoOptions} />
            <Input label="Gross weight" type="number" {...formCtx.hooks.register('grossWeight')} />
            <Input label="Net weight" type="number" {...formCtx.hooks.register('netWeight')} />
            <Select<ShippingBillFormValues> label="Weight unit" name="measurementUnit" options={weightUnits} />
            <Input label="Total packages" type="number" {...formCtx.hooks.register('totalPackages')} />
            <Select<ShippingBillFormValues>
              label="Marks and numbers"
              name="marksAndNumbers"
              options={marksAndNumbersOptions}
              placeholder={
                !values.exporterId
                  ? 'Select exporter first'
                  : marksAndNumbersLoading
                    ? 'Loading marks and numbers...'
                    : 'Select marks and numbers'
              }
              disabled={!values.exporterId || marksAndNumbersLoading || !marksAndNumbersOptions.length}
              wrapClass="sm:col-span-3"
            />
          </div>
          <Advanced title="Additional Details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select<ShippingBillFormValues>
                label="Seal type"
                name="sealType"
                options={sealTypes}
                placeholder="Select if relevant"
              />
              {containers.length === 0 && (
                <Input label="Number of containers" type="number" {...formCtx.hooks.register('numberOfContainers')} />
              )}
              <Input label="Loose packets" type="number" {...formCtx.hooks.register('loosePackets')} />
              <Input label="MAWB number" {...formCtx.hooks.register('mawbNumber')} />
              <Input label="HAWB number" {...formCtx.hooks.register('hawbNumber')} />
            </div>
          </Advanced>
        </div>
      </CardContent>
    </Card>
  )
}
