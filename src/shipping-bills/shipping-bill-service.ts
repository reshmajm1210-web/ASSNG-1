/**
 * Shipping bill service — the only way the UI reads or writes shipping bills.
 *
 * Architecture:
 *
 *   UI component  →  shippingBillService (async, returns Promises)
 *                        ↓
 *                   demo store (localStorage)  +  read-only demo fixtures
 *
 * There is no backend in this assignment. Every function still returns a Promise
 * and every failure is reported by throwing, so the UI already handles loading
 * and error states exactly as it would with a real HTTP API. To go live, replace
 * the bodies below with `fetch(...)` calls (the request/response contract for
 * `POST /api/shipping-bills` is defined by `toHttpShippingBillPayload`).
 */

import { demoShippingBillRecords } from '@/data/demo-shipping-bills'
import { getStoreSnapshot, saveBill } from './demo-store'
import { MockServiceError, mockDelay, mockFailure } from './mock-network'
import type { SavedBill, ShippingBillFormValues } from './model'
import type { HttpShippingBillPayload } from './shipping-bill-payload'
import {
  demoRecordToSavedBill,
  generateFlatFileContent,
  toHttpShippingBillPayload,
  triggerBlobDownload
} from './shipping-bill-payload'

/** Read-only demo records that make the dashboard look populated on first run. */
const demoBills: SavedBill[] = demoShippingBillRecords.map(demoRecordToSavedBill)

function byMostRecentlyUpdated(first: SavedBill, second: SavedBill): number {
  const firstTime = new Date(first.updated).getTime()
  const secondTime = new Date(second.updated).getTime()
  return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
}

/**
 * Bills the user saved win over the demo fixtures with the same id, so demo data
 * can never overwrite real edits.
 */
function mergedBills(): SavedBill[] {
  const storedBills = getStoreSnapshot().bills
  const storedIds = new Set(storedBills.map((bill) => bill.id))
  const fixtures = demoBills.filter((bill) => !storedIds.has(bill.id))
  return [...storedBills, ...fixtures].sort(byMostRecentlyUpdated)
}

function findBill(id: string | number): SavedBill | undefined {
  return mergedBills().find((bill) => String(bill.id) === String(id))
}

/** List every shipping bill, newest first. */
export async function listShippingBills(): Promise<SavedBill[]> {
  return await mockDelay(mergedBills())
}

/** Load one shipping bill. Throws {@link MockServiceError} when it does not exist. */
export async function getShippingBill(id: string | number): Promise<SavedBill> {
  const bill = findBill(id)
  if (!bill) return await mockFailure(`Shipping bill #${id} was not found`)
  return await mockDelay(bill)
}

/**
 * Insert or update a bill. `id` is omitted for a new bill.
 * The store keeps the original `created` timestamp on updates.
 */
export async function saveShippingBill(values: ShippingBillFormValues, id?: number): Promise<SavedBill> {
  await mockDelay(null)
  try {
    return saveBill(values, id)
  } catch (error) {
    throw new MockServiceError(
      `The shipping bill could not be saved: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/** Create a brand-new shipping bill. */
export async function createShippingBill(values: ShippingBillFormValues): Promise<SavedBill> {
  return await saveShippingBill(values)
}

/** Update an existing shipping bill. */
export async function updateShippingBill(id: number, values: ShippingBillFormValues): Promise<SavedBill> {
  return await saveShippingBill(values, id)
}

/** Build the flat file text for a bill (ICEGATE `^` separated records). */
export async function getFlatFile(id: string | number): Promise<string> {
  const bill = findBill(id)
  if (!bill) return await mockFailure(`Flat file is not available: shipping bill #${id} was not found`)
  return await mockDelay(generateFlatFileContent(bill))
}

/**
 * Generate the `.sb` flat file in the browser and hand it to the user as a
 * download. Previously this tried a LAN server first; there is no backend here,
 * so the file is always produced locally from the bill data.
 */
export async function downloadFlatFile(
  id: string | number,
  billData?: SavedBill
): Promise<{ source: 'local'; filename: string }> {
  const bill = billData ?? findBill(id)
  if (!bill) return await mockFailure(`Flat file is not available: shipping bill #${id} was not found`)

  await mockDelay(null)
  const filename = `shipping_bill_${bill.values.jobNumber !== undefined && bill.values.jobNumber !== '' ? bill.values.jobNumber : bill.id}.sb`
  const blob = new Blob([generateFlatFileContent(bill)], { type: 'text/plain;charset=utf-8' })
  triggerBlobDownload(blob, filename)
  return { source: 'local', filename }
}

/**
 * The body a real backend would receive. Exposed so the HTTP contract stays
 * visible while the app runs on mocks.
 */
export function toApiPayload(values: ShippingBillFormValues): HttpShippingBillPayload {
  return toHttpShippingBillPayload(values)
}

/**
 * The interface the UI depends on. Swapping the mock for HTTP means providing
 * another object with these same functions — no component changes required.
 */
export interface ShippingBillService {
  list: typeof listShippingBills
  get: typeof getShippingBill
  create: typeof createShippingBill
  update: typeof updateShippingBill
  save: typeof saveShippingBill
  getFlatFile: typeof getFlatFile
  downloadFlatFile: typeof downloadFlatFile
  toApiPayload: typeof toApiPayload
}

export const shippingBillService: ShippingBillService = {
  list: listShippingBills,
  get: getShippingBill,
  create: createShippingBill,
  update: updateShippingBill,
  save: saveShippingBill,
  getFlatFile,
  downloadFlatFile,
  toApiPayload
}
