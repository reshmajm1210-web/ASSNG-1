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

// Shared conversion helpers used by every payload converter below.

/** Returns days since Unix Epoch (1970-01-01), as expected by the customs API format. */
export function toEpochDays(dateStr?: string): number | undefined {
  if (!dateStr) return undefined
  return Math.floor(new Date(dateStr).getTime() / 86400000)
}

export function parseOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  const text = asString(value)
  return text.trim() !== '' ? Number(text) : undefined
}

/** Like `parseOptionalNumber(value) || fallback`, keeping the zero-falls-back-to-default behavior. */
function numberOr(value: unknown, fallback: number): number {
  const parsed = parseOptionalNumber(value)
  if (parsed) return parsed
  return fallback
}

/** Stringifies primitive values only; objects are treated as empty text. */
export function asString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

const CURRENCY_CODES: Record<string, number | undefined> = {
  USD: 840,
  INR: 356,
  EUR: 978,
  AED: 784,
  GBP: 826,
  SGD: 702
}

const CURRENCY_NAMES: Record<number, string | undefined> = {
  840: 'USD',
  356: 'INR',
  978: 'EUR',
  784: 'AED',
  826: 'GBP',
  702: 'SGD'
}

export function currencyCodeToNumber(code?: string): number {
  if (!code) return 840
  return CURRENCY_CODES[code] ?? parseOptionalNumber(code) ?? 840
}

export function currencyNumberToName(code: unknown): string {
  if (typeof code === 'number') return CURRENCY_NAMES[code] ?? asString(code)
  const text = asString(code)
  return text !== '' ? text : 'USD'
}

function formatIsoString(value: unknown): string {
  if (!value) return new Date().toISOString()
  if (typeof value === 'number') {
    const ms = value < 10000000000 ? value * 1000 : value
    const date = new Date(ms)
    return !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString()
  }
  const date = new Date(asString(value))
  return !isNaN(date.getTime()) ? date.toISOString() : new Date().toISOString()
}

function formatEpochDays(days: unknown): string {
  if (typeof days === 'number') {
    const date = new Date(days * 86400000)
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0]
  }
  return asString(days)
}

function resolveDischargePort(values: ShippingBillFormValues): string {
  return typeof values.dischargePort === 'string' && values.dischargePort.trim()
    ? values.dischargePort
    : values.finalDestinationPort
}

function resolveBuyer(values: ShippingBillFormValues, invoice: BillInvoiceForm) {
  return invoice.buyerSameAsConsignee ? values.consigneeId : invoice.buyerId
}

function resolveBuyerBranch(values: ShippingBillFormValues, invoice: BillInvoiceForm) {
  return invoice.buyerSameAsConsignee ? values.consigneeBranchId : invoice.buyerBranchId
}

function resolveChargeCurrency(currency: string | undefined, invoiceCurrency: string): string {
  return currency?.trim() ? currency : invoiceCurrency
}

/**
 * Form values contain only editable fields. Resolve references and calculated values at the save boundary.
 * This is the canonical domain payload stored with each saved bill.
 */
export function toShippingBillPayload(values: ShippingBillFormValues) {
  const dischargePort = resolveDischargePort(values)
  return {
    shipping_bill: {
      job_number: parseOptionalNumber(values.jobNumber),
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
      origin_state_code: parseOptionalNumber(values.originStateCode),
      nfei_category: parseOptionalNumber(values.nfeiCategory),
      rbi_waiver_number: values.rbiWaiverNumber,
      rbi_waiver_date: values.rbiWaiverDate,
      sealtype: values.sealType,
      natureofcargo: values.natureOfCargo,
      grossweight: parseOptionalNumber(values.grossWeight),
      netweight: parseOptionalNumber(values.netWeight),
      measurement_unit: values.measurementUnit,
      total_packages: parseOptionalNumber(values.totalPackages),
      marks_and_numbers: values.marksAndNumbers,
      loose_packets: parseOptionalNumber(values.loosePackets),
      number_of_containers:
        values.containers.length > 0 ? values.containers.length : (parseOptionalNumber(values.numberOfContainers) ?? 0),
      mawb_number: values.mawbNumber,
      hawb_number: values.hawbNumber
    },
    invoices: values.invoices.map((invoice, index) => ({
      serial_number: index + 1,
      invoicenumber: invoice.invoiceNumber,
      date: invoice.invoiceDate,
      currency: invoice.currency,
      contract_type: invoice.contractType,
      buyer: Number(resolveBuyer(values, invoice)),
      buyer_address: Number(resolveBuyerBranch(values, invoice)),
      third_party: parseOptionalNumber(invoice.thirdPartyId),
      third_party_address: parseOptionalNumber(invoice.thirdPartyBranchId),
      freight_rate: parseOptionalNumber(invoice.freightRate),
      freight_amount: parseOptionalNumber(invoice.freightAmount),
      freight_currency: resolveChargeCurrency(invoice.freightCurrency, invoice.currency),
      insurance_rate: parseOptionalNumber(invoice.insuranceRate),
      insurance_amount: parseOptionalNumber(invoice.insuranceAmount),
      insurance_currency: resolveChargeCurrency(invoice.insuranceCurrency, invoice.currency),
      commission_rate: parseOptionalNumber(invoice.commissionRate),
      commission_amount: parseOptionalNumber(invoice.commissionAmount),
      commission_currency: resolveChargeCurrency(invoice.commissionCurrency, invoice.currency),
      discount_rate: parseOptionalNumber(invoice.discountRate),
      discount_amount: parseOptionalNumber(invoice.discountAmount),
      discount_currency: resolveChargeCurrency(invoice.discountCurrency, invoice.currency),
      other_deductions_rate: parseOptionalNumber(invoice.otherDeductionsRate),
      other_deductions_amount: parseOptionalNumber(invoice.otherDeductionsAmount),
      other_deductions_currency: resolveChargeCurrency(invoice.otherDeductionsCurrency, invoice.currency),
      packing_charges: parseOptionalNumber(invoice.packingCharges),
      freight_insaurance_included: invoice.freightInsuranceIncluded,
      contract_number: invoice.contractNumber,
      nature_of_payment: invoice.natureOfPayment,
      period_of_payment: parseOptionalNumber(invoice.periodOfPayment),
      invoice_total:
        invoice.invoiceTotal != null && invoice.invoiceTotal.trim() !== ''
          ? Number(invoice.invoiceTotal)
          : invoiceTotal(invoice),
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
        unit_of_rate: item.unitOfRate?.trim() ? item.unitOfRate : item.unitOfMeasurement,
        line_total: lineTotal(item),
        present_market_value: parseOptionalNumber(item.presentMarketValue),
        no_of_units: parseOptionalNumber(item.numberOfUnits),
        accessory_status: item.accessoryStatus,
        third_party: item.thirdPartyItem,
        igst_payment_status: item.igstPaymentStatus,
        taxable_value: item.igstPaymentStatus === 'P' ? parseOptionalNumber(item.taxableValue) : undefined,
        igst_amount: item.igstPaymentStatus === 'P' ? parseOptionalNumber(item.igstAmount) : undefined,
        drawback_serial_number: item.drawbackSerialNumber,
        drawback_quantity: parseOptionalNumber(item.drawbackQuantity),
        rodtep: parseOptionalNumber(item.rodtep),
        cess: parseOptionalNumber(item.cess),
        origin_district_code: parseOptionalNumber(item.originDistrictCode),
        trade_agreements_code: item.tradeAgreementsCode,
        end_use_of_item: item.endUseOfItem,
        total_package: parseOptionalNumber(item.totalPackage),
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
                third_party_address: parseOptionalNumber(item.itemThirdPartyBranchId)
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
      container_size: parseOptionalNumber(container.containerSize),
      excise_seal_number: container.exciseSealNumber,
      seal_date: container.sealDate,
      seal_type: container.sealType,
      seal_device_id: container.sealDeviceId,
      movement_document_type: container.movementDocumentType,
      movement_document_number: container.movementDocumentNumber
    })),
    packging_list: values.packingRanges.map((range) => ({
      packing_number_from: parseOptionalNumber(range.packingNumberFrom),
      packing_number_to: parseOptionalNumber(range.packingNumberTo),
      packing_code: range.packingCode
    })),
    supporting_docs: values.documents.map((document, index) => ({
      serial_number: index + 1,
      invoice_serial_number: parseOptionalNumber(document.invoiceSerialNumber),
      item_serial_number: parseOptionalNumber(document.itemSerialNumber),
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
      invoice_serial_number: parseOptionalNumber(license.invoiceSerialNumber),
      item_serial_number: parseOptionalNumber(license.itemSerialNumber),
      licence_serial_number: parseOptionalNumber(license.licenseSerialNumber),
      item_serial_number_part_e: license.itemSerialNumberPartE,
      item_serial_number_part_c: license.itemSerialNumberPartC,
      quantity: parseOptionalNumber(license.licenseQuantity),
      export_quantity: parseOptionalNumber(license.licenseExportQuantity),
      indigenous_or_imported: license.indigenousOrImported
    }))
  }
}

export type ShippingBillPayload = ReturnType<typeof toShippingBillPayload>
export type HttpShippingBillPayload = ReturnType<typeof toHttpShippingBillPayload>

/**
 * Transforms form values into the flat payload structure of POST /api/shipping-bills
 * (per shipping_bill.http). Uses the same shared helpers as {@link toShippingBillPayload}
 * so both formats stay consistent; only the target shape differs.
 */
export function toHttpShippingBillPayload(values: ShippingBillFormValues) {
  return {
    chaId: 1000,
    jobDate: toEpochDays(values.jobDate),
    exporterId: parseOptionalNumber(values.exporterId),
    exporterBranchId: parseOptionalNumber(values.exporterBranchId),
    consigneeId: parseOptionalNumber(values.consigneeId),
    consigneeAddressId: parseOptionalNumber(values.consigneeBranchId),
    originStateCode: parseOptionalNumber(values.originStateCode),
    loadingPort: values.loadingPort,
    finalDestinationPort: values.finalDestinationPort,
    dischargePort: resolveDischargePort(values),
    sealType: parseOptionalNumber(values.sealType),
    natureOfCargo: parseOptionalNumber(values.natureOfCargo),
    grossWeight: parseOptionalNumber(values.grossWeight),
    netWeight: parseOptionalNumber(values.netWeight),
    measurementUnit: values.measurementUnit === 'KG' ? 'KGS' : values.measurementUnit,
    totalPackages: parseOptionalNumber(values.totalPackages),
    marksAndNumbers: values.marksAndNumbers,
    loosePackets: parseOptionalNumber(values.loosePackets),
    numberOfContainers: values.containers.length
      ? values.containers.length
      : (parseOptionalNumber(values.numberOfContainers) ?? 0),
    invoices: values.invoices.map((inv, index) => ({
      serialNumber: index + 1,
      invoiceNumber: inv.invoiceNumber,
      date: toEpochDays(inv.invoiceDate),
      currency: currencyCodeToNumber(inv.currency),
      contractType: parseOptionalNumber(inv.contractType),
      buyerId: parseOptionalNumber(resolveBuyer(values, inv)),
      buyerAddressId: parseOptionalNumber(resolveBuyerBranch(values, inv)),
      freightCurrency: currencyCodeToNumber(resolveChargeCurrency(inv.freightCurrency, inv.currency)),
      freightAmount: parseOptionalNumber(inv.freightAmount) ?? 0,
      insuranceCurrency: currencyCodeToNumber(resolveChargeCurrency(inv.insuranceCurrency, inv.currency)),
      insuranceAmount: parseOptionalNumber(inv.insuranceAmount) ?? 0,
      commissionCurrency: currencyCodeToNumber(resolveChargeCurrency(inv.commissionCurrency, inv.currency)),
      commissionAmount: parseOptionalNumber(inv.commissionAmount) ?? 0,
      discountCurrency: currencyCodeToNumber(resolveChargeCurrency(inv.discountCurrency, inv.currency)),
      discountAmount: parseOptionalNumber(inv.discountAmount) ?? 0,
      otherDeductionsCurrency: currencyCodeToNumber(resolveChargeCurrency(inv.otherDeductionsCurrency, inv.currency)),
      otherDeductionsAmount: parseOptionalNumber(inv.otherDeductionsAmount) ?? 0,
      freightInsauranceIncluded: parseOptionalNumber(inv.freightInsuranceIncluded),
      packingCharges: parseOptionalNumber(inv.packingCharges) ?? 0,
      natureOfPayment: parseOptionalNumber(inv.natureOfPayment),
      periodOfPayment: parseOptionalNumber(inv.periodOfPayment),
      items: inv.items.map((item, itemIdx) => ({
        itemSerialNumber: itemIdx + 1,
        schemeCode: item.schemeCode,
        ritcCode: item.ritcCode,
        goodsDescription: item.goodsDescription1,
        unitOfMeasurement: item.unitOfMeasurement,
        quantity: parseOptionalNumber(item.quantity),
        unitPrice: parseOptionalNumber(item.unitPrice),
        unitOfRate: textOr(item.unitOfRate, item.unitOfMeasurement),
        noOfUnits: numberOr(item.numberOfUnits, 1),
        presentMarketValue: parseOptionalNumber(item.presentMarketValue),
        thirdParty: Boolean(item.thirdPartyItem),
        rewardItem: Boolean(item.rewardItem),
        totalPackage: parseOptionalNumber(item.totalPackage),
        endUseOfItem: item.endUseOfItem,
        igstPaymentStatus: parseOptionalNumber(item.igstPaymentStatus),
        originDistrictCode: parseOptionalNumber(item.originDistrictCode),
        tradeAgreementsCode: item.tradeAgreementsCode,
        drawbackSerialNumber: item.drawbackSerialNumber,
        drawbackQuantity: parseOptionalNumber(item.drawbackQuantity)
      }))
    })),
    packgingList: values.packingRanges.map((range) => ({
      packingNumberFrom: parseOptionalNumber(range.packingNumberFrom),
      packingNumberTo: parseOptionalNumber(range.packingNumberTo),
      packingCode: range.packingCode
    })),
    documents: values.documents.map((doc, docIdx) => ({
      invoiceSerialNumber: numberOr(doc.invoiceSerialNumber, 1),
      itemSerialNumber: numberOr(doc.itemSerialNumber, 1),
      serialNumber: docIdx + 1,
      imageReferenceNumber: doc.imageReferenceNumber,
      documentTypeCode: doc.documentTypeCode,
      documentIssueDate: toEpochDays(doc.documentIssueDate),
      useDefault: true,
      fileType: numberOr(doc.fileType, 1)
    }))
  }
}

// --- API record normalization (API/mock wire format -> form values) ---

type ApiRecord = Record<string, unknown>

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null
}

function hasText(value: unknown): boolean {
  return asString(value).trim() !== ''
}

export function normalizeApiBill(raw: unknown): SavedBill {
  if (!isRecord(raw)) return { id: 0, created: '', updated: '', values: emptyBill() }

  // Already a saved bill from the mock store.
  if (raw.values && raw.id != null) {
    return {
      ...(raw as unknown as SavedBill),
      updated: formatIsoString(raw.updated),
      created: formatIsoString(raw.created)
    }
  }

  const id = Number(raw.id ?? raw.shippingBillId ?? raw.chaId ?? Math.floor(Math.random() * 100000))
  const jobDateStr = formatEpochDays(raw.jobDate)
  const updated = formatIsoString(raw.updatedAt ?? raw.updated ?? raw.createdAt)
  const created = formatIsoString(raw.createdAt ?? raw.created ?? updated)

  const rawInvoices = Array.isArray(raw.invoices) ? raw.invoices : []
  const rawPacking = Array.isArray(raw.packgingList)
    ? raw.packgingList
    : Array.isArray(raw.packingRanges)
      ? raw.packingRanges
      : []
  const rawDocuments = Array.isArray(raw.documents) ? raw.documents : []

  const values: ShippingBillFormValues = {
    ...emptyBill(),
    jobNumber: raw.jobNumber != null ? asString(raw.jobNumber) : `JOB-${id}`,
    jobDate: jobDateStr || new Date().toISOString().split('T')[0],
    exporterId: asString(raw.exporterId),
    exporterBranchId: asString(raw.exporterBranchId),
    exporterName: asString(raw.exporterName),
    consigneeId: asString(raw.consigneeId),
    consigneeBranchId: asString(raw.consigneeAddressId ?? raw.consigneeBranchId),
    consigneeName: asString(raw.consigneeName),
    originStateCode: hasText(raw.originStateCode) ? String(raw.originStateCode) : '',
    loadingPort: asString(raw.loadingPort),
    finalDestinationPort: asString(raw.destinationPort ?? raw.finalDestinationPort),
    dischargePort: asString(raw.dischargePort ?? raw.destinationPort ?? raw.finalDestinationPort),
    sealType: hasText(raw.sealType) ? String(raw.sealType) : '3',
    natureOfCargo: hasText(raw.natureOfCargo) ? String(raw.natureOfCargo) : '1',
    grossWeight: hasText(raw.grossWeight) ? String(raw.grossWeight) : '',
    netWeight: hasText(raw.netWeight) ? String(raw.netWeight) : '',
    measurementUnit: asString(raw.measurementUnit) || 'KGS',
    totalPackages: hasText(raw.totalPackages) ? String(raw.totalPackages) : '',
    marksAndNumbers: asString(raw.marksAndNumbers),
    loosePackets: hasText(raw.loosePackets) ? String(raw.loosePackets) : '0',
    numberOfContainers: hasText(raw.numberOfContainers) ? String(raw.numberOfContainers) : '0',
    containers: Array.isArray(raw.containers) ? (raw.containers as ShippingBillFormValues['containers']) : [],
    invoices:
      rawInvoices.length > 0
        ? rawInvoices.map((inv, idx) => {
            const record = isRecord(inv) ? inv : {}
            const items = Array.isArray(record.items) ? record.items : []
            return {
              invoiceNumber: hasText(record.invoiceNumber) ? String(record.invoiceNumber) : `INV-${idx + 1}`,
              invoiceDate: formatEpochDays(record.date ?? record.invoiceDate) || new Date().toISOString().split('T')[0],
              currency: currencyNumberToName(record.currency),
              contractType: asString(record.contractType) || '1',
              buyerId: asString(record.buyerId),
              buyerBranchId: asString(record.buyerAddressId ?? record.buyerBranchId),
              buyerSameAsConsignee: record.buyerId == null || asString(record.buyerId) === asString(raw.consigneeId),
              freightAmount: hasText(record.freightAmount) ? String(record.freightAmount) : '',
              insuranceAmount: hasText(record.insuranceAmount) ? String(record.insuranceAmount) : '',
              items:
                items.length > 0
                  ? items.map((item) => {
                      const entry = isRecord(item) ? item : {}
                      return {
                        schemeCode: asString(entry.schemeCode),
                        ritcCode: asString(entry.ritcCode),
                        goodsDescription1: asString(entry.goodsDescription ?? entry.goodsDescription1),
                        quantity: hasText(entry.quantity) ? String(entry.quantity) : '',
                        unitOfMeasurement: asString(entry.unitOfMeasurement) || 'PCS',
                        unitPrice: hasText(entry.unitPrice) ? String(entry.unitPrice) : '',
                        unitOfRate: asString(entry.unitOfRate ?? entry.unitOfMeasurement) || 'PCS',
                        numberOfUnits: hasText(entry.noOfUnits) ? String(entry.noOfUnits) : '1',
                        presentMarketValue: hasText(entry.presentMarketValue) ? String(entry.presentMarketValue) : '',
                        thirdPartyItem: Boolean(entry.thirdParty),
                        rewardItem: Boolean(entry.rewardItem),
                        totalPackage: hasText(entry.totalPackage) ? String(entry.totalPackage) : '',
                        endUseOfItem: asString(entry.endUseOfItem),
                        igstPaymentStatus: hasText(entry.igstPaymentStatus) ? String(entry.igstPaymentStatus) : '2',
                        originDistrictCode: hasText(entry.originDistrictCode) ? String(entry.originDistrictCode) : '',
                        tradeAgreementsCode: asString(entry.tradeAgreementsCode),
                        drawbackSerialNumber: asString(entry.drawbackSerialNumber),
                        drawbackQuantity: hasText(entry.drawbackQuantity) ? String(entry.drawbackQuantity) : ''
                      }
                    })
                  : []
            }
          })
        : [emptyInvoice()],
    packingRanges: rawPacking.map((p) => {
      const record = isRecord(p) ? p : {}
      return {
        packingNumberFrom: asString(record.packingNumberFrom),
        packingNumberTo: asString(record.packingNumberTo),
        packingCode: asString(record.packingCode) || 'CTN'
      }
    }),
    documents: rawDocuments.map((doc) => {
      const record = isRecord(doc) ? doc : {}
      return {
        invoiceSerialNumber: asString(record.invoiceSerialNumber) || '1',
        itemSerialNumber: asString(record.itemSerialNumber) || '1',
        imageReferenceNumber: asString(record.imageReferenceNumber),
        documentTypeCode: asString(record.documentTypeCode),
        documentReferenceNumber: asString(record.documentReferenceNumber),
        documentIssueDate: formatEpochDays(record.documentIssueDate) || new Date().toISOString().split('T')[0],
        fileType: asString(record.fileType) || '1'
      }
    })
  }

  return {
    id,
    created,
    updated,
    values,
    payload: raw as unknown as ShippingBillPayload
  }
}

export function normalizeApiBills(raw: unknown): SavedBill[] {
  if (!raw) return []
  const list = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.data)
      ? raw.data
      : isRecord(raw) && Array.isArray(raw.bills)
        ? raw.bills
        : isRecord(raw) && Array.isArray(raw.shippingBills)
          ? raw.shippingBills
          : isRecord(raw) && Array.isArray(raw.items)
            ? raw.items
            : []
  return list.map(normalizeApiBill)
}

/** Fallback for empty text, matching `value || fallback` semantics without lint noise. */
function textOr(value: string | undefined, fallback: string | number | undefined): string {
  if (value) return value
  if (typeof fallback === 'number') return String(fallback)
  return fallback ?? ''
}

/** Builds the ICEGATE-style flat file (.sb) content for a shipping bill. */
export function generateFlatFileContent(bill: SavedBill): string {
  const v = bill.values
  const lines: string[] = []

  lines.push(`HREC**ZZ*${textOr(v.loadingPort, 'INMUN1')}*ZZ*ICEGATE*01*SB*1.0*`)
  lines.push(`<TABLE>SHIPPING_BILL`)
  lines.push(
    `<F>MESSAGE_TYPE^CHA_ID^JOB_NO^JOB_DATE^EXPORTER_ID^EXPORTER_BRANCH^CONSIGNEE_ID^LOADING_PORT^DEST_PORT^DISCHARGE_PORT^SEAL_TYPE^NATURE_OF_CARGO^GROSS_WEIGHT^NET_WEIGHT^UOM^PACKAGES^MARKS`
  )
  lines.push(
    `<R>F^1000^${textOr(v.jobNumber, bill.id)}^${v.jobDate}^${v.exporterId}^${v.exporterBranchId}^${v.consigneeId}^${v.loadingPort}^${v.finalDestinationPort}^${textOr(v.dischargePort, v.finalDestinationPort)}^${v.sealType ?? ''}^${v.natureOfCargo}^${v.grossWeight ?? ''}^${v.netWeight ?? ''}^${textOr(v.measurementUnit, 'KGS')}^${v.totalPackages ?? ''}^${(v.marksAndNumbers ?? '').replace(/[\^\r\n]+/g, ' ')}`
  )

  if (v.invoices.length > 0) {
    lines.push(`<TABLE>INVOICE`)
    lines.push(`<F>INVOICE_SN^INVOICE_NO^INVOICE_DATE^CURRENCY^CONTRACT_TYPE^BUYER_ID^FREIGHT_AMOUNT^INSURANCE_AMOUNT`)
    v.invoices.forEach((inv, idx) => {
      lines.push(
        `<R>${idx + 1}^${inv.invoiceNumber}^${inv.invoiceDate}^${textOr(inv.currency, 'USD')}^${textOr(inv.contractType, '1')}^${textOr(inv.buyerId, v.consigneeId)}^${textOr(inv.freightAmount, 0)}^${textOr(inv.insuranceAmount, 0)}`
      )
    })

    lines.push(`<TABLE>ITEM`)
    lines.push(`<F>INVOICE_SN^ITEM_SN^RITC_CODE^DESCRIPTION^QUANTITY^UOM^UNIT_PRICE^LINE_TOTAL^SCHEME_CODE`)
    v.invoices.forEach((inv, invIdx) => {
      inv.items.forEach((item, itemIdx) => {
        const total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
        lines.push(
          `<R>${invIdx + 1}^${itemIdx + 1}^${item.ritcCode}^${item.goodsDescription1.replace(/[\^\r\n]+/g, ' ')}^${item.quantity}^${textOr(item.unitOfMeasurement, 'PCS')}^${item.unitPrice}^${total.toFixed(2)}^${item.schemeCode ?? ''}`
        )
      })
    })
  }

  if (v.packingRanges.length > 0) {
    lines.push(`<TABLE>PACKING`)
    lines.push(`<F>FROM_PKG^TO_PKG^PKG_CODE`)
    v.packingRanges.forEach((pkg) => {
      lines.push(`<R>${pkg.packingNumberFrom}^${pkg.packingNumberTo}^${textOr(pkg.packingCode, 'CTN')}`)
    })
  }

  lines.push(`TREC**ZZ*${textOr(v.loadingPort, 'INMUN1')}*ZZ*ICEGATE*01*SB*1.0*`)

  return lines.join('\r\n')
}
