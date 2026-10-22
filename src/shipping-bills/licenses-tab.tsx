/**
 * Licences attached to the shipping bill (registration, serial numbers and the
 * quantities declared against each licence).
 */

import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import type { BillFormContext } from './form-types'
import { dateType } from './form-types'
import type { ShippingBillFormValues } from './model'

interface LicensesTabProps {
  formCtx: BillFormContext
}

export function LicensesTab({ formCtx }: LicensesTabProps) {
  const { control } = formCtx.hooks
  const { fields: licenses, append: addLicense, remove: removeLicense } = useFieldArray({ control, name: 'licenses' })

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-950">Licences</h3>
          <p className="mt-1 text-sm text-gray-500">Only enter these for schemes that require a licence.</p>
        </div>
        {licenses.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => addLicense({ registrationNumber: '' })}>
            + Add licence
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {licenses.length === 0 && (
          <Button variant="outline" size="sm" onClick={() => addLicense({ registrationNumber: '' })}>
            + Add licence
          </Button>
        )}
        {licenses.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex justify-between">
              <h3 className="text-sm font-semibold">Licence {index + 1}</h3>
              <Button size="sm" variant="ghost" onClick={() => removeLicense(index)}>
                Remove
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input label="Registration number" {...formCtx.hooks.register(`licenses.${index}.registrationNumber`)} />
              <Input
                label="Registration date"
                type={dateType}
                {...formCtx.hooks.register(`licenses.${index}.registrationDate`)}
              />
              <Input
                label="Invoice serial number"
                type="number"
                {...formCtx.hooks.register(`licenses.${index}.invoiceSerialNumber`)}
              />
              <Input
                label="Item serial number"
                type="number"
                {...formCtx.hooks.register(`licenses.${index}.itemSerialNumber`)}
              />
              <Input
                label="Licence serial number"
                type="number"
                {...formCtx.hooks.register(`licenses.${index}.licenseSerialNumber`)}
              />
              <Input
                label="Item serial, Part E"
                {...formCtx.hooks.register(`licenses.${index}.itemSerialNumberPartE`)}
              />
              <Input
                label="Item serial, Part C"
                {...formCtx.hooks.register(`licenses.${index}.itemSerialNumberPartC`)}
              />
              <Input
                label="Licence quantity"
                type="number"
                {...formCtx.hooks.register(`licenses.${index}.licenseQuantity`)}
              />
              <Input
                label="Export quantity"
                type="number"
                {...formCtx.hooks.register(`licenses.${index}.licenseExportQuantity`)}
              />
              <Select<ShippingBillFormValues>
                label="Goods source"
                name={`licenses.${index}.indigenousOrImported`}
                options={[
                  { value: 'I', label: 'Imported' },
                  { value: 'D', label: 'Indigenous' }
                ]}
                placeholder="Select if needed"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
