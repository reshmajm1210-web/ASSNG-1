/**
 * Container details (numbers, size, seals, movement documents).
 *
 * Rendered inside the "Cargo & Package Detail" card on the "Others" tab, with the
 * packing list ranges underneath.
 */

import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { SectionHeading } from './form-sections'
import type { BillFormContext } from './form-types'
import { dateType } from './form-types'
import type { ShippingBillFormValues } from './model'
import { PackingTab } from './packing-tab'

interface ContainersTabProps {
  formCtx: BillFormContext
}

export function ContainersTab({ formCtx }: ContainersTabProps) {
  const { control } = formCtx.hooks
  const {
    fields: containers,
    append: addContainer,
    remove: removeContainer
  } = useFieldArray({ control, name: 'containers' })

  return (
    <Card>
      <CardHeader title="Cargo & Package Detail" />
      <CardContent className="space-y-5">
        <div className="mb-3 flex items-center justify-between">
          <SectionHeading
            title={`Containers (${containers.length})`}
            description="Add only when the cargo is containerized."
          />
          <Button size="sm" variant="outline" onClick={() => addContainer({ containerNumber: '' })}>
            + Add container
          </Button>
        </div>
        <div className="space-y-3">
          {containers.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex justify-between">
                <h3 className="text-sm font-semibold">Container {index + 1}</h3>
                <Button size="sm" variant="ghost" onClick={() => removeContainer(index)}>
                  Remove
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Container number" {...formCtx.hooks.register(`containers.${index}.containerNumber`)} />
                <Select<ShippingBillFormValues>
                  label="Size"
                  name={`containers.${index}.containerSize`}
                  options={[
                    { value: '20', label: '20 ft' },
                    { value: '40', label: '40 ft' },
                    { value: '45', label: '45 ft' }
                  ]}
                  placeholder="Select size"
                />
                <Input label="Seal number" {...formCtx.hooks.register(`containers.${index}.exciseSealNumber`)} />
                <Input label="Seal date" type={dateType} {...formCtx.hooks.register(`containers.${index}.sealDate`)} />
                <Select<ShippingBillFormValues>
                  label="Seal type"
                  name={`containers.${index}.sealType`}
                  options={[
                    { value: 1, label: 'BTSL - Bottle Seal' },
                    { value: 2, label: 'ESEAL - Electronic Seal' },
                    { value: 3, label: 'RFID - Radio Frequency Identifier' }
                  ]}
                  placeholder="Select if needed"
                />
                <Input label="Seal device ID" {...formCtx.hooks.register(`containers.${index}.sealDeviceId`)} />
                <Input
                  label="Movement document type"
                  {...formCtx.hooks.register(`containers.${index}.movementDocumentType`)}
                />
                <Input
                  label="Movement document number"
                  {...formCtx.hooks.register(`containers.${index}.movementDocumentNumber`)}
                />
              </div>
            </div>
          ))}
        </div>
        <PackingTab formCtx={formCtx} />
      </CardContent>
    </Card>
  )
}
