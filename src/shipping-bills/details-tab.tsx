import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { AsyncPartySelect } from './async-party-select'
import { Advanced, SectionHeading } from './form-primitives'
import { BillFormContext, BranchPath, DATE_INPUT_TYPE, QuickAdd } from './form-types'
import { lookupService, ShippingBillLookups } from './lookup-service'
import type { MarksAndNumbersOption } from './marks-and-numbers-source'
import { portCountry, ShippingBillFormValues } from './model'
import { PartyFields } from './party-fields'
import { partyMockService } from './party-mock-service'

interface DetailsTabProps {
  formCtx: BillFormContext
  values: ShippingBillFormValues
  containersCount: number
  lookups: ShippingBillLookups
  partyVersion: number
  onQuickAdd: (add: QuickAdd) => void
  onAddBranch: (kind: 'exporter' | 'business', ownerId: number, branchName: BranchPath) => void
}

export function DetailsTab({
  formCtx,
  values,
  containersCount,
  lookups,
  partyVersion,
  onQuickAdd,
  onAddBranch
}: DetailsTabProps) {
  const { register, setValue } = formCtx.hooks
  const [marksAndNumbersOptions, setMarksAndNumbersOptions] = useState<MarksAndNumbersOption[]>([])
  const [marksAndNumbersLoading, setMarksAndNumbersLoading] = useState(false)
  const [marksAndNumbersError, setMarksAndNumbersError] = useState(false)
  const previousExporterId = useRef(values.exporterId)

  useEffect(() => {
    const exporterId = values.exporterId
    if (previousExporterId.current !== exporterId) {
      previousExporterId.current = exporterId
      setValue('marksAndNumbers', '', { shouldValidate: true })
    }

    let cancelled = false
    setMarksAndNumbersOptions([])
    setMarksAndNumbersError(false)
    setMarksAndNumbersLoading(Boolean(exporterId))

    if (exporterId) {
      void lookupService
        .getMarksAndNumbers(exporterId)
        .then((options) => {
          if (cancelled) return
          setMarksAndNumbersOptions(options)
          setMarksAndNumbersLoading(false)
        })
        .catch(() => {
          if (cancelled) return
          setMarksAndNumbersOptions([])
          setMarksAndNumbersError(true)
          setMarksAndNumbersLoading(false)
        })
    }

    return () => {
      cancelled = true
    }
  }, [setValue, values.exporterId])

  const loadingCountry = portCountry(values.loadingPort)
  const destinationCountry = portCountry(values.finalDestinationPort)

  const marksPlaceholder = !values.exporterId
    ? 'Select exporter first'
    : marksAndNumbersLoading
      ? 'Loading marks and numbers...'
      : marksAndNumbersError
        ? 'Failed to load marks and numbers'
        : marksAndNumbersOptions.length === 0
          ? 'No preset marks for selected exporter'
          : 'Select marks and numbers'

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
          partyVersion={partyVersion}
          onQuickAdd={() => onQuickAdd({ kind: 'exporter' })}
          onAddBranch={(ownerId) => onAddBranch('exporter', ownerId, 'exporterBranchId')}
        />
        <PartyFields
          formCtx={formCtx}
          ownerName="consigneeId"
          branchName="consigneeBranchId"
          label="Consignee"
          kind="business"
          role="consignee"
          partyVersion={partyVersion}
          onQuickAdd={() => onQuickAdd({ kind: 'business', role: 'consignee' })}
          onAddBranch={(ownerId) => onAddBranch('business', ownerId, 'consigneeBranchId')}
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
              <AsyncPartySelect
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
            Countries are derived from the port codes when saved: {loadingCountry ? loadingCountry : '—'} →{' '}
            {destinationCountry ? destinationCountry : '—'}.
          </p>
        </div>

        <Advanced title="Regulatory and route exceptions">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select<ShippingBillFormValues>
              label="Discharge port"
              name="dischargePort"
              options={lookups.portOptions}
              placeholder="Defaults to destination"
            />
            <Select<ShippingBillFormValues>
              label="Origin state"
              name="originStateCode"
              options={lookups.stateOptions}
              placeholder="Defaults to Branch State Code"
            />
            <div></div>
            <Select<ShippingBillFormValues>
              label="NFEI category"
              name="nfeiCategory"
              options={lookups.nfeiCategories}
              placeholder="Not applicable"
            />
            <Input label="RBI waiver number" {...register('rbiWaiverNumber')} />
            <Input label="RBI waiver date" type={DATE_INPUT_TYPE} {...register('rbiWaiverDate')} />
          </div>
        </Advanced>

        <div className="border-t border-gray-200 pt-5">
          <SectionHeading title="Package Detail" />
          <div className="grid gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select<ShippingBillFormValues>
              label="Nature of cargo"
              name="natureOfCargo"
              options={lookups.cargoOptions}
            />
            <Input label="Gross weight" type="number" {...register('grossWeight')} />
            <Input label="Net weight" type="number" {...register('netWeight')} />
            <Select<ShippingBillFormValues> label="Weight unit" name="measurementUnit" options={lookups.weightUnits} />
            <Input label="Total packages" type="number" {...register('totalPackages')} />
            <Select<ShippingBillFormValues>
              label="Marks and numbers"
              name="marksAndNumbers"
              options={marksAndNumbersOptions}
              placeholder={marksPlaceholder}
              disabled={!values.exporterId || marksAndNumbersLoading || marksAndNumbersOptions.length === 0}
              wrapClass="sm:col-span-3"
            />
          </div>
          <Advanced title="Additional Details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select<ShippingBillFormValues>
                label="Seal type"
                name="sealType"
                options={lookups.sealTypes}
                placeholder="Select if relevant"
              />
              {containersCount === 0 && (
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
