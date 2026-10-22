/**
 * Shipping bill payload conversion.
 *
 * The app has two *different* payload formats, and both are needed:
 *
 * 1. `toShippingBillPayload(values)` — the full, nested, snake_case document that
 *    is stored on a saved bill (`SavedBill.payload`) and used by the flat-file
 *    generator. It keeps every field the exporter typed in.
 * 2. `toHttpShippingBillPayload(values)` — the flat, camelCase body that a real
 *    backend expects for `POST /api/shipping-bills` (see `shipping_bill.http` in
 *    the assignment). Dates become epoch days and currencies become ISO-4217
 *    numbers.
 *
 * They are not duplicates: they answer different questions. What *was* duplicated
 * was the value handling (empty string → undefined, date math, "fall back to the
 * invoice currency"), so those rules now live here once and are shared by both.
 */

import type { DemoShippingBillRecord } from '@/data/demo-shipping-bills'
import {
  BillInvoiceForm,
  emptyBill,
  emptyInvoice,
  invoiceTotal,
  lineTotal,
  portCountry,
  SavedBill,
  ShippingBillFormValues
} from './model'

/** ISO-4217 numeric codes for the currencies offered in the UI. */
const CURRENCY_CODES: Record<string, number> = {
  USD: 840,
  INR: 356,
  EUR: 978,
  AED: 784,
  GBP: 826,
  SGD: 702
}

const MILLISECONDS_PER_DAY = 86_400_000

/** `''` / `null` / `undefined` become `undefined`, everything else becomes a number. */
export function toOptionalNumber(value?: string | number | null): number | undefined {
  if (typeof value === 'number') return value
  if (value == null) return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : Number(trimmed)
}

/** Same as {@link toOptionalNumber} but with a fallback for empty *and* invalid numbers. */
function toNumberOr(value: string | number | undefined, fallback: number): number {
  const parsed = toOptionalNumber(value)
  return parsed === undefined || Number.isNaN(parsed) ? fallback : parsed
}

/** `2026-10-02` → days since the Unix epoch (the format the API stores). */
function toEpochDays(date?: string): number | undefined {
  if (!date) return undefined
  return Math.floor(new Date(date).getTime() / MILLISECONDS_PER_DAY)
}

/** Days since the Unix epoch → `2026-10-02`. */
function fromEpochDays(days?: number): string {
  if (typeof days !== 'number') return ''
  const date = new Date(days * MILLISECONDS_PER_DAY)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

/** Seconds (or milliseconds) since the epoch → ISO timestamp. */
function fromEpochTimestamp(value?: number): string | undefined {
  if (typeof value !== 'number') return undefined
  const milliseconds = value < 10_000_000_000 ? value * 1000 : value
  const date = new Date(milliseconds)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/** An empty optional text field means "use the fallback value". */
function textOrFallback(value: string | undefined, fallback: string): string {
  return value !== undefined && value.trim() !== '' ? value : fallback
}

/** Currency code (`USD`) → ISO-4217 number (`840`), defaulting to USD. */
function toCurrencyCode(currency?: string): number {
  if (currency === undefined) return 840
  return CURRENCY_CODES[currency] ?? toNumberOr(currency, 840)
}

/** The stored total wins, otherwise the items decide it. */
function storedOrComputedInvoiceTotal(invoice: BillInvoiceForm): number {
  const stored = invoice.invoiceTotal
  if (stored != null && stored.trim() !== '') return Number(stored)
  return invoiceTotal(invoice)
}

/**
 * Payload for the nested "document" view of a shipping bill: stored on the saved
 * record and reused by the flat-file generator.
 */
export function toShippingBillPayload(values: ShippingBillFormValues) {
  const dischargePort =
    typeof values.dischargePort === 'string' && values.dischargePort.trim() !== ''
      ? values.dischargePort
      : values.finalDestinationPort
  return {
    shipping_bill: {
      job_number: toOptionalNumber(values.jobNumber),
      job_date: values.jobDate,
      exporter: Number(values.exporterId),
      exporter_branch: Number(values.exporterBranchId),
      consignee: Number(values.consigneeId),
      consignee_address: Number(values.consigneeBranchId),
      loading_port: values.loadingPort,
      loading_port_code: values.loadingPort,
      loading_country_code: portCountry(values.loadingPort),
      final_destination_port: values.finalDestinationPort,
      final_destination_country_code: portCountry(values.finalDestinationPort),
      discharge_port: dischargePort,
      discharge_country_code: portCountry(dischargePort),
      origin_state_code: toOptionalNumber(values.originStateCode),
      nfei_category: toOptionalNumber(values.nfeiCategory),
      rbi_waiver_number: values.rbiWaiverNumber,
      rbi_waiver_date: values.rbiWaiverDate,
      sealtype: values.sealType,
      natureofcargo: values.natureOfCargo,
      grossweight: toOptionalNumber(values.grossWeight),
      netweight: toOptionalNumber(values.netWeight),
      measurement_unit: values.measurementUnit,
      total_packages: toOptionalNumber(values.totalPackages),
      marks_and_numbers: values.marksAndNumbers,
      loose_packets: toOptionalNumber(values.loosePackets),
      number_of_containers:
        values.containers.length > 0 ? values.containers.length : (toOptionalNumber(values.numberOfContainers) ?? 0),
      mawb_number: values.mawbNumber,
      hawb_number: values.hawbNumber
    },
    invoices: values.invoices.map((invoice, index) => ({
      serial_number: index + 1,
      invoicenumber: invoice.invoiceNumber,
      date: invoice.invoiceDate,
      currency: invoice.currency,
      contract_type: invoice.contractType,
      buyer: Number(invoice.buyerSameAsConsignee ? values.consigneeId : invoice.buyerId),
      buyer_address: Number(invoice.buyerSameAsConsignee ? values.consigneeBranchId : invoice.buyerBranchId),
      third_party: toOptionalNumber(invoice.thirdPartyId),
      third_party_address: toOptionalNumber(invoice.thirdPartyBranchId),
      freight_rate: toOptionalNumber(invoice.freightRate),
      freight_amount: toOptionalNumber(invoice.freightAmount),
      freight_currency: textOrFallback(invoice.freightCurrency, invoice.currency),
      insurance_rate: toOptionalNumber(invoice.insuranceRate),
      insurance_amount: toOptionalNumber(invoice.insuranceAmount),
      insurance_currency: textOrFallback(invoice.insuranceCurrency, invoice.currency),
      commission_rate: toOptionalNumber(invoice.commissionRate),
      commission_amount: toOptionalNumber(invoice.commissionAmount),
      commission_currency: textOrFallback(invoice.commissionCurrency, invoice.currency),
      discount_rate: toOptionalNumber(invoice.discountRate),
      discount_amount: toOptionalNumber(invoice.discountAmount),
      discount_currency: textOrFallback(invoice.discountCurrency, invoice.currency),
      other_deductions_rate: toOptionalNumber(invoice.otherDeductionsRate),
      other_deductions_amount: toOptionalNumber(invoice.otherDeductionsAmount),
      other_deductions_currency: textOrFallback(invoice.otherDeductionsCurrency, invoice.currency),
      packing_charges: toOptionalNumber(invoice.packingCharges),
      freight_insaurance_included: invoice.freightInsuranceIncluded,
      contract_number: invoice.contractNumber,
      nature_of_payment: invoice.natureOfPayment,
      period_of_payment: toOptionalNumber(invoice.periodOfPayment),
      invoice_total: storedOrComputedInvoiceTotal(invoice),
      items: invoice.items.map((item, itemIndex) => ({
        item_serial_number: itemIndex + 1,
        ritc_code: item.ritcCode,
        goods_description_1: item.goodsDescription1,
        goods_description_2: item.goodsDescription2,
        goods_description_3: item.goodsDescription3,
        accessories_description: item.accessoriesDescription,
        scheme_code: item.schemeCode,
        quantity: Number(item.quantity),
        unit_of_measurement: item.unitOfMeasurement,
        unit_price: Number(item.unitPrice),
        unit_of_rate: textOrFallback(item.unitOfRate, item.unitOfMeasurement),
        line_total: lineTotal(item),
        present_market_value: toOptionalNumber(item.presentMarketValue),
        no_of_units: toOptionalNumber(item.numberOfUnits),
        accessory_status: item.accessoryStatus,
        third_party: item.thirdPartyItem,
        igst_payment_status: item.igstPaymentStatus,
        taxable_value: item.igstPaymentStatus === 'P' ? toOptionalNumber(item.taxableValue) : undefined,
        igst_amount: item.igstPaymentStatus === 'P' ? toOptionalNumber(item.igstAmount) : undefined,
        drawback_serial_number: item.drawbackSerialNumber,
        drawback_quantity: toOptionalNumber(item.drawbackQuantity),
        rodtep: toOptionalNumber(item.rodtep),
        cess: toOptionalNumber(item.cess),
        origin_district_code: toOptionalNumber(item.originDistrictCode),
        trade_agreements_code: item.tradeAgreementsCode,
        end_use_of_item: item.endUseOfItem,
        total_package: toOptionalNumber(item.totalPackage),
        reward_item: item.rewardItem
      }))
    })),
    invoice_item_third_parties: values.invoices.flatMap((invoice, invoiceIndex) =>
      invoice.items.flatMap((item, itemIndex) =>
        item.thirdPartyItem && item.itemThirdPartyId
          ? [
              {
                invoice_serial_number: invoiceIndex + 1,
                item_serial_number: itemIndex + 1,
                third_party: Number(item.itemThirdPartyId),
                third_party_address: toOptionalNumber(item.itemThirdPartyBranchId)
              }
            ]
          : []
      )
    ),
    ar4_details: values.invoices.flatMap((invoice, invoiceIndex) =>
      invoice.items.flatMap((item, itemIndex) =>
        item.ar4Number
          ? [
              {
                invoice_serial_number: invoiceIndex + 1,
                item_serial_number: itemIndex + 1,
                ar4_number: item.ar4Number,
                ar4_date: item.ar4Date,
                commissionerate: item.ar4Commissionerate,
                division: item.ar4Division,
                range: item.ar4Range,
                remarks: item.ar4Remarks
              }
            ]
          : []
      )
    ),
    container_details: values.containers.map((container) => ({
      container_number: container.containerNumber,
      container_size: toOptionalNumber(container.containerSize),
      excise_seal_number: container.exciseSealNumber,
      seal_date: container.sealDate,
      seal_type: container.sealType,
      seal_device_id: container.sealDeviceId,
      movement_document_type: container.movementDocumentType,
      movement_document_number: container.movementDocumentNumber
    })),
    packging_list: values.packingRanges.map((range) => ({
      packing_number_from: toOptionalNumber(range.packingNumberFrom),
      packing_number_to: toOptionalNumber(range.packingNumberTo),
      packing_code: range.packingCode
    })),
    supporting_docs: values.documents.map((document, index) => ({
      serial_number: index + 1,
      invoice_serial_number: toOptionalNumber(document.invoiceSerialNumber),
      item_serial_number: toOptionalNumber(document.itemSerialNumber),
      document_type_code: document.documentTypeCode,
      document_reference_number: document.documentReferenceNumber,
      image_reference_number: document.imageReferenceNumber,
      document_issue_date: toEpochDays(document.documentIssueDate),
      document_expiry_date: document.documentExpiryDate,
      place_of_issue: document.placeOfIssue,
      issuing_party_code: document.issuingPartyCode,
      issue_party_name: document.issuingPartyName,
      issuing_party_name_addr1: document.issuingPartyAddress1,
      issuing_party_name_addr2: document.issuingPartyAddress2,
      issuing_party_name_city: document.issuingPartyCity,
      issuing_party_name_pin: document.issuingPartyPin,
      beneficiary_party_code: document.beneficiaryPartyCode,
      beneficiary_party_name: document.beneficiaryPartyName,
      beneficiary_party_name_addr1: document.beneficiaryPartyAddress1,
      beneficiary_party_name_addr2: document.beneficiaryPartyAddress2,
      beneficiary_party_name_city: document.beneficiaryPartyCity,
      beneficiary_party_name_pin: document.beneficiaryPartyPin,
      file_type: document.fileType,
      icegate_id: document.icegateId
    })),
    licenses: values.licenses.map((license) => ({
      registration_number: license.registrationNumber,
      registration_date: license.registrationDate,
      invoice_serial_number: toOptionalNumber(license.invoiceSerialNumber),
      item_serial_number: toOptionalNumber(license.itemSerialNumber),
      licence_serial_number: toOptionalNumber(license.licenseSerialNumber),
      item_serial_number_part_e: license.itemSerialNumberPartE,
      item_serial_number_part_c: license.itemSerialNumberPartC,
      quantity: toOptionalNumber(license.licenseQuantity),
      export_quantity: toOptionalNumber(license.licenseExportQuantity),
      indigenous_or_imported: license.indigenousOrImported
    }))
  }
}

/** The nested document stored on a saved bill. */
export type ShippingBillPayload = ReturnType<typeof toShippingBillPayload>

/**
 * Payload expected by `POST /api/shipping-bills` (`shipping_bill.http`).
 *
 * Not called by the mock app (there is no backend yet), but kept as the single
 * definition of the HTTP contract so a real API can be plugged into
 * `shipping-bill-service.ts` without re-deriving the mapping.
 */
export function toHttpShippingBillPayload(values: ShippingBillFormValues) {
  return {
    chaId: 1000,
    jobDate: toEpochDays(values.jobDate),
    exporterId: toOptionalNumber(values.exporterId),
    exporterBranchId: toOptionalNumber(values.exporterBranchId),
    consigneeId: toOptionalNumber(values.consigneeId),
    consigneeAddressId: toOptionalNumber(values.consigneeBranchId),
    originStateCode: toOptionalNumber(values.originStateCode),
    loadingPort: values.loadingPort,
    finalDestinationPort: values.finalDestinationPort,
    dischargePort:
      typeof values.dischargePort === 'string' && values.dischargePort.trim() !== ''
        ? values.dischargePort
        : values.finalDestinationPort,
    sealType: toOptionalNumber(values.sealType),
    natureOfCargo: toOptionalNumber(values.natureOfCargo),
    grossWeight: toOptionalNumber(values.grossWeight),
    netWeight: toOptionalNumber(values.netWeight),
    measurementUnit: values.measurementUnit === 'KG' ? 'KGS' : values.measurementUnit,
    totalPackages: toOptionalNumber(values.totalPackages),
    marksAndNumbers: values.marksAndNumbers,
    loosePackets: toOptionalNumber(values.loosePackets),
    numberOfContainers:
      values.containers.length > 0 ? values.containers.length : (toOptionalNumber(values.numberOfContainers) ?? 0),
    invoices: values.invoices.map((invoice, index) => ({
      serialNumber: index + 1,
      invoiceNumber: invoice.invoiceNumber,
      date: toEpochDays(invoice.invoiceDate),
      currency: toCurrencyCode(invoice.currency),
      contractType: toOptionalNumber(invoice.contractType),
      buyerId: toOptionalNumber(invoice.buyerSameAsConsignee ? values.consigneeId : invoice.buyerId),
      buyerAddressId: toOptionalNumber(invoice.buyerSameAsConsignee ? values.consigneeBranchId : invoice.buyerBranchId),
      freightCurrency: toCurrencyCode(textOrFallback(invoice.freightCurrency, invoice.currency)),
      freightAmount: toNumberOr(invoice.freightAmount, 0),
      insuranceCurrency: toCurrencyCode(textOrFallback(invoice.insuranceCurrency, invoice.currency)),
      insuranceAmount: toNumberOr(invoice.insuranceAmount, 0),
      commissionCurrency: toCurrencyCode(textOrFallback(invoice.commissionCurrency, invoice.currency)),
      commissionAmount: toNumberOr(invoice.commissionAmount, 0),
      discountCurrency: toCurrencyCode(textOrFallback(invoice.discountCurrency, invoice.currency)),
      discountAmount: toNumberOr(invoice.discountAmount, 0),
      otherDeductionsCurrency: toCurrencyCode(textOrFallback(invoice.otherDeductionsCurrency, invoice.currency)),
      otherDeductionsAmount: toNumberOr(invoice.otherDeductionsAmount, 0),
      freightInsauranceIncluded: toOptionalNumber(invoice.freightInsuranceIncluded),
      packingCharges: toNumberOr(invoice.packingCharges, 0),
      natureOfPayment: toOptionalNumber(invoice.natureOfPayment),
      periodOfPayment: toOptionalNumber(invoice.periodOfPayment),
      items: invoice.items.map((item, itemIndex) => ({
        itemSerialNumber: itemIndex + 1,
        schemeCode: item.schemeCode,
        ritcCode: item.ritcCode,
        goodsDescription: item.goodsDescription1,
        unitOfMeasurement: item.unitOfMeasurement,
        quantity: toOptionalNumber(item.quantity),
        unitPrice: toOptionalNumber(item.unitPrice),
        unitOfRate: textOrFallback(item.unitOfRate, item.unitOfMeasurement),
        noOfUnits: toNumberOr(item.numberOfUnits, 1),
        presentMarketValue: toOptionalNumber(item.presentMarketValue),
        thirdParty: Boolean(item.thirdPartyItem),
        rewardItem: Boolean(item.rewardItem),
        totalPackage: toOptionalNumber(item.totalPackage),
        endUseOfItem: item.endUseOfItem,
        igstPaymentStatus: toOptionalNumber(item.igstPaymentStatus),
        originDistrictCode: toOptionalNumber(item.originDistrictCode),
        tradeAgreementsCode: item.tradeAgreementsCode,
        drawbackSerialNumber: item.drawbackSerialNumber,
        drawbackQuantity: toOptionalNumber(item.drawbackQuantity)
      }))
    })),
    packgingList: values.packingRanges.map((range) => ({
      packingNumberFrom: toOptionalNumber(range.packingNumberFrom),
      packingNumberTo: toOptionalNumber(range.packingNumberTo),
      packingCode: range.packingCode
    })),
    documents: values.documents.map((document, index) => ({
      invoiceSerialNumber: toNumberOr(document.invoiceSerialNumber, 1),
      itemSerialNumber: toNumberOr(document.itemSerialNumber, 1),
      serialNumber: index + 1,
      imageReferenceNumber: document.imageReferenceNumber,
      documentTypeCode: document.documentTypeCode,
      documentIssueDate: toEpochDays(document.documentIssueDate),
      useDefault: true,
      fileType: toNumberOr(document.fileType, 1)
    }))
  }
}

/** The payload accepted by `POST /api/shipping-bills`. */
export type HttpShippingBillPayload = ReturnType<typeof toHttpShippingBillPayload>

/**
 * Convert a demo "server" record into the `SavedBill` shape the UI renders.
 *
 * The demo records only contain header data, so invoice/party details start from
 * the same empty defaults a brand-new bill uses.
 */
export function demoRecordToSavedBill(record: DemoShippingBillRecord): SavedBill {
  const jobDate = fromEpochDays(record.jobDate)
  const updated = fromEpochTimestamp(record.updated)
  return {
    id: record.id,
    created: updated ?? new Date().toISOString(),
    updated: updated ?? new Date().toISOString(),
    values: {
      ...emptyBill(),
      jobNumber: String(record.jobNumber),
      jobDate: jobDate !== '' ? jobDate : new Date().toISOString().slice(0, 10),
      exporterName: record.exporterName,
      consigneeName: record.consigneeName,
      loadingPort: record.loadingPort,
      finalDestinationPort: record.destinationPort,
      dischargePort: record.dischargePort,
      sealType: '3',
      natureOfCargo: '1',
      measurementUnit: 'KGS',
      loosePackets: '0',
      numberOfContainers: '0',
      invoices: [emptyInvoice()]
    }
  }
}

/** Flat text (`^` separated records) accepted by ICEGATE for a shipping bill. */
export function generateFlatFileContent(bill: SavedBill): string {
  const values = bill.values
  const lines: string[] = []

  lines.push(`HREC**ZZ*${values.loadingPort !== '' ? values.loadingPort : 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)
  lines.push('<TABLE>SHIPPING_BILL')
  lines.push(
    `<F>MESSAGE_TYPE^CHA_ID^JOB_NO^JOB_DATE^EXPORTER_ID^EXPORTER_BRANCH^CONSIGNEE_ID^LOADING_PORT^DEST_PORT^DISCHARGE_PORT^SEAL_TYPE^NATURE_OF_CARGO^GROSS_WEIGHT^NET_WEIGHT^UOM^PACKAGES^MARKS`
  )
  lines.push(
    `<R>F^1000^${textOr(values.jobNumber, String(bill.id))}^${values.jobDate}^${values.exporterId}^${values.exporterBranchId}^${values.consigneeId}^${values.loadingPort}^${values.finalDestinationPort}^${textOr(values.dischargePort, values.finalDestinationPort)}^${textOr(values.sealType, '')}^${values.natureOfCargo}^${textOr(values.grossWeight, '')}^${textOr(values.netWeight, '')}^${textOr(values.measurementUnit, 'KGS')}^${textOr(values.totalPackages, '')}^${flatFileText(values.marksAndNumbers)}`
  )

  if (values.invoices.length > 0) {
    lines.push('<TABLE>INVOICE')
    lines.push('<F>INVOICE_SN^INVOICE_NO^INVOICE_DATE^CURRENCY^CONTRACT_TYPE^BUYER_ID^FREIGHT_AMOUNT^INSURANCE_AMOUNT')
    values.invoices.forEach((invoice, index) => {
      lines.push(
        `<R>${index + 1}^${invoice.invoiceNumber}^${invoice.invoiceDate}^${textOr(invoice.currency, 'USD')}^${textOr(invoice.contractType, '1')}^${textOr(invoice.buyerId, values.consigneeId)}^${textOr(invoice.freightAmount, '0')}^${textOr(invoice.insuranceAmount, '0')}`
      )
    })

    lines.push('<TABLE>ITEM')
    lines.push('<F>INVOICE_SN^ITEM_SN^RITC_CODE^DESCRIPTION^QUANTITY^UOM^UNIT_PRICE^LINE_TOTAL^SCHEME_CODE')
    values.invoices.forEach((invoice, invoiceIndex) => {
      invoice.items.forEach((item, itemIndex) => {
        const total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
        lines.push(
          `<R>${invoiceIndex + 1}^${itemIndex + 1}^${item.ritcCode}^${flatFileText(item.goodsDescription1)}^${textOr(item.quantity, '')}^${textOr(item.unitOfMeasurement, 'PCS')}^${textOr(item.unitPrice, '')}^${total.toFixed(2)}^${textOr(item.schemeCode, '')}`
        )
      })
    })
  }

  if (values.packingRanges.length > 0) {
    lines.push('<TABLE>PACKING')
    lines.push('<F>FROM_PKG^TO_PKG^PKG_CODE')
    values.packingRanges.forEach((range) => {
      lines.push(`<R>${range.packingNumberFrom}^${range.packingNumberTo}^${textOr(range.packingCode, 'CTN')}`)
    })
  }

  lines.push(`TREC**ZZ*${values.loadingPort !== '' ? values.loadingPort : 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)

  return lines.join('\r\n')
}

/** Empty string means "use the fallback" (keeps the original flat-file output). */
function textOr(value: string | undefined, fallback: string): string {
  return value !== undefined && value !== '' ? value : fallback
}

/** Flat files cannot contain the field or record separators. */
function flatFileText(value?: string): string {
  return (value ?? '').replace(/[\^\r\n]+/g, ' ')
}

/** Hand a generated file to the browser as a download. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 1000)
}
