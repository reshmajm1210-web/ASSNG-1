/**
 * Port master data.
 *
 * Ports are reference data, so they live in `src/data` and are served to the UI
 * by `reference-data-service.ts` (see `referenceDataService.searchLoadingPorts`,
 * `searchDestinationPorts` and `getPortByCode`).
 */

export interface PortOption {
  code: string
  name: string
  countryCode: string
}

/** Ports of loading. Indian ports only, because an export starts in India. */
export const loadingPorts: PortOption[] = [
  { code: 'INNSA1', name: 'Nhava Sheva', countryCode: 'IN' },
  { code: 'INMUN1', name: 'Mundra', countryCode: 'IN' },
  { code: 'INMAA1', name: 'Chennai', countryCode: 'IN' },
  { code: 'INBOM4', name: 'Mumbai Air Cargo', countryCode: 'IN' }
]

/** Ports of final destination / discharge. */
export const ports: PortOption[] = [
  { code: 'USMSY', name: 'New Orleans', countryCode: 'US' },
  { code: 'USLAX', name: 'Los Angeles', countryCode: 'US' },
  { code: 'DEHAM', name: 'Hamburg', countryCode: 'DE' },
  { code: 'AEJEA', name: 'Jebel Ali', countryCode: 'AE' },
  { code: 'SGSIN', name: 'Singapore', countryCode: 'SG' }
]
