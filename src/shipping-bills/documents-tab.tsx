import { useFieldArray } from 'core/form'
import { useState } from 'react'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { AsyncSearchSelect } from './async-search-select'
import { Advanced } from './form-sections'
import { BillFormContext, dateType } from './form-types'
import { emptyDocument } from './model'
import { referenceDataService } from './reference-data-service'

interface DocumentsTabProps {
  formCtx: BillFormContext
}

/** Supporting documents (e-Sanchit references): document type codes and issuing/beneficiary details. */
export function DocumentsTab({ formCtx }: DocumentsTabProps) {
  const { control } = formCtx.hooks
  const {
    fields: documents,
    append: addDocument,
    remove: removeDocument
  } = useFieldArray({ control, name: 'documents' })

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-950">Supporting documents</h3>
          <p className="mt-1 text-sm text-gray-500">Add references when required for this shipment.</p>
        </div>
        {documents.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => addDocument(emptyDocument())}>
            + Add document
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.length === 0 && (
          <Button variant="outline" size="sm" onClick={() => addDocument(emptyDocument())}>
            + Add document
          </Button>
        )}
        {documents.map((field, index) => (
          <DocumentItem
            key={field.id}
            formCtx={formCtx}
            index={index}
            onRemove={() => {
              removeDocument(index)
            }}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function DocumentItem({ formCtx, index, onRemove }: { formCtx: BillFormContext; index: number; onRemove: () => void }) {
  const { register, watch } = formCtx.hooks
  const documentValues = watch(`documents.${index}`)

  const customFieldValues = [
    documentValues.placeOfIssue,
    documentValues.invoiceSerialNumber,
    documentValues.itemSerialNumber,
    documentValues.issuingPartyCode,
    documentValues.issuingPartyName,
    documentValues.issuingPartyAddress1,
    documentValues.issuingPartyAddress2,
    documentValues.issuingPartyCity,
    documentValues.issuingPartyPin,
    documentValues.beneficiaryPartyCode,
    documentValues.beneficiaryPartyName,
    documentValues.beneficiaryPartyAddress1,
    documentValues.beneficiaryPartyAddress2,
    documentValues.beneficiaryPartyCity,
    documentValues.beneficiaryPartyPin,
    documentValues.fileType,
    documentValues.icegateId
  ]
  const hasCustomValues = customFieldValues.some((field) => field != null && field !== '')

  const [showCustomDetails, setShowCustomDetails] = useState(hasCustomValues)

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Document {index + 1}</h3>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onRemove}>
          Remove
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">Document type code</span>
          <AsyncSearchSelect
            name={`documents.${index}.documentTypeCode`}
            placeholder="Search document type..."
            fetchOptions={async (query) => {
              const q = query.toLowerCase().trim()
              const codes = await referenceDataService.getDocumentCodes()
              const filtered = codes.filter(
                (doc) => doc.label.toLowerCase().includes(q) || doc.value.toLowerCase().includes(q)
              )
              return filtered.map((doc) => ({
                value: doc.value,
                label: doc.label
              }))
            }}
            getInitialLabel={async (val) => {
              const codes = await referenceDataService.getDocumentCodes()
              const found = codes.find((doc) => doc.value === val || doc.label === val)
              return found ? found.label : val
            }}
          />
        </div>
        <Input label="Image reference number" {...register(`documents.${index}.imageReferenceNumber`)} />
        <Input label="Issue date" type={dateType} {...register(`documents.${index}.documentIssueDate`)} />
      </div>
      <Advanced
        title="Issuing party and ICEGATE details"
        open={showCustomDetails}
        onToggle={(isOpen) => setShowCustomDetails(isOpen)}>
        <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Reference number" {...register(`documents.${index}.documentReferenceNumber`)} />
          <Input label="Expiry date" type={dateType} {...register(`documents.${index}.documentExpiryDate`)} />
          <Input label="Invoice serial number" type="number" {...register(`documents.${index}.invoiceSerialNumber`)} />
          <Input label="Item serial number" type="number" {...register(`documents.${index}.itemSerialNumber`)} />
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">File type</span>
            <AsyncSearchSelect
              name={`documents.${index}.fileType`}
              placeholder="Search file type..."
              className="bg-transparent"
              fetchOptions={async (query) => {
                const q = query.toLowerCase().trim()
                const types = await referenceDataService.getFileTypes()
                return types.filter((doc) => doc.label.toLowerCase().includes(q) || doc.value.toLowerCase().includes(q))
              }}
              getInitialLabel={async (val) => {
                const types = await referenceDataService.getFileTypes()
                const found = types.find((doc) => doc.value === val || doc.label === val)
                return found ? found.label : val
              }}
            />
          </div>
          <Input label="Place of issue" {...register(`documents.${index}.placeOfIssue`)} />
        </div>

        <div className="flex flex-col gap-4">
          <Advanced title="Issuing & Beneficiary">
            <div className="flex flex-col gap-6 pt-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Issuing Details</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Issuing party code" {...register(`documents.${index}.issuingPartyCode`)} />
                  <Input label="Issuing party name" {...register(`documents.${index}.issuingPartyName`)} />
                  <Input label="Issuing address line 1" {...register(`documents.${index}.issuingPartyAddress1`)} />
                  <Input label="Issuing address line 2" {...register(`documents.${index}.issuingPartyAddress2`)} />
                  <Input label="Issuing city" {...register(`documents.${index}.issuingPartyCity`)} />
                  <Input label="Issuing postal code" {...register(`documents.${index}.issuingPartyPin`)} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Beneficiary Details</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Beneficiary code" {...register(`documents.${index}.beneficiaryPartyCode`)} />
                  <Input label="Beneficiary name" {...register(`documents.${index}.beneficiaryPartyName`)} />
                  <Input
                    label="Beneficiary address line 1"
                    {...register(`documents.${index}.beneficiaryPartyAddress1`)}
                  />
                  <Input
                    label="Beneficiary address line 2"
                    {...register(`documents.${index}.beneficiaryPartyAddress2`)}
                  />
                  <Input label="Beneficiary city" {...register(`documents.${index}.beneficiaryPartyCity`)} />
                  <Input label="Beneficiary postal code" {...register(`documents.${index}.beneficiaryPartyPin`)} />
                </div>
              </div>
            </div>
          </Advanced>
        </div>
      </Advanced>
    </div>
  )
}
