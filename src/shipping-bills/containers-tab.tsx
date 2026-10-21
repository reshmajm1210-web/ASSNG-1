import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { SectionHeading } from './form-sections'
import { BillFormContext, dateType } from './form-types'
import { ShippingBillFormValues } from './model'
import { useReferenceData } from './reference-data-service'

interface ContainersTabProps {
  formCtx: BillFormContext
}

/** Containers section: add containerized cargo details (number, size, seals, movement documents). */
export function ContainersTab({ formCtx }: ContainersTabProps) {
  const { register, control } = formCtx.hooks
  const referenceData = useReferenceData()
  const {
    fields: containers,
    append: addContainer,
    remove: removeContainer
  } = useFieldArray({ control, name: 'containers' })

  return (
    <>
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
              <Input label="Container number" {...register(`containers.${index}.containerNumber`)} />
              <Select<ShippingBillFormValues>
                label="Size"
                name={`containers.${index}.containerSize`}
                options={referenceData?.containerSizes ?? []}
                placeholder="Select size"
              />
              <Input label="Seal number" {...register(`containers.${index}.exciseSealNumber`)} />
              <Input label="Seal date" type={dateType} {...register(`containers.${index}.sealDate`)} />
              <Select<ShippingBillFormValues>
                label="Seal type"
                name={`containers.${index}.sealType`}
                options={referenceData?.containerSealTypes ?? []}
                placeholder="Select if needed"
              />
              <Input label="Seal device ID" {...register(`containers.${index}.sealDeviceId`)} />
              <Input label="Movement document type" {...register(`containers.${index}.movementDocumentType`)} />
              <Input label="Movement document number" {...register(`containers.${index}.movementDocumentNumber`)} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
