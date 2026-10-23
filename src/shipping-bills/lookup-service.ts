import { documentCodes } from '@/data/e-sanchit-codes'
import { quantityCodes } from '@/data/quantity-code'
import schemeCodes, { SchemeCodeOption } from '@/data/scheme-codes'
import { stateOptions } from '@/data/states'
import { Trades } from '@/data/trade-agrements'
import { cargoOptions, contractTypes, paymentTypes, priceInclusionTypes, sealTypes, weightUnits } from '@/data/types'
import { getMarksAndNumbersOptions, MarksAndNumbersOption } from './marks-and-numbers-source'
import { allPorts, countries } from './model'

export interface LookupSelectOption {
  value: string | number
  label: string
}

export interface ShippingBillLookups {
  currencies: LookupSelectOption[]
  contractTypes: LookupSelectOption[]
  cargoOptions: LookupSelectOption[]
  weightUnits: LookupSelectOption[]
  sealTypes: LookupSelectOption[]
  paymentTypes: LookupSelectOption[]
  priceInclusionTypes: LookupSelectOption[]
  stateOptions: LookupSelectOption[]
  quantityCodes: LookupSelectOption[]
  schemeCodes: SchemeCodeOption[]
  tradeAgreements: LookupSelectOption[]
  portOptions: LookupSelectOption[]
  countries: LookupSelectOption[]
  nfeiCategories: LookupSelectOption[]
  igstPaymentStatuses: LookupSelectOption[]
  accessoryStatuses: LookupSelectOption[]
  containerSizes: LookupSelectOption[]
  containerSealTypes: LookupSelectOption[]
  licenseGoodsSources: LookupSelectOption[]
  exporterClasses: LookupSelectOption[]
  exporterTypes: LookupSelectOption[]
}

const LOOKUP_DELAY_MS = 150

function delay<T>(value: T, ms = LOOKUP_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

const currencyOptions: LookupSelectOption[] = ['USD', 'EUR', 'INR', 'AED', 'GBP', 'SGD'].map((value) => ({
  value,
  label: value
}))

const nfeiCategories: LookupSelectOption[] = [
  { value: '01', label: 'Free trade sample' },
  { value: '02', label: 'Diplomatic goods' },
  { value: '03', label: 'Warranty replacement' },
  { value: '07', label: 'Gift parcel' },
  { value: '08', label: 'Other' }
]

const igstPaymentStatuses: LookupSelectOption[] = [
  { value: 'NA', label: 'Not applicable' },
  { value: 'LUT', label: 'Under LUT / bond' },
  { value: 'P', label: 'Against payment' }
]

const accessoryStatuses: LookupSelectOption[] = [
  { value: '0', label: 'No accessory' },
  { value: '1', label: 'Included free of cost' },
  { value: '2', label: 'Entered separately' }
]

const containerSizes: LookupSelectOption[] = [
  { value: '20', label: '20 ft' },
  { value: '40', label: '40 ft' },
  { value: '45', label: '45 ft' }
]

const containerSealTypes: LookupSelectOption[] = [
  { value: 1, label: 'BTSL - Bottle Seal' },
  { value: 2, label: 'ESEAL - Electronic Seal' },
  { value: 3, label: 'RFID - Radio Frequency Identifier' }
]

const licenseGoodsSources: LookupSelectOption[] = [
  { value: 'I', label: 'Imported' },
  { value: 'D', label: 'Indigenous' }
]

const exporterClasses: LookupSelectOption[] = [
  { value: 'F', label: 'Manufacturer' },
  { value: 'R', label: 'Merchant' },
  { value: 'C', label: 'Merchant courier' },
  { value: 'D', label: 'Manufacturer courier' }
]

const exporterTypes: LookupSelectOption[] = [
  { value: 'P', label: 'Private' },
  { value: 'G', label: 'Government' },
  { value: 'W', label: 'Warehouse' }
]

const documentFileTypes = [{ value: 'pdf', label: 'PDF' }]

function buildShippingBillLookups(): ShippingBillLookups {
  return {
    currencies: currencyOptions,
    contractTypes,
    cargoOptions,
    weightUnits,
    sealTypes,
    paymentTypes,
    priceInclusionTypes,
    stateOptions,
    quantityCodes,
    schemeCodes,
    tradeAgreements: Trades,
    portOptions: allPorts.map((port) => ({ value: port.code, label: `${port.name} · ${port.code}` })),
    countries,
    nfeiCategories,
    igstPaymentStatuses,
    accessoryStatuses,
    containerSizes,
    containerSealTypes,
    licenseGoodsSources,
    exporterClasses,
    exporterTypes
  }
}

export const defaultShippingBillLookups: ShippingBillLookups = buildShippingBillLookups()

export const lookupService = {
  async getFormLookups(): Promise<ShippingBillLookups> {
    return delay(buildShippingBillLookups())
  },

  async getCountries(): Promise<LookupSelectOption[]> {
    return delay(countries, 100)
  },

  async searchDocumentCodes(query: string): Promise<{ value: string; label: string }[]> {
    const q = query.trim().toLowerCase()
    const filtered = documentCodes.filter(
      (doc) => doc.label.toLowerCase().includes(q) || doc.value.toLowerCase().includes(q)
    )
    return delay(filtered, 140)
  },

  async getDocumentCodeLabel(code: string): Promise<string> {
    const found = documentCodes.find((doc) => doc.value === code || doc.label === code)
    return delay(found ? found.label : code, 80)
  },

  async searchDocumentFileTypes(query: string): Promise<{ value: string; label: string }[]> {
    const q = query.trim().toLowerCase()
    const filtered = documentFileTypes.filter(
      (doc) => doc.label.toLowerCase().includes(q) || doc.value.toLowerCase().includes(q)
    )
    return delay(filtered, 100)
  },

  async getDocumentFileTypeLabel(value: string): Promise<string> {
    const found = documentFileTypes.find((doc) => doc.value === value || doc.label === value)
    return delay(found ? found.label : value, 80)
  },

  async getMarksAndNumbers(exporterId: string): Promise<MarksAndNumbersOption[]> {
    if (!exporterId) return []
    return getMarksAndNumbersOptions(exporterId)
  }
}
