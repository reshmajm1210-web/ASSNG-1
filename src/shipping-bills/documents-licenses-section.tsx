import { useState } from 'react'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { AsyncPartySelect } from './async-party-select'
import { Advanced } from './form-primitives'
import { BillFormContext, DATE_INPUT_TYPE } from './form-types'
import { lookupService, ShippingBillLookups } from './lookup-service'
import { emptyDocument, LicenseForm, ShippingBillFormValues, SupportingDocForm } from './model'

interface DocumentItemProps {
  formCtx: BillFormContext
  index: number
  onRemove: () => void
}

function DocumentItem({ formCtx, index, onRemove }: DocumentItemProps) {
  const { register, watch } = formCtx.hooks
  const documentValues = watch(`documents.${index}`) as SupportingDocForm | undefined

  const hasCustomValues = Boolean(
    documentValues?.placeOfIssue ??
    documentValues?.invoiceSerialNumber ??
    documentValues?.itemSerialNumber ??
    documentValues?.issuingPartyCode ??
    documentValues?.issuingPartyName ??
    documentValues?.issuingPartyAddress1 ??
    documentValues?.issuingPartyAddress2 ??
    documentValues?.issuingPartyCity ??
    documentValues?.issuingPartyPin ??
    documentValues?.beneficiaryPartyCode ??
    documentValues?.beneficiaryPartyName ??
    documentValues?.beneficiaryPartyAddress1 ??
    documentValues?.beneficiaryPartyAddress2 ??
    documentValues?.beneficiaryPartyCity ??
    documentValues?.beneficiaryPartyPin ??
    documentValues?.fileType ??
    documentValues?.icegateId
  )

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
          <AsyncPartySelect
            name={`documents.${index}.documentTypeCode`}
            placeholder="Search document type..."
            fetchOptions={(query) => lookupService.searchDocumentCodes(query)}
            getInitialLabel={(val) => lookupService.getDocumentCodeLabel(val)}
          />
        </div>
        <Input label="Image reference number" {...register(`documents.${index}.imageReferenceNumber`)} />
        <Input label="Issue date" type={DATE_INPUT_TYPE} {...register(`documents.${index}.documentIssueDate`)} />
      </div>

      <Advanced
        title="Issuing party and ICEGATE details"
        open={showCustomDetails}
        onToggle={(isOpen) => setShowCustomDetails(isOpen)}>
        <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Reference number" {...register(`documents.${index}.documentReferenceNumber`)} />
          <Input label="Expiry date" type={DATE_INPUT_TYPE} {...register(`documents.${index}.documentExpiryDate`)} />
          <Input label="Invoice serial number" type="number" {...register(`documents.${index}.invoiceSerialNumber`)} />
          <Input label="Item serial number" type="number" {...register(`documents.${index}.itemSerialNumber`)} />
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">File type</span>
            <AsyncPartySelect
              name={`documents.${index}.fileType`}
              placeholder="Search file type..."
              className="bg-transparent"
              fetchOptions={(query) => lookupService.searchDocumentFileTypes(query)}
              getInitialLabel={(val) => lookupService.getDocumentFileTypeLabel(val)}
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

interface DocumentsLicensesSectionProps {
  formCtx: BillFormContext
  documents: { id: string }[]
  licenses: { id: string }[]
  lookups: ShippingBillLookups
  onAddDocument: (doc: SupportingDocForm) => void
  onRemoveDocument: (index: number) => void
  onAddLicense: (license: LicenseForm) => void
  onRemoveLicense: (index: number) => void
}

export function DocumentsLicensesSection({
  formCtx,
  documents,
  licenses,
  lookups,
  onAddDocument,
  onRemoveDocument,
  onAddLicense,
  onRemoveLicense
}: DocumentsLicensesSectionProps) {
  const { register } = formCtx.hooks

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-950">Supporting documents</h3>
            <p className="mt-1 text-sm text-gray-500">Add references when required for this shipment.</p>
          </div>
          {documents.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => onAddDocument(emptyDocument())}>
              + Add document
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.length === 0 && (
            <Button variant="outline" size="sm" onClick={() => onAddDocument(emptyDocument())}>
              + Add document
            </Button>
          )}
          {documents.map((field, index) => (
            <DocumentItem key={field.id} formCtx={formCtx} index={index} onRemove={() => onRemoveDocument(index)} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-950">Licences</h3>
            <p className="mt-1 text-sm text-gray-500">Only enter these for schemes that require a licence.</p>
          </div>
          {licenses.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => onAddLicense({ registrationNumber: '' })}>
              + Add licence
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {licenses.length === 0 && (
            <Button variant="outline" size="sm" onClick={() => onAddLicense({ registrationNumber: '' })}>
              + Add licence
            </Button>
          )}
          {licenses.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex justify-between">
                <h3 className="text-sm font-semibold">Licence {index + 1}</h3>
                <Button size="sm" variant="ghost" onClick={() => onRemoveLicense(index)}>
                  Remove
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Registration number" {...register(`licenses.${index}.registrationNumber`)} />
                <Input
                  label="Registration date"
                  type={DATE_INPUT_TYPE}
                  {...register(`licenses.${index}.registrationDate`)}
                />
                <Input
                  label="Invoice serial number"
                  type="number"
                  {...register(`licenses.${index}.invoiceSerialNumber`)}
                />
                <Input label="Item serial number" type="number" {...register(`licenses.${index}.itemSerialNumber`)} />
                <Input
                  label="Licence serial number"
                  type="number"
                  {...register(`licenses.${index}.licenseSerialNumber`)}
                />
                <Input label="Item serial, Part E" {...register(`licenses.${index}.itemSerialNumberPartE`)} />
                <Input label="Item serial, Part C" {...register(`licenses.${index}.itemSerialNumberPartC`)} />
                <Input label="Licence quantity" type="number" {...register(`licenses.${index}.licenseQuantity`)} />
                <Input label="Export quantity" type="number" {...register(`licenses.${index}.licenseExportQuantity`)} />
                <Select<ShippingBillFormValues>
                  label="Goods source"
                  name={`licenses.${index}.indigenousOrImported`}
                  options={lookups.licenseGoodsSources}
                  placeholder="Select if needed"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
