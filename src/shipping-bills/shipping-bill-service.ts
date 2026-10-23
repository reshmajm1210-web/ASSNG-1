import { API_SEED_SHIPPING_BILLS, getDemoData, normalizeApiBill, normalizeApiBills, saveBill } from './demo-store'
import { SavedBill, ShippingBillFormValues, toHttpShippingBillPayload } from './model'

export { API_SEED_SHIPPING_BILLS, normalizeApiBill, normalizeApiBills, toHttpShippingBillPayload }

const MOCK_BILL_DELAY_MS = 220

function delay<T>(value: T, ms = MOCK_BILL_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

export function generateFlatFileContent(bill: SavedBill): string {
  const v = bill.values
  const lines: string[] = []
  const now = new Date()
  const dateCompact = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeCompact = now.toTimeString().slice(0, 8).replace(/:/g, '')

  lines.push(`HREC**ZZ*${v.loadingPort || 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*${dateCompact}*${timeCompact}`)
  lines.push(`<TABLE>SB`)
  lines.push(`<F>JOB_NO^JOB_DT^EXPORTER^CONSIGNEE^LOAD_PORT^DEST_PORT^DISCH_PORT^GROSS_WT^NET_WT^UNIT^TOTAL_PKGS^MARKS`)
  lines.push(
    `<R>${v.jobNumber ?? bill.id}^${v.jobDate || ''}^${v.exporterName ?? v.exporterId}^${v.consigneeName ?? v.consigneeId}^${v.loadingPort || ''}^${v.finalDestinationPort || ''}^${v.dischargePort ?? v.finalDestinationPort}^${v.grossWeight ?? ''}^${v.netWeight ?? ''}^${v.measurementUnit || 'KGS'}^${v.totalPackages ?? ''}^${(v.marksAndNumbers ?? '').replace(/[\r\n]+/g, ' ')}`
  )

  if (v.invoices.length > 0) {
    lines.push(`<TABLE>INVOICE`)
    lines.push(`<F>INV_SR_NO^INV_NO^INV_DT^CURRENCY^CONTRACT_TYPE^FREIGHT^INSURANCE`)
    v.invoices.forEach((inv, idx) => {
      lines.push(
        `<R>${idx + 1}^${inv.invoiceNumber || ''}^${inv.invoiceDate || ''}^${inv.currency || 'USD'}^${inv.contractType || ''}^${inv.freightAmount ?? '0'}^${inv.insuranceAmount ?? '0'}`
      )
    })

    lines.push(`<TABLE>ITEM`)
    lines.push(`<F>INV_SR_NO^ITEM_SR_NO^RITC^DESC^QTY^UOM^UNIT_PRICE^TOTAL^SCHEME`)
    v.invoices.forEach((inv, invIdx) => {
      inv.items.forEach((item, itemIdx) => {
        const qty = Number(item.quantity || 0)
        const price = Number(item.unitPrice || 0)
        const total = Number.isNaN(qty * price) ? 0 : qty * price
        lines.push(
          `<R>${invIdx + 1}^${itemIdx + 1}^${item.ritcCode || ''}^${item.goodsDescription1.replace(/[\r\n]+/g, ' ')}^${item.quantity || ''}^${item.unitOfMeasurement || 'PCS'}^${item.unitPrice || ''}^${total.toFixed(2)}^${item.schemeCode ?? ''}`
        )
      })
    })
  }

  if (v.packingRanges.length > 0) {
    lines.push(`<TABLE>PACKING`)
    lines.push(`<F>FROM_PKG^TO_PKG^PKG_CODE`)
    v.packingRanges.forEach((pkg) => {
      lines.push(`<R>${pkg.packingNumberFrom}^${pkg.packingNumberTo}^${pkg.packingCode ?? 'CTN'}`)
    })
  }

  lines.push(`TREC**ZZ*${v.loadingPort || 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)

  return lines.join('\r\n')
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

function sortBillsNewestFirst(bills: SavedBill[]): SavedBill[] {
  return [...bills].sort((a, b) => {
    const timeA = a.updated ? new Date(a.updated).getTime() : 0
    const timeB = b.updated ? new Date(b.updated).getTime() : 0
    const validA = Number.isNaN(timeA) ? 0 : timeA
    const validB = Number.isNaN(timeB) ? 0 : timeB
    return validB - validA
  })
}

export const shippingBillService = {
  getInitialBills(): SavedBill[] {
    return sortBillsNewestFirst(getDemoData().bills)
  },

  async list(): Promise<SavedBill[]> {
    const { bills } = getDemoData()
    return delay(sortBillsNewestFirst(bills))
  },

  async getById(id: string | number): Promise<SavedBill | null> {
    const { bills } = getDemoData()
    const match = bills.find((bill) => String(bill.id) === String(id))
    return delay(match ?? null, 160)
  },

  async save(values: ShippingBillFormValues, id?: number): Promise<SavedBill> {
    const saved = saveBill(values, id)
    return delay(saved, 220)
  },

  async upsert(values: ShippingBillFormValues, id?: number): Promise<SavedBill> {
    return shippingBillService.save(values, id)
  },

  async getFlatFile(id: string | number): Promise<string> {
    const bill = await shippingBillService.getById(id)
    if (!bill) {
      throw new Error(`Shipping bill #${id} not found`)
    }
    return generateFlatFileContent(bill)
  },

  async downloadFlatFile(
    id: string | number,
    billData?: SavedBill,
    fallbackFilename?: string
  ): Promise<{ source: 'local'; filename: string }> {
    const resolvedBill = billData ?? (await shippingBillService.getById(id))
    if (!resolvedBill) {
      throw new Error(`Shipping bill #${id} was not found in local store`)
    }

    const flatFileContent = await delay(generateFlatFileContent(resolvedBill), 150)
    const safeJob = resolvedBill.values.jobNumber ?? String(resolvedBill.id)
    const filename = fallbackFilename ?? `shipping_bill_${safeJob}.sb`
    const blob = new Blob([flatFileContent], { type: 'text/plain;charset=utf-8' })
    triggerBlobDownload(blob, filename)
    return { source: 'local', filename }
  }
}
