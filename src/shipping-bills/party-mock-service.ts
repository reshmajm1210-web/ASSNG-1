/**
 * Party service (exporters, consignees/businesses and their branches).
 *
 * Async, Promise-based, and the only module the UI talks to for party data.
 * Reads come from the demo store snapshot; writes go through the store's
 * `save*` functions. Ports are reference data and live in
 * `reference-data-service.ts`.
 */

import { getStoreSnapshot, saveBusiness, saveExporter, saveBranch as storeSaveBranch } from './demo-store'
import { LOOKUP_LATENCY_MS, MOCK_LATENCY_MS, MockServiceError, mockDelay } from './mock-network'
import type { Branch, Business, Exporter } from './model'

/** Fields accepted when creating/updating an exporter. */
export type ExporterInput = Omit<Exporter, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }

/** Fields accepted when creating/updating a business (consignee / buyer / third party). */
export type BusinessInput = Omit<Business, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }

/** Fields accepted when creating/updating a branch. */
export type BranchInput = Omit<Branch, 'id'> & { id?: number }

/** Branch owner kind. */
export type PartyKind = 'exporter' | 'business'

function includesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query)
}

function branchesOf(kind: PartyKind, ownerId: string): Branch[] {
  const snapshot = getStoreSnapshot()
  const owner =
    kind === 'exporter'
      ? snapshot.exporters.find((item) => String(item.id) === ownerId)
      : snapshot.businesses.find((item) => String(item.id) === ownerId)
  return owner?.branches ?? []
}

/** Search exporters by name or IEC code. Disabled exporters are never offered. */
export function searchExporters(query: string): Promise<Exporter[]> {
  const trimmed = query.trim().toLowerCase()
  const matches = getStoreSnapshot().exporters.filter(
    (item) => !item.disabled && (includesQuery(item.name, trimmed) || includesQuery(item.iec, trimmed))
  )
  return mockDelay(matches)
}

/** Every selectable exporter (used for dropdowns that need the full list). */
export function listExporters(): Promise<Exporter[]> {
  return mockDelay(getStoreSnapshot().exporters.filter((item) => !item.disabled))
}

/** Branches of one exporter, filtered by name or city. */
export function searchExporterBranches(exporterId: string, query: string): Promise<Branch[]> {
  if (exporterId === '') return mockDelay([])
  const trimmed = query.trim().toLowerCase()
  const matches = branchesOf('exporter', exporterId).filter(
    (branch) => includesQuery(branch.branchName, trimmed) || includesQuery(branch.city, trimmed)
  )
  return mockDelay(matches)
}

/** Search consignees by name. */
export function searchConsignees(query: string): Promise<Business[]> {
  const trimmed = query.trim().toLowerCase()
  const matches = getStoreSnapshot().businesses.filter((item) => item.isConsignee && includesQuery(item.name, trimmed))
  return mockDelay(matches)
}

/** Every business record (consignee / buyer / third party / notify). */
export function listBusinesses(): Promise<Business[]> {
  return mockDelay(getStoreSnapshot().businesses)
}

/** Branches of one business, filtered by name or city. */
export function searchConsigneeBranches(consigneeId: string, query: string): Promise<Branch[]> {
  if (consigneeId === '') return mockDelay([])
  const trimmed = query.trim().toLowerCase()
  const matches = branchesOf('business', consigneeId).filter(
    (branch) => includesQuery(branch.branchName, trimmed) || includesQuery(branch.city, trimmed)
  )
  return mockDelay(matches)
}

/** Resolve an exporter by id (used to render the selected label). */
export function getExporterById(exporterId: string): Promise<Exporter | undefined> {
  return mockDelay(
    getStoreSnapshot().exporters.find((item) => String(item.id) === exporterId),
    LOOKUP_LATENCY_MS
  )
}

/** Resolve a business by id (used to render the selected label). */
export function getConsigneeById(consigneeId: string): Promise<Business | undefined> {
  return mockDelay(
    getStoreSnapshot().businesses.find((item) => String(item.id) === consigneeId),
    LOOKUP_LATENCY_MS
  )
}

/** All branches of a party (used to keep the selected branch valid). */
export function getBranches(kind: PartyKind, ownerId: string): Promise<Branch[]> {
  return mockDelay(branchesOf(kind, ownerId), LOOKUP_LATENCY_MS)
}

/** Resolve one branch, so a label can be shown for a saved value. */
export function getBranchById(kind: PartyKind, ownerId: string, branchId: string): Promise<Branch | undefined> {
  return mockDelay(
    branchesOf(kind, ownerId).find((branch) => String(branch.id) === branchId),
    LOOKUP_LATENCY_MS
  )
}

/** Create or update an exporter. */
export async function saveExporterRecord(input: ExporterInput): Promise<Exporter> {
  await mockDelay(null)
  try {
    return saveExporter(input)
  } catch (error) {
    throw new MockServiceError(`The exporter could not be saved: ${describe(error)}`)
  }
}

/** Create or update a business. */
export async function saveBusinessRecord(input: BusinessInput): Promise<Business> {
  await mockDelay(null)
  try {
    return saveBusiness(input)
  } catch (error) {
    throw new MockServiceError(`The business could not be saved: ${describe(error)}`)
  }
}

/** Create or update a branch of an exporter or business. */
export async function saveBranchRecord(kind: PartyKind, ownerId: number, input: BranchInput): Promise<Branch> {
  await mockDelay(null)
  try {
    return storeSaveBranch(kind, ownerId, input)
  } catch (error) {
    throw new MockServiceError(`The branch could not be saved: ${describe(error)}`)
  }
}

/** Uniform error text for the mock services. */
function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * The interface the UI depends on; swap this object for an HTTP client later.
 */
export const partyMockService = {
  searchExporters,
  listExporters,
  searchExporterBranches,
  searchConsignees,
  listBusinesses,
  searchConsigneeBranches,
  getExporterById,
  getConsigneeById,
  getBranches,
  getBranchById,
  saveExporter: saveExporterRecord,
  saveBusiness: saveBusinessRecord,
  saveBranch: saveBranchRecord
}

export type PartyService = typeof partyMockService

/** Latency used by party searches (kept exported for tests/documentation). */
export const PARTY_SEARCH_LATENCY_MS = MOCK_LATENCY_MS
