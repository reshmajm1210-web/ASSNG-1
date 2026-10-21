import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { AsyncSearchSelect } from './async-search-select'
import { Advanced, SectionHeading } from './form-sections'
import { BillFormContext, dateType, QuickAdd, QuickBranch } from './form-types'
import { MarksAndNumbersOption } from './marks-and-numbers-source'
import { portCountry, ShippingBillFormValues } from './model'
import { PartyFields } from './party-fields'
import { partyMockService, useParties } from './party-mock-service'
import { referenceDataService, useReferenceData } from './reference-data-service'

interface DetailsTabProps {
  formCtx: BillFormContext
  onQuickAdd: (quickAdd: QuickAdd) => void
  onQuickBranch: (quickBranch: QuickBranch) => void
  containerCount: number
}

/** "1. Details" tab: exporter/consignee, route and package details. */
export function DetailsTab({ formCtx, onQuickAdd, onQuickBranch, containerCount }: DetailsTabProps) {
  const { register, watch, setValue } = formCtx.hooks
  const referenceData = useReferenceData()
  const { exporters, businesses } = useParties()

  const exporterId = watch('exporterId')
  const consigneeId = watch('consigneeId')
  const loadingPort = watch('loadingPort')
  const finalDestinationPort = watch('finalDestinationPort')

  const [marksAndNumbersOptions, setMarksAndNumbersOptions] = useState<MarksAndNumbersOption[]>([])
  const [marksAndNumbersLoading, setMarksAndNumbersLoading] = useState(false)
  const previousExporterId = useRef(exporterId)

  useEffect(() => {
    if (previousExporterId.current !== exporterId) {
      previousExporterId.current = exporterId
      setValue('marksAndNumbers', '', { shouldValidate: true })
    }

    let cancelled = false
    setMarksAndNumbersOptions([])
    setMarksAndNumbersLoading(Boolean(exporterId))
    if (exporterId) {
      void referenceDataService
        .getMarksAndNumbersOptions(exporterId)
        .then((options) => {
          if (cancelled) return
          setMarksAndNumbersOptions(options)
          setMarksAndNumbersLoading(false)
        })
        .catch(() => {
          if (cancelled) return
          setMarksAndNumbersOptions([])
          setMarksAndNumbersLoading(false)
        })
    }

    return () => {
      cancelled = true
    }
  }, [setValue, exporterId])

  const exporterOptions = exporters.filter((item) => !item.disabled || String(item.id) === exporterId)
  const consigneeOptions = businesses.filter((business) => business.isConsignee || String(business.id) === consigneeId)

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
          parties={exporterOptions}
          onQuickAdd={() => onQuickAdd({ kind: 'exporter' })}
          onAddBranch={(ownerId) => onQuickBranch({ kind: 'exporter', ownerId, branchName: 'exporterBranchId' })}
        />
        <PartyFields
          formCtx={formCtx}
          ownerName="consigneeId"
          branchName="consigneeBranchId"
          label="Consignee"
          kind="business"
          parties={consigneeOptions}
          onQuickAdd={() => onQuickAdd({ kind: 'business', role: 'consignee' })}
          onAddBranch={(ownerId) => onQuickBranch({ kind: 'business', ownerId, branchName: 'consigneeBranchId' })}
        />

        <div className="border-t border-gray-200 pt-5">
          <SectionHeading title="Route" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-sm font-medium">Port of loading</span>
              <AsyncSearchSelect
                name="loadingPort"
                placeholder="Select Indian port"
                rules={{ required: true }}
                fetchOptions={async (query) => {
                  const res = await partyMockService.searchLoadingPorts(query)
                  return res.map((port) => ({
                    value: port.code,
                    label: `${port.name} · ${port.code}`,
                    sublabel: `Country: ${port.countryCode}`
                  }))
                }}
                getInitialLabel={async (code) => {
                  const port = await partyMockService.getPortByCode(code)
                  return port ? `${port.name} · ${port.code}` : code
                }}
              />
            </div>
            <div>
              <span className="mb-1 block text-sm font-medium">Final destination port</span>
              <AsyncSearchSelect
                name="finalDestinationPort"
                placeholder="Select destination"
                rules={{ required: true }}
                fetchOptions={async (query) => {
                  const res = await partyMockService.searchDestinationPorts(query)
                  return res.map((port) => ({
                    value: port.code,
                    label: `${port.name} · ${port.code}`,
                    sublabel: `Country: ${port.countryCode}`
                  }))
                }}
                getInitialLabel={async (code) => {
                  const port = await partyMockService.getPortByCode(code)
                  return port ? `${port.name} · ${port.code}` : code
                }}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Countries are derived from the port codes when saved: {portCountry(loadingPort) || '—'} →{' '}
            {portCountry(finalDestinationPort) || '—'}.
          </p>
        </div>
        <Advanced title="Regulatory and route exceptions">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select<ShippingBillFormValues>
              label="Discharge port"
              name="dischargePort"
              options={referenceData?.portOptions ?? []}
              placeholder="Defaults to destination"
            />
            <Select<ShippingBillFormValues>
              label="Origin state"
              name="originStateCode"
              options={referenceData?.stateOptions ?? []}
              placeholder="Defaults to Branch State Code"
            />
            <div></div>
            <Select<ShippingBillFormValues>
              label="NFEI category"
              name="nfeiCategory"
              options={referenceData?.nfeiCategories ?? []}
              placeholder="Not applicable"
            />
            <Input label="RBI waiver number" {...register('rbiWaiverNumber')} />
            <Input label="RBI waiver date" type={dateType} {...register('rbiWaiverDate')} />
          </div>
        </Advanced>

        <div className="border-t border-gray-200 pt-5">
          <SectionHeading title="Package Detail" />
          <div className="grid gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select<ShippingBillFormValues>
              label="Nature of cargo"
              name="natureOfCargo"
              options={referenceData?.cargoOptions ?? []}
            />
            <Input label="Gross weight" type="number" {...register('grossWeight')} />
            <Input label="Net weight" type="number" {...register('netWeight')} />
            <Select<ShippingBillFormValues>
              label="Weight unit"
              name="measurementUnit"
              options={referenceData?.weightUnits ?? []}
            />
            <Input label="Total packages" type="number" {...register('totalPackages')} />
            <Select<ShippingBillFormValues>
              label="Marks and numbers"
              name="marksAndNumbers"
              options={marksAndNumbersOptions}
              placeholder={
                !exporterId
                  ? 'Select exporter first'
                  : marksAndNumbersLoading
                    ? 'Loading marks and numbers...'
                    : 'Select marks and numbers'
              }
              disabled={!exporterId || marksAndNumbersLoading || !marksAndNumbersOptions.length}
              wrapClass="sm:col-span-3"
            />
          </div>
          <Advanced title="Additional Details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select<ShippingBillFormValues>
                label="Seal type"
                name="sealType"
                options={referenceData?.sealTypes ?? []}
                placeholder="Select if relevant"
              />
              {containerCount === 0 && (
                <Input label="Number of containers" type="number" {...register('numberOfContainers')} />
              )}
              <Input label="Loose packets" type="number" {...register('loosePackets')} />
              <Input label="MAWB number" {...register('mawbNumber')} />
              <Input label="HAWB number" {...register('hawbNumber')} />
            </div>
          </Advanced>
        </div>
      </CardContent>
    </Card>
  )
}
