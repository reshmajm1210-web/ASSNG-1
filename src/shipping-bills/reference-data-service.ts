/**
 * Reference data service — ports, currencies, scheme codes, UQC, states,
 * e-Sanchit document codes, trade agreements and the other dropdown masters.
 *
 * The raw arrays stay in `src/data/*` (they are content, not logic). Components
 * never import them: they call this service, which returns Promises so the UI is
 * already written for a real API (`GET /api/master/...`).
 */

import { documentCodes } from '@/data/e-sanchit-codes'
import { loadingPorts, ports, type PortOption } from '@/data/ports'
import { quantityCodes } from '@/data/quantity-code'
import schemeCodes from '@/data/scheme-codes'
import { stateOptions } from '@/data/states'
import { Trades } from '@/data/trade-agrements'
import {
  cargoOptions,
  contractTypes,
  countries,
  paymentTypes,
  priceInclusionTypes,
  sealTypes,
  weightUnits
} from '@/data/types'
import type { SelectOption } from 'ui/inputs/select'
import { getMarksAndNumbersOptions, type MarksAndNumbersOption } from './marks-and-numbers-source'
import { LOOKUP_LATENCY_MS, mockDelay } from './mock-network'

/** A scheme code also tells the form whether drawback/RODTEP/ROSCTL apply. */
export interface SchemeCodeOption extends SelectOption {
  drawback: boolean
  RODTEP: boolean
  ROSCTL: boolean
}

/** Everything the shipping bill form needs to render its dropdowns. */
export interface ReferenceData {
  loadingPorts: PortOption[]
  ports: PortOption[]
  currencies: SelectOption[]
  schemes: SchemeCodeOption[]
  quantityCodes: SelectOption[]
  states: SelectOption[]
  documentCodes: SelectOption[]
  tradeAgreements: SelectOption[]
  cargoOptions: SelectOption[]
  contractTypes: SelectOption[]
  paymentTypes: SelectOption[]
  priceInclusionOptions: SelectOption[]
  sealTypes: SelectOption[]
  weightUnits: SelectOption[]
  countries: SelectOption[]
}

const CURRENCIES: SelectOption[] = ['USD', 'EUR', 'INR', 'AED', 'GBP', 'SGD'].map((code) => ({
  value: code,
  label: code
}))

/** File types accepted by e-Sanchit uploads. */
const FILE_TYPES: SelectOption[] = [{ value: 'pdf', label: 'PDF' }]

/** Options shown while the async reference data is still loading. */
export function emptyReferenceData(): ReferenceData {
  return {
    loadingPorts: [],
    ports: [],
    currencies: [],
    schemes: [],
    quantityCodes: [],
    states: [],
    documentCodes: [],
    tradeAgreements: [],
    cargoOptions: [],
    contractTypes: [],
    paymentTypes: [],
    priceInclusionOptions: [],
    sealTypes: [],
    weightUnits: [],
    countries: []
  }
}

function includesQuery(label: string, value: string | number, query: string): boolean {
  return label.toLowerCase().includes(query) || String(value).toLowerCase().includes(query)
}

function searchPorts(source: PortOption[], query: string): PortOption[] {
  const trimmed = query.trim().toLowerCase()
  return source.filter((port) => includesQuery(port.name, port.code, trimmed))
}

/** Ports of loading (Indian ports only). */
export function listLoadingPorts(): Promise<PortOption[]> {
  return mockDelay(loadingPorts)
}

/** Search the port-of-loading dropdown. */
export function searchLoadingPorts(query: string): Promise<PortOption[]> {
  return mockDelay(searchPorts(loadingPorts, query))
}

/** Ports of final destination. */
export function listDestinationPorts(): Promise<PortOption[]> {
  return mockDelay(ports)
}

/** Search the final-destination dropdown. */
export function searchDestinationPorts(query: string): Promise<PortOption[]> {
  return mockDelay(searchPorts(ports, query))
}

/** Resolve a port code to its record (used for the selected label). */
export function getPortByCode(code: string): Promise<PortOption | undefined> {
  return mockDelay(
    ports.find((port) => port.code === code),
    LOOKUP_LATENCY_MS
  )
}

/** Search the e-Sanchit document type dropdown. */
export function searchDocumentCodes(query: string): Promise<SelectOption[]> {
  const trimmed = query.trim().toLowerCase()
  return mockDelay(documentCodes.filter((document) => includesQuery(document.label, document.value, trimmed)))
}

/** Search the file type dropdown. */
export function searchFileTypes(query: string): Promise<SelectOption[]> {
  const trimmed = query.trim().toLowerCase()
  return mockDelay(FILE_TYPES.filter((fileType) => includesQuery(fileType.label, fileType.value, trimmed)))
}

/** Marks and numbers suggestions for an exporter. */
export function getMarksAndNumbers(exporterId: string): Promise<MarksAndNumbersOption[]> {
  return getMarksAndNumbersOptions(exporterId)
}

/** Every dropdown list in one round trip. */
export async function loadReferenceData(): Promise<ReferenceData> {
  const data: ReferenceData = {
    loadingPorts,
    ports,
    currencies: CURRENCIES,
    schemes: schemeCodes,
    quantityCodes,
    states: stateOptions,
    documentCodes,
    tradeAgreements: Trades,
    cargoOptions,
    contractTypes,
    paymentTypes,
    priceInclusionOptions: priceInclusionTypes,
    sealTypes,
    weightUnits,
    countries
  }
  return await mockDelay(data)
}

/**
 * The interface the UI depends on; swap for HTTP endpoints later.
 */
export const referenceDataService = {
  loadReferenceData,
  listLoadingPorts,
  searchLoadingPorts,
  listDestinationPorts,
  searchDestinationPorts,
  getPortByCode,
  searchDocumentCodes,
  searchFileTypes,
  getMarksAndNumbers,
  currencies: CURRENCIES,
  fileTypes: FILE_TYPES
}
