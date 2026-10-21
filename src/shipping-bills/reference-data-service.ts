import { documentCodes } from '@/data/e-sanchit-codes'
import { quantityCodes } from '@/data/quantity-code'
import schemeCodes from '@/data/scheme-codes'
import { stateOptions } from '@/data/states'
import { Trades } from '@/data/trade-agreements'
import {
  accessoryStatuses,
  cargoOptions,
  containerSealTypes,
  containerSizes,
  contractTypes,
  currencies,
  exporterClasses,
  exporterTypes,
  fileTypes,
  goodsSources,
  igstPaymentStatuses,
  nfeiCategories,
  paymentTypes,
  priceInclusionTypes,
  sealTypes,
  weightUnits
} from '@/data/types'
import { useQuery } from 'core/react-query'
import { getMarksAndNumbersOptions, MarksAndNumbersOption } from './marks-and-numbers-source'
import { delay } from './mock-network'
import { countries, ports } from './model'

/**
 * Async mock service for dropdown/reference data. UI code must fetch option lists
 * through these functions (never import the static lists directly) so the data
 * source can later be swapped for a real API without touching the components.
 * Static source data lives in `src/data/*`; nothing is duplicated here.
 */

const portOptions = ports.map((port) => ({ value: port.code, label: `${port.name} · ${port.code}` }))

export interface ReferenceData {
  currencies: typeof currencies
  portOptions: typeof portOptions
  countries: typeof countries
  exporterClasses: typeof exporterClasses
  exporterTypes: typeof exporterTypes
  schemeCodes: typeof schemeCodes
  quantityCodes: typeof quantityCodes
  stateOptions: typeof stateOptions
  documentCodes: typeof documentCodes
  tradeAgreements: typeof Trades
  sealTypes: typeof sealTypes
  contractTypes: typeof contractTypes
  paymentTypes: typeof paymentTypes
  priceInclusionTypes: typeof priceInclusionTypes
  cargoOptions: typeof cargoOptions
  weightUnits: typeof weightUnits
  nfeiCategories: typeof nfeiCategories
  containerSizes: typeof containerSizes
  containerSealTypes: typeof containerSealTypes
  igstPaymentStatuses: typeof igstPaymentStatuses
  accessoryStatuses: typeof accessoryStatuses
  goodsSources: typeof goodsSources
  fileTypes: typeof fileTypes
}

export const referenceDataService = {
  getCurrencies: () => delay(currencies),
  getSchemeCodes: () => delay(schemeCodes),
  getQuantityCodes: () => delay(quantityCodes),
  getStateOptions: () => delay(stateOptions),
  getDocumentCodes: () => delay(documentCodes),
  getTradeAgreements: () => delay(Trades),
  getSealTypes: () => delay(sealTypes),
  getContractTypes: () => delay(contractTypes),
  getPaymentTypes: () => delay(paymentTypes),
  getPriceInclusionTypes: () => delay(priceInclusionTypes),
  getCargoOptions: () => delay(cargoOptions),
  getWeightUnits: () => delay(weightUnits),
  getNfeiCategories: () => delay(nfeiCategories),
  getContainerSizes: () => delay(containerSizes),
  getContainerSealTypes: () => delay(containerSealTypes),
  getIgstPaymentStatuses: () => delay(igstPaymentStatuses),
  getAccessoryStatuses: () => delay(accessoryStatuses),
  getGoodsSources: () => delay(goodsSources),
  getFileTypes: () => delay(fileTypes),
  getPortOptions: () => delay(portOptions),
  getCountries: () => delay(countries),
  getExporterClasses: () => delay(exporterClasses),
  getExporterTypes: () => delay(exporterTypes),

  /** Marks and numbers presets for an exporter (see marks-and-numbers-source.ts). */
  getMarksAndNumbersOptions(exporterId: string): Promise<MarksAndNumbersOption[]> {
    return getMarksAndNumbersOptions(exporterId).then((options) => delay(options))
  },

  /** Loads every option list in one call; the granular functions above stay available for selective use. */
  async getAll(): Promise<ReferenceData> {
    const [
      currencyList,
      schemeList,
      quantityList,
      stateList,
      documentList,
      tradeList,
      sealList,
      contractList,
      paymentList,
      priceList,
      cargoList,
      weightList,
      nfeiList,
      containerSizeList,
      containerSealList,
      igstList,
      accessoryList,
      goodsSourceList,
      fileTypeList,
      portList,
      countryList,
      exporterClassList,
      exporterTypeList
    ] = await Promise.all([
      referenceDataService.getCurrencies(),
      referenceDataService.getSchemeCodes(),
      referenceDataService.getQuantityCodes(),
      referenceDataService.getStateOptions(),
      referenceDataService.getDocumentCodes(),
      referenceDataService.getTradeAgreements(),
      referenceDataService.getSealTypes(),
      referenceDataService.getContractTypes(),
      referenceDataService.getPaymentTypes(),
      referenceDataService.getPriceInclusionTypes(),
      referenceDataService.getCargoOptions(),
      referenceDataService.getWeightUnits(),
      referenceDataService.getNfeiCategories(),
      referenceDataService.getContainerSizes(),
      referenceDataService.getContainerSealTypes(),
      referenceDataService.getIgstPaymentStatuses(),
      referenceDataService.getAccessoryStatuses(),
      referenceDataService.getGoodsSources(),
      referenceDataService.getFileTypes(),
      referenceDataService.getPortOptions(),
      referenceDataService.getCountries(),
      referenceDataService.getExporterClasses(),
      referenceDataService.getExporterTypes()
    ])
    return {
      currencies: currencyList,
      portOptions: portList,
      countries: countryList,
      exporterClasses: exporterClassList,
      exporterTypes: exporterTypeList,
      schemeCodes: schemeList,
      quantityCodes: quantityList,
      stateOptions: stateList,
      documentCodes: documentList,
      tradeAgreements: tradeList,
      sealTypes: sealList,
      contractTypes: contractList,
      paymentTypes: paymentList,
      priceInclusionTypes: priceList,
      cargoOptions: cargoList,
      weightUnits: weightList,
      nfeiCategories: nfeiList,
      containerSizes: containerSizeList,
      containerSealTypes: containerSealList,
      igstPaymentStatuses: igstList,
      accessoryStatuses: accessoryList,
      goodsSources: goodsSourceList,
      fileTypes: fileTypeList
    }
  }
}

/** Loads all dropdown option lists once per app session (React Query caches the result). */
export function useReferenceData(): ReferenceData | undefined {
  return useQuery({
    queryKey: ['reference-data'],
    queryFn: () => referenceDataService.getAll()
  }).data
}
