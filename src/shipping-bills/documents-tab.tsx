/**
 * Supporting documents (e-Sanchit document type, image reference, issue date) and
 * the optional issuing / beneficiary party details of each document.
 */

import { useFieldArray } from 'core/form'
import { useState } from 'react'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { AsyncPartySelect } from './async-search-select'
import { Advanced } from './form-sections'
import type { BillFormContext } from './form-types'
import { dateType } from './form-types'
import { emptyDocument } from './model'
import { referenceDataService } from './reference-data-service'

interface DocumentsTabProps {
  formCtx: BillFormContext
}

/** True when at least one of the given (optional) values is filled in. */
function hasAnyValue(values: (string | undefined)[]): boolean {
  return values.some((value) => value !== undefined && value !== '')
}

export function DocumentItem({
  formCtx,
  index,
  onRemove
}: {
  formCtx: BillFormContext
  index: number
  onRemove: () => void
}) {
  const { watch } = formCtx.hooks
  const documentValues = watch(`documents.${index}`)

  // Open the advanced section when the saved document already carries details.
  const [showCustomDetails, setShowCustomDetails] = useState(() =>
    hasAnyValue([
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
    ])
  )

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
          <AsyncPartySelect
            name={`documents.${index}.documentTypeCode`}
            placeholder="Search document type..."
            fetchOptions={async (query) => {
              const results = await referenceDataService.searchDocumentCodes(query)
              return results.map((document) => ({ value: String(document.value), label: document.label }))
            }}
            getInitialLabel={async (value) => {
              const results = await referenceDataService.searchDocumentCodes(value)
              const found = results.find((document) => String(document.value) === value || document.label === value)
              return found ? found.label : value
            }}
          />
        </div>
        <Input label="Image reference number" {...formCtx.hooks.register(`documents.${index}.imageReferenceNumber`)} />
        <Input label="Issue date" type={dateType} {...formCtx.hooks.register(`documents.${index}.documentIssueDate`)} />
      </div>
      <Advanced
        title="Issuing party and ICEGATE details"
        open={showCustomDetails}
        onToggle={(isOpen) => setShowCustomDetails(isOpen)}>
        <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Reference number" {...formCtx.hooks.register(`documents.${index}.documentReferenceNumber`)} />
          <Input
            label="Expiry date"
            type={dateType}
            {...formCtx.hooks.register(`documents.${index}.documentExpiryDate`)}
          />
          <Input
            label="Invoice serial number"
            type="number"
            {...formCtx.hooks.register(`documents.${index}.invoiceSerialNumber`)}
          />
          <Input
            label="Item serial number"
            type="number"
            {...formCtx.hooks.register(`documents.${index}.itemSerialNumber`)}
          />
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">File type</span>
            <AsyncPartySelect
              name={`documents.${index}.fileType`}
              placeholder="Search file type..."
              className="bg-transparent"
              fetchOptions={async (query) => {
                const results = await referenceDataService.searchFileTypes(query)
                return results.map((fileType) => ({ value: String(fileType.value), label: fileType.label }))
              }}
              getInitialLabel={async (value) => {
                const results = await referenceDataService.searchFileTypes(value)
                const found = results.find((fileType) => String(fileType.value) === value || fileType.label === value)
                return found ? found.label : value
              }}
            />
          </div>
          <Input label="Place of issue" {...formCtx.hooks.register(`documents.${index}.placeOfIssue`)} />
        </div>

        <div className="flex flex-col gap-4">
          <Advanced title="Issuing & Beneficiary">
            <div className="flex flex-col gap-6 pt-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Issuing Details</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Issuing party code"
                    {...formCtx.hooks.register(`documents.${index}.issuingPartyCode`)}
                  />
                  <Input
                    label="Issuing party name"
                    {...formCtx.hooks.register(`documents.${index}.issuingPartyName`)}
                  />
                  <Input
                    label="Issuing address line 1"
                    {...formCtx.hooks.register(`documents.${index}.issuingPartyAddress1`)}
                  />
                  <Input
                    label="Issuing address line 2"
                    {...formCtx.hooks.register(`documents.${index}.issuingPartyAddress2`)}
                  />
                  <Input label="Issuing city" {...formCtx.hooks.register(`documents.${index}.issuingPartyCity`)} />
                  <Input
                    label="Issuing postal code"
                    {...formCtx.hooks.register(`documents.${index}.issuingPartyPin`)}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Beneficiary Details</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Beneficiary code"
                    {...formCtx.hooks.register(`documents.${index}.beneficiaryPartyCode`)}
                  />
                  <Input
                    label="Beneficiary name"
                    {...formCtx.hooks.register(`documents.${index}.beneficiaryPartyName`)}
                  />
                  <Input
                    label="Beneficiary address line 1"
                    {...formCtx.hooks.register(`documents.${index}.beneficiaryPartyAddress1`)}
                  />
                  <Input
                    label="Beneficiary address line 2"
                    {...formCtx.hooks.register(`documents.${index}.beneficiaryPartyAddress2`)}
                  />
                  <Input
                    label="Beneficiary city"
                    {...formCtx.hooks.register(`documents.${index}.beneficiaryPartyCity`)}
                  />
                  <Input
                    label="Beneficiary postal code"
                    {...formCtx.hooks.register(`documents.${index}.beneficiaryPartyPin`)}
                  />
                </div>
              </div>
            </div>
          </Advanced>
        </div>
      </Advanced>
    </div>
  )
}

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
          <DocumentItem key={field.id} formCtx={formCtx} index={index} onRemove={() => removeDocument(index)} />
        ))}
      </CardContent>
    </Card>
  )
}
