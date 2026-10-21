import { seedShippingBills } from '@/data/seed-shipping-bills'
import { getDemoData, saveBill as persistBill } from './demo-store'
import { MockServiceError, delay } from './mock-network'
import { Business, Exporter, SavedBill, ShippingBillFormValues } from './model'
import {
  HttpShippingBillPayload,
  generateFlatFileContent,
  normalizeApiBills,
  toHttpShippingBillPayload
} from './shipping-bill-payload'

/**
 * Async mock service for Shipping Bills. Only this service (and the party service)
 * touches the mock store; UI code must call these functions instead of reading
 * localStorage or the demo store directly. Every function returns a Promise with a
 * simulated network delay and clear errors, so the module can later be replaced by
 * a real HTTP API without changing the UI.
 */

const seedBills: SavedBill[] = normalizeApiBills(seedShippingBills)

export interface SaveShippingBillResult {
  bill: SavedBill
  /** Simulated request body of POST /api/shipping-bills (per shipping_bill.http). */
  requestBody: HttpShippingBillPayload
}

function mergedBills(): SavedBill[] {
  const byId = new Map<number, SavedBill>()
  for (const bill of seedBills) byId.set(bill.id, bill)
  // Saved bills (mock store) win over seed records with the same id.
  for (const bill of getDemoData().bills) byId.set(bill.id, bill)
  return Array.from(byId.values())
}

function findBill(id: string | number): SavedBill | undefined {
  return mergedBills().find((bill) => String(bill.id) === String(id))
}

/** Resolves display names for the selected parties so saved bills show correctly on the dashboard. */
function enrichPartyNames(values: ShippingBillFormValues): ShippingBillFormValues {
  const { exporters, businesses } = getDemoData()
  const exporter = exporters.find((item: Exporter) => String(item.id) === values.exporterId)
  const consignee = businesses.find((item: Business) => String(item.id) === values.consigneeId)
  return {
    ...values,
    exporterName: exporter?.name ?? values.exporterName,
    consigneeName: consignee?.name ?? values.consigneeName
  }
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

export const shippingBillService = {
  /** List all shipping bills: seed records plus bills saved in the mock store. */
  async list(): Promise<SavedBill[]> {
    return delay(mergedBills())
  },

  /** Find a bill by id. Returns undefined when the id does not exist. */
  async getById(id: string | number): Promise<SavedBill | undefined> {
    return delay(findBill(id))
  },

  /** Create a new shipping bill. */
  async create(values: ShippingBillFormValues): Promise<SaveShippingBillResult> {
    return performSave(values)
  },

  /** Update an existing shipping bill. Throws when the id does not exist. */
  async update(id: number, values: ShippingBillFormValues): Promise<SaveShippingBillResult> {
    if (!findBill(id)) {
      throw new MockServiceError(`Shipping bill ${id} not found, cannot update`)
    }
    return performSave(values, id)
  },

  /** Save (create or update) a shipping bill. */
  async save(values: ShippingBillFormValues, id?: number): Promise<SaveShippingBillResult> {
    if (id != null) return shippingBillService.update(id, values)
    return performSave(values)
  },

  /** Return the flat file (.sb) text for a bill. Throws when the bill does not exist. */
  async getFlatFile(id: string | number): Promise<string> {
    const bill = findBill(id)
    if (!bill) {
      throw new MockServiceError(`Shipping bill ${id} not found, cannot generate flat file`)
    }
    return delay(generateFlatFileContent(bill))
  },

  /** Generate the flat file (.sb) for a bill and download it in the browser. */
  async downloadFlatFile(
    id: string | number,
    billData?: SavedBill,
    fallbackFilename?: string
  ): Promise<{ source: 'local' }> {
    const bill = billData ?? findBill(id)
    if (!bill) {
      throw new MockServiceError(`Shipping bill ${id} not found, cannot generate flat file`)
    }
    const content = generateFlatFileContent(bill)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const safeJob = bill.values.jobNumber ?? bill.id
    triggerBlobDownload(blob, fallbackFilename ?? `shipping_bill_${safeJob}.sb`)
    return delay({ source: 'local' as const })
  }
}

async function performSave(values: ShippingBillFormValues, id?: number): Promise<SaveShippingBillResult> {
  const enriched = enrichPartyNames(values)
  const requestBody = toHttpShippingBillPayload(enriched)
  const bill = persistBill(enriched, id)
  return delay({ bill, requestBody })
}
