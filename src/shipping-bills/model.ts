export interface Branch {
  id: number
  branchName: string
  address1: string
  address2?: string
  city: string
  state?: string
  pincode?: string
  countryCode: string
  email?: string
  mobile?: string
  gstnId?: string
  adCode?: string
  accountNo?: string
  ifscCode?: string
}

export interface Exporter {
  id: number
  name: string
  iec: string
  class: string
  type: string
  pan?: string
  tan?: string
  aeoNumber?: string
  website?: string
  notes?: string
  disabled?: boolean
  branches: Branch[]
}

export interface Business {
  id: number
  name: string
  iec?: string
  isConsignee: boolean
  isBuyer: boolean
  isNotify: boolean
  isThirdParty: boolean
  branches: Branch[]
}

export interface PortOption {
  code: string
  name: string
  countryCode: string
}

export const loadingPorts: PortOption[] = [
  { code: 'INNSA1', name: 'Nhava Sheva', countryCode: 'IN' },
  { code: 'INMUN1', name: 'Mundra', countryCode: 'IN' },
  { code: 'INMAA1', name: 'Chennai', countryCode: 'IN' },
  { code: 'INBOM4', name: 'Mumbai Air Cargo', countryCode: 'IN' }
]

export const ports: PortOption[] = [
  { code: 'USMSY', name: 'New Orleans', countryCode: 'US' },
  { code: 'USLAX', name: 'Los Angeles', countryCode: 'US' },
  { code: 'DEHAM', name: 'Hamburg', countryCode: 'DE' },
  { code: 'AEJEA', name: 'Jebel Ali', countryCode: 'AE' },
  { code: 'SGSIN', name: 'Singapore', countryCode: 'SG' },
  { code: 'KRBUS', name: 'Busan', countryCode: 'KR' }
]

export const allPorts: PortOption[] = [...loadingPorts, ...ports]

export const countries = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'DE', label: 'Germany' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SG', label: 'Singapore' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'KR', label: 'South Korea' }
]

export interface BillItemForm {
  ritcCode: string
  goodsDescription1: string
  goodsDescription2?: string
  goodsDescription3?: string
  accessoriesDescription?: string
  quantity: string
  unitOfMeasurement: string
  unitPrice: string
  schemeCode?: string
  unitOfRate?: string
  presentMarketValue?: string
  numberOfUnits?: string
  lineTotal?: string
  accessoryStatus?: string
  thirdPartyItem?: boolean
  itemThirdPartyId?: string
  itemThirdPartyBranchId?: string
  ar4Number?: string
  ar4Date?: string
  ar4Commissionerate?: string
  ar4Division?: string
  ar4Range?: string
  ar4Remarks?: string
  igstPaymentStatus?: string
  taxableValue?: string
  igstAmount?: string
  mainDbkSerialNumber?: string
  drawbackSerialNumber?: string
  drawbackUnit?: string
  drawbackQuantity?: string
  customRateAdv?: string
  customRateSpec?: string
  totalDbkAmount?: string
  dbkAdv?: string
  dbkRateSpec?: string
  rosctlSerialNumber?: string
  centralTaxLevyDuty?: string
  centralTaxLevyRate?: string
  stateLevyDuty?: string
  stateLevyRate?: string
  rosctlQuantity?: string
  rosctlAmount?: string
  rodtep?: string
  rodtepRate?: string
  rodtepCap?: string
  rodtepQuantity?: string
  rodtepUnit?: string
  rodtepAmount?: string
  cess?: string
  originDistrictCode?: string
  tradeAgreementsCode?: string
  endUseOfItem?: string
  totalPackage?: string
  rewardItem?: boolean
}

export interface BillInvoiceForm {
  invoiceNumber: string
  invoiceDate: string
  currency: string
  contractType: string
  buyerSameAsConsignee: boolean
  buyerId: string
  buyerBranchId: string
  thirdPartyId?: string
  thirdPartyBranchId?: string
  freightRate?: string
  freightAmount?: string
  freightCurrency?: string
  insuranceRate?: string
  insuranceAmount?: string
  insuranceCurrency?: string
  commissionRate?: string
  commissionAmount?: string
  commissionCurrency?: string
  discountRate?: string
  discountAmount?: string
  discountCurrency?: string
  otherDeductionsRate?: string
  otherDeductionsAmount?: string
  otherDeductionsCurrency?: string
  packingCharges?: string
  freightInsuranceIncluded?: string
  contractNumber?: string
  natureOfPayment?: string
  periodOfPayment?: string
  invoiceTotal?: string
  items: BillItemForm[]
}

export interface ContainerForm {
  containerNumber: string
  containerSize?: string
  exciseSealNumber?: string
  sealDate?: string
  sealType?: string
  sealDeviceId?: string
  movementDocumentType?: string
  movementDocumentNumber?: string
  invoiceSerialNumber?: string
  itemSerialNumber?: string
  documentTypeCode?: string
  imageReferenceNumber?: string
}

export interface PackingRangeForm {
  packingNumberFrom: string
  packingNumberTo: string
  packingCode?: string
}

export interface SupportingDocForm {
  documentTypeCode: string
  documentReferenceNumber: string
  invoiceSerialNumber?: string
  itemSerialNumber?: string
  imageReferenceNumber?: string
  documentIssueDate?: string
  documentExpiryDate?: string
  placeOfIssue?: string
  issuingPartyCode?: string
  issuingPartyName?: string
  issuingPartyAddress1?: string
  issuingPartyAddress2?: string
  issuingPartyCity?: string
  issuingPartyPin?: string
  beneficiaryPartyCode?: string
  beneficiaryPartyName?: string
  beneficiaryPartyAddress1?: string
  beneficiaryPartyAddress2?: string
  beneficiaryPartyCity?: string
  beneficiaryPartyPin?: string
  fileType?: string
  icegateId?: string
}

export interface LicenseForm {
  registrationNumber: string
  registrationDate?: string
  invoiceSerialNumber?: string
  itemSerialNumber?: string
  licenseSerialNumber?: string
  itemSerialNumberPartE?: string
  itemSerialNumberPartC?: string
  licenseQuantity?: string
  licenseExportQuantity?: string
  indigenousOrImported?: string
}

export interface ShippingBillFormValues {
  jobNumber?: string
  jobDate: string
  exporterId: string
  exporterBranchId: string
  exporterName?: string
  consigneeId: string
  consigneeBranchId: string
  consigneeName?: string
  loadingPort: string
  finalDestinationPort: string
  dischargePort?: string
  originStateCode?: string
  nfeiCategory?: string
  rbiWaiverNumber?: string
  rbiWaiverDate?: string
  sealType?: string
  numberOfContainers?: string
  natureOfCargo: string
  grossWeight?: string
  netWeight?: string
  measurementUnit: string
  totalPackages?: string
  marksAndNumbers?: string
  loosePackets?: string
  mawbNumber?: string
  hawbNumber?: string
  invoices: BillInvoiceForm[]
  containers: ContainerForm[]
  packingRanges: PackingRangeForm[]
  documents: SupportingDocForm[]
  licenses: LicenseForm[]
  exchangeRate?: string
  chaNumber?: string
  chaName?: string
}

export interface SavedBill {
  id: number
  created: string
  updated: string
  values: ShippingBillFormValues
  payload?: ReturnType<typeof toShippingBillPayload>
}

export function emptyItem(): BillItemForm {
  return {
    ritcCode: '',
    goodsDescription1: '',
    quantity: '',
    unitOfMeasurement: 'PCS',
    unitPrice: '',
    lineTotal: '',
    tradeAgreementsCode: 'NCPTI'
  }
}

export function emptyInvoice(): BillInvoiceForm {
  return {
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    currency: 'USD',
    contractType: 'FOB',
    buyerSameAsConsignee: true,
    buyerId: '',
    buyerBranchId: '',
    items: [emptyItem()]
  }
}

export function emptyDocument(): SupportingDocForm {
  return {
    documentTypeCode: '',
    documentReferenceNumber: '',
    documentIssueDate: new Date().toISOString().slice(0, 10)
  }
}

export function emptyBill(): ShippingBillFormValues {
  return {
    jobDate: new Date().toISOString().slice(0, 10),
    exporterId: '',
    exporterBranchId: '',
    consigneeId: '',
    consigneeBranchId: '',
    loadingPort: '',
    finalDestinationPort: '',
    natureOfCargo: 'P',
    measurementUnit: 'KG',
    invoices: [emptyInvoice()],
    containers: [],
    packingRanges: [],
    documents: [],
    licenses: []
  }
}

const countryPrefixRegex = /^[A-Z]{2}/

export function portCountry(code?: string): string {
  if (!code) return ''
  const matchedPort = allPorts.find((port) => port.code === code)
  if (matchedPort) return matchedPort.countryCode
  return countryPrefixRegex.exec(code)?.[0] ?? ''
}

export function lineTotal(item: BillItemForm): number {
  if (item.lineTotal != null && item.lineTotal.trim() !== '') {
    return Number(item.lineTotal)
  }
  const qty = Number(item.quantity)
  const price = Number(item.unitPrice)
  if (Number.isNaN(qty) || Number.isNaN(price)) return 0
  return qty * price
}

export function invoiceTotal(invoice: BillInvoiceForm): number {
  return invoice.items.reduce((sum, item) => sum + lineTotal(item), 0)
}

export function optionalNumber(value?: string | number | null): number | undefined {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value
  }
  if (value != null && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

export function toEpochDays(dateStr?: string): number | undefined {
  if (!dateStr?.trim()) return undefined
  const timestamp = new Date(dateStr).getTime()
  if (Number.isNaN(timestamp)) return undefined
  return Math.floor(timestamp / 86_400_000)
}

function nonEmptyText(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed !== undefined && trimmed !== '' ? trimmed : undefined
}

const ISO_CURRENCY_NUMERIC: Record<string, number | undefined> = {
  USD: 840,
  INR: 356,
  EUR: 978,
  AED: 784,
  GBP: 826,
  SGD: 702
}

function toNumericCurrency(code?: string): number {
  if (!code) return 840
  return ISO_CURRENCY_NUMERIC[code] ?? optionalNumber(code) ?? 840
}

/**
 * Single shared domain normalization for Shipping Bill form values.
 * Both `toShippingBillPayload` (ICEGATE/storage snake_case contract) and
 * `toHttpShippingBillPayload` (HTTP API camelCase contract) derive from this
 * resolved representation so business rules live in one place.
 */
function resolveShippingBillDomain(values: ShippingBillFormValues) {
  const dischargePort = nonEmptyText(values.dischargePort) ?? values.finalDestinationPort
  const numberOfContainers =
    values.containers.length > 0 ? values.containers.length : (optionalNumber(values.numberOfContainers) ?? 0)

  const resolvedInvoices = values.invoices.map((invoice, index) => {
    const buyerId = Number(invoice.buyerSameAsConsignee ? values.consigneeId : invoice.buyerId)
    const buyerBranchId = Number(invoice.buyerSameAsConsignee ? values.consigneeBranchId : invoice.buyerBranchId)
    const freightCurrency = nonEmptyText(invoice.freightCurrency) ?? invoice.currency
    const insuranceCurrency = nonEmptyText(invoice.insuranceCurrency) ?? invoice.currency
    const commissionCurrency = nonEmptyText(invoice.commissionCurrency) ?? invoice.currency
    const discountCurrency = nonEmptyText(invoice.discountCurrency) ?? invoice.currency
    const otherDeductionsCurrency = nonEmptyText(invoice.otherDeductionsCurrency) ?? invoice.currency
    const resolvedInvoiceTotal = optionalNumber(invoice.invoiceTotal) ?? invoiceTotal(invoice)

    const resolvedItems = invoice.items.map((item, itemIndex) => ({
      raw: item,
      serialNumber: itemIndex + 1,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unitOfRate: nonEmptyText(item.unitOfRate) ?? item.unitOfMeasurement,
      resolvedLineTotal: lineTotal(item),
      presentMarketValue: optionalNumber(item.presentMarketValue),
      numberOfUnits: optionalNumber(item.numberOfUnits),
      taxableValue: item.igstPaymentStatus === 'P' ? optionalNumber(item.taxableValue) : undefined,
      igstAmount: item.igstPaymentStatus === 'P' ? optionalNumber(item.igstAmount) : undefined,
      drawbackQuantity: optionalNumber(item.drawbackQuantity),
      rodtep: optionalNumber(item.rodtep),
      cess: optionalNumber(item.cess),
      originDistrictCode: optionalNumber(item.originDistrictCode),
      totalPackage: optionalNumber(item.totalPackage)
    }))

    return {
      raw: invoice,
      serialNumber: index + 1,
      buyerId,
      buyerBranchId,
      thirdPartyId: optionalNumber(invoice.thirdPartyId),
      thirdPartyBranchId: optionalNumber(invoice.thirdPartyBranchId),
      freightRate: optionalNumber(invoice.freightRate),
      freightAmount: optionalNumber(invoice.freightAmount),
      freightCurrency,
      insuranceRate: optionalNumber(invoice.insuranceRate),
      insuranceAmount: optionalNumber(invoice.insuranceAmount),
      insuranceCurrency,
      commissionRate: optionalNumber(invoice.commissionRate),
      commissionAmount: optionalNumber(invoice.commissionAmount),
      commissionCurrency,
      discountRate: optionalNumber(invoice.discountRate),
      discountAmount: optionalNumber(invoice.discountAmount),
      discountCurrency,
      otherDeductionsRate: optionalNumber(invoice.otherDeductionsRate),
      otherDeductionsAmount: optionalNumber(invoice.otherDeductionsAmount),
      otherDeductionsCurrency,
      packingCharges: optionalNumber(invoice.packingCharges),
      periodOfPayment: optionalNumber(invoice.periodOfPayment),
      resolvedInvoiceTotal,
      items: resolvedItems
    }
  })

  return {
    dischargePort,
    numberOfContainers,
    jobNumber: optionalNumber(values.jobNumber),
    originStateCode: optionalNumber(values.originStateCode),
    nfeiCategory: optionalNumber(values.nfeiCategory),
    grossWeight: optionalNumber(values.grossWeight),
    netWeight: optionalNumber(values.netWeight),
    totalPackages: optionalNumber(values.totalPackages),
    loosePackets: optionalNumber(values.loosePackets),
    invoices: resolvedInvoices
  }
}

export function toShippingBillPayload(values: ShippingBillFormValues) {
  const domain = resolveShippingBillDomain(values)

  return {
    shipping_bill: {
      job_number: domain.jobNumber,
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
      discharge_port: domain.dischargePort,
      discharge_country_code: portCountry(domain.dischargePort),
      origin_state_code: domain.originStateCode,
      nfei_category: domain.nfeiCategory,
      rbi_waiver_number: values.rbiWaiverNumber,
      rbi_waiver_date: values.rbiWaiverDate,
      sealtype: values.sealType,
      natureofcargo: values.natureOfCargo,
      grossweight: domain.grossWeight,
      netweight: domain.netWeight,
      measurement_unit: values.measurementUnit,
      total_packages: domain.totalPackages,
      marks_and_numbers: values.marksAndNumbers,
      loose_packets: domain.loosePackets,
      number_of_containers: domain.numberOfContainers,
      mawb_number: values.mawbNumber,
      hawb_number: values.hawbNumber
    },
    invoices: domain.invoices.map((inv) => ({
      serial_number: inv.serialNumber,
      invoicenumber: inv.raw.invoiceNumber,
      date: inv.raw.invoiceDate,
      currency: inv.raw.currency,
      contract_type: inv.raw.contractType,
      buyer: inv.buyerId,
      buyer_address: inv.buyerBranchId,
      third_party: inv.thirdPartyId,
      third_party_address: inv.thirdPartyBranchId,
      freight_rate: inv.freightRate,
      freight_amount: inv.freightAmount,
      freight_currency: inv.freightCurrency,
      insurance_rate: inv.insuranceRate,
      insurance_amount: inv.insuranceAmount,
      insurance_currency: inv.insuranceCurrency,
      commission_rate: inv.commissionRate,
      commission_amount: inv.commissionAmount,
      commission_currency: inv.commissionCurrency,
      discount_rate: inv.discountRate,
      discount_amount: inv.discountAmount,
      discount_currency: inv.discountCurrency,
      other_deductions_rate: inv.otherDeductionsRate,
      other_deductions_amount: inv.otherDeductionsAmount,
      other_deductions_currency: inv.otherDeductionsCurrency,
      packing_charges: inv.packingCharges,
      freight_insaurance_included: inv.raw.freightInsuranceIncluded,
      contract_number: inv.raw.contractNumber,
      nature_of_payment: inv.raw.natureOfPayment,
      period_of_payment: inv.periodOfPayment,
      invoice_total: inv.resolvedInvoiceTotal,
      items: inv.items.map((item) => ({
        item_serial_number: item.serialNumber,
        ritc_code: item.raw.ritcCode,
        goods_description_1: item.raw.goodsDescription1,
        goods_description_2: item.raw.goodsDescription2,
        goods_description_3: item.raw.goodsDescription3,
        accessories_description: item.raw.accessoriesDescription,
        scheme_code: item.raw.schemeCode,
        quantity: item.quantity,
        unit_of_measurement: item.raw.unitOfMeasurement,
        unit_price: item.unitPrice,
        unit_of_rate: item.unitOfRate,
        line_total: item.resolvedLineTotal,
        present_market_value: item.presentMarketValue,
        no_of_units: item.numberOfUnits,
        accessory_status: item.raw.accessoryStatus,
        third_party: item.raw.thirdPartyItem,
        igst_payment_status: item.raw.igstPaymentStatus,
        taxable_value: item.taxableValue,
        igst_amount: item.igstAmount,
        drawback_serial_number: item.raw.drawbackSerialNumber,
        drawback_quantity: item.drawbackQuantity,
        rodtep: item.rodtep,
        cess: item.cess,
        origin_district_code: item.originDistrictCode,
        trade_agreements_code: item.raw.tradeAgreementsCode,
        end_use_of_item: item.raw.endUseOfItem,
        total_package: item.totalPackage,
        reward_item: item.raw.rewardItem
      }))
    })),
    invoice_item_third_parties: domain.invoices.flatMap((inv) =>
      inv.items.flatMap((item) =>
        item.raw.thirdPartyItem && item.raw.itemThirdPartyId
          ? [
              {
                invoice_serial_number: inv.serialNumber,
                item_serial_number: item.serialNumber,
                third_party: Number(item.raw.itemThirdPartyId),
                third_party_address: optionalNumber(item.raw.itemThirdPartyBranchId)
              }
            ]
          : []
      )
    ),
    ar4_details: domain.invoices.flatMap((inv) =>
      inv.items.flatMap((item) =>
        item.raw.ar4Number
          ? [
              {
                invoice_serial_number: inv.serialNumber,
                item_serial_number: item.serialNumber,
                ar4_number: item.raw.ar4Number,
                ar4_date: item.raw.ar4Date,
                commissionerate: item.raw.ar4Commissionerate,
                division: item.raw.ar4Division,
                range: item.raw.ar4Range,
                remarks: item.raw.ar4Remarks
              }
            ]
          : []
      )
    ),
    container_details: values.containers.map((container) => ({
      container_number: container.containerNumber,
      container_size: optionalNumber(container.containerSize),
      excise_seal_number: container.exciseSealNumber,
      seal_date: container.sealDate,
      seal_type: container.sealType,
      seal_device_id: container.sealDeviceId,
      movement_document_type: container.movementDocumentType,
      movement_document_number: container.movementDocumentNumber
    })),
    packging_list: values.packingRanges.map((range) => ({
      packing_number_from: optionalNumber(range.packingNumberFrom),
      packing_number_to: optionalNumber(range.packingNumberTo),
      packing_code: range.packingCode
    })),
    supporting_docs: values.documents.map((document, index) => ({
      serial_number: index + 1,
      invoice_serial_number: optionalNumber(document.invoiceSerialNumber),
      item_serial_number: optionalNumber(document.itemSerialNumber),
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
      invoice_serial_number: optionalNumber(license.invoiceSerialNumber),
      item_serial_number: optionalNumber(license.itemSerialNumber),
      licence_serial_number: optionalNumber(license.licenseSerialNumber),
      item_serial_number_part_e: license.itemSerialNumberPartE,
      item_serial_number_part_c: license.itemSerialNumberPartC,
      quantity: optionalNumber(license.licenseQuantity),
      export_quantity: optionalNumber(license.licenseExportQuantity),
      indigenous_or_imported: license.indigenousOrImported
    }))
  }
}

export function toHttpShippingBillPayload(values: ShippingBillFormValues) {
  const domain = resolveShippingBillDomain(values)
  const fallbackEpochDate = Math.floor(Date.now() / 86_400_000)

  return {
    chaId: 1000,
    jobDate: toEpochDays(values.jobDate) ?? fallbackEpochDate,
    exporterId: optionalNumber(values.exporterId),
    exporterBranchId: optionalNumber(values.exporterBranchId),
    consigneeId: optionalNumber(values.consigneeId),
    consigneeAddressId: optionalNumber(values.consigneeBranchId),
    originStateCode: domain.originStateCode,
    loadingPort: values.loadingPort,
    finalDestinationPort: values.finalDestinationPort,
    dischargePort: domain.dischargePort,
    sealType: optionalNumber(values.sealType),
    natureOfCargo: optionalNumber(values.natureOfCargo),
    grossWeight: domain.grossWeight,
    netWeight: domain.netWeight,
    measurementUnit: values.measurementUnit === 'KG' ? 'KGS' : values.measurementUnit,
    totalPackages: domain.totalPackages,
    marksAndNumbers: values.marksAndNumbers,
    loosePackets: domain.loosePackets,
    numberOfContainers: domain.numberOfContainers,
    invoices: domain.invoices.map((inv) => ({
      serialNumber: inv.serialNumber,
      invoiceNumber: inv.raw.invoiceNumber,
      date: toEpochDays(inv.raw.invoiceDate) ?? fallbackEpochDate,
      currency: toNumericCurrency(inv.raw.currency),
      contractType: optionalNumber(inv.raw.contractType),
      buyerId: Number.isNaN(inv.buyerId) ? undefined : inv.buyerId,
      buyerAddressId: Number.isNaN(inv.buyerBranchId) ? undefined : inv.buyerBranchId,
      freightCurrency: toNumericCurrency(inv.freightCurrency),
      freightAmount: inv.freightAmount ?? 0,
      insuranceCurrency: toNumericCurrency(inv.insuranceCurrency),
      insuranceAmount: inv.insuranceAmount ?? 0,
      commissionCurrency: toNumericCurrency(inv.commissionCurrency),
      commissionAmount: inv.commissionAmount ?? 0,
      discountCurrency: toNumericCurrency(inv.discountCurrency),
      discountAmount: inv.discountAmount ?? 0,
      otherDeductionsCurrency: toNumericCurrency(inv.otherDeductionsCurrency),
      otherDeductionsAmount: inv.otherDeductionsAmount ?? 0,
      freightInsauranceIncluded: optionalNumber(inv.raw.freightInsuranceIncluded),
      packingCharges: inv.packingCharges ?? 0,
      natureOfPayment: optionalNumber(inv.raw.natureOfPayment),
      periodOfPayment: inv.periodOfPayment,
      items: inv.items.map((item) => ({
        itemSerialNumber: item.serialNumber,
        schemeCode: item.raw.schemeCode,
        ritcCode: item.raw.ritcCode,
        goodsDescription: item.raw.goodsDescription1,
        unitOfMeasurement: item.raw.unitOfMeasurement,
        quantity: Number.isNaN(item.quantity) ? undefined : item.quantity,
        unitPrice: Number.isNaN(item.unitPrice) ? undefined : item.unitPrice,
        unitOfRate: item.unitOfRate,
        noOfUnits: item.numberOfUnits ?? 1,
        presentMarketValue: item.presentMarketValue,
        thirdParty: Boolean(item.raw.thirdPartyItem),
        rewardItem: Boolean(item.raw.rewardItem),
        totalPackage: item.totalPackage,
        endUseOfItem: item.raw.endUseOfItem,
        igstPaymentStatus: optionalNumber(item.raw.igstPaymentStatus),
        originDistrictCode: item.originDistrictCode,
        tradeAgreementsCode: item.raw.tradeAgreementsCode,
        drawbackSerialNumber: item.raw.drawbackSerialNumber,
        drawbackQuantity: item.drawbackQuantity
      }))
    })),
    packgingList: values.packingRanges.map((range) => ({
      packingNumberFrom: optionalNumber(range.packingNumberFrom),
      packingNumberTo: optionalNumber(range.packingNumberTo),
      packingCode: range.packingCode
    })),
    documents: values.documents.map((doc, docIdx) => ({
      invoiceSerialNumber: optionalNumber(doc.invoiceSerialNumber) ?? 1,
      itemSerialNumber: optionalNumber(doc.itemSerialNumber) ?? 1,
      serialNumber: docIdx + 1,
      imageReferenceNumber: doc.imageReferenceNumber,
      documentTypeCode: doc.documentTypeCode,
      documentIssueDate: toEpochDays(doc.documentIssueDate) ?? fallbackEpochDate,
      useDefault: true,
      fileType: optionalNumber(doc.fileType) ?? 1
    }))
  }
}
