import { useSyncExternalStore } from 'react'
import {
  Branch,
  Business,
  emptyBill,
  emptyInvoice,
  Exporter,
  SavedBill,
  ShippingBillFormValues,
  toShippingBillPayload
} from './model'

export interface DemoData {
  exporters: Exporter[]
  businesses: Business[]
  bills: SavedBill[]
}

export interface ApiSeedShippingBillSummary {
  id: number
  jobNumber: number
  jobDate: number
  exporterName: string
  consigneeName: string
  loadingPort: string
  dischargePort: string
  destinationPort: string
  updated: number
}

export const API_SEED_SHIPPING_BILLS: ApiSeedShippingBillSummary[] = [
  {
    id: 1000,
    jobNumber: 150011,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1790967817
  },
  {
    id: 1001,
    jobNumber: 150012,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1790968385
  },
  {
    id: 1002,
    jobNumber: 150013,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1790969061
  },
  {
    id: 1003,
    jobNumber: 150014,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1790969592
  },
  {
    id: 1004,
    jobNumber: 150015,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791003787
  },
  {
    id: 1005,
    jobNumber: 150016,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791010527
  },
  {
    id: 1006,
    jobNumber: 150017,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791138507
  },
  {
    id: 1007,
    jobNumber: 150018,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791139137
  },
  {
    id: 1008,
    jobNumber: 150019,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791139150
  },
  {
    id: 1009,
    jobNumber: 150020,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791139885
  },
  {
    id: 1010,
    jobNumber: 150021,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791140799
  },
  {
    id: 1011,
    jobNumber: 150022,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791140811
  },
  {
    id: 1012,
    jobNumber: 150023,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791141353
  },
  {
    id: 1013,
    jobNumber: 150024,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791141776
  },
  {
    id: 1014,
    jobNumber: 150025,
    jobDate: 20728,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'KRBUS',
    destinationPort: 'KRBUS',
    updated: 1791143087
  },
  {
    id: 1021,
    jobNumber: 150026,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791183194
  },
  {
    id: 1023,
    jobNumber: 150028,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449123
  },
  {
    id: 1024,
    jobNumber: 150029,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449142
  },
  {
    id: 1025,
    jobNumber: 150030,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449171
  },
  {
    id: 1026,
    jobNumber: 150031,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449252
  },
  {
    id: 1027,
    jobNumber: 150032,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791449308
  },
  {
    id: 1028,
    jobNumber: 150033,
    jobDate: 20714,
    exporterName: 'Amit Exports',
    consigneeName: 'H&M HENNES & MAURITZ LTD',
    loadingPort: 'INMUN1',
    dischargePort: 'INMUN1',
    destinationPort: 'USMSY',
    updated: 1791452556
  }
]

const storageKey = 'export-software-shipping-bills-v2'

const seedExporters: Exporter[] = [
  {
    id: 1000,
    name: 'Aarav Textiles Pvt Ltd',
    iec: 'AAECA1234F',
    class: 'F',
    type: 'P',
    branches: [
      {
        id: 1000,
        branchName: 'Ludhiana factory',
        address1: '12 Industrial Area',
        city: 'Ludhiana',
        state: 'Punjab',
        pincode: '141015',
        countryCode: 'IN',
        gstnId: '03AAECA1234F1Z5',
        adCode: '62093230170136'
      },
      {
        id: 1001,
        branchName: 'Tirupur Processing Unit',
        address1: '45 Cotton Mill Road',
        city: 'Tirupur',
        state: 'Tamil Nadu',
        pincode: '641601',
        countryCode: 'IN'
      }
    ]
  },
  {
    id: 1002,
    name: 'Blue Harbor Exports',
    iec: 'AABCB5678G',
    class: 'R',
    type: 'P',
    branches: [
      {
        id: 1003,
        branchName: 'Mumbai office',
        address1: '8 Dock Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        countryCode: 'IN'
      },
      {
        id: 1005,
        branchName: 'Mundra Port Logistics Hub',
        address1: 'Plot 14 Port SEZ',
        city: 'Mundra',
        state: 'Gujarat',
        pincode: '370421',
        countryCode: 'IN'
      }
    ]
  },
  {
    id: 1010,
    name: 'Apex Garments & Fashion Pvt Ltd',
    iec: 'AAACG9876K',
    class: 'F',
    type: 'P',
    branches: [
      {
        id: 1011,
        branchName: 'Surat Apparel Park',
        address1: 'Sector 3 GIDC Khatodara',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395002',
        countryCode: 'IN'
      },
      {
        id: 1012,
        branchName: 'Ahmedabad Central Warehouse',
        address1: 'NH-8 Narol Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382405',
        countryCode: 'IN'
      }
    ]
  },
  {
    id: 1020,
    name: 'Zenith Spices & Agri Corp',
    iec: 'AADCZ3456M',
    class: 'R',
    type: 'P',
    branches: [
      {
        id: 1021,
        branchName: 'Kochi Export Hub',
        address1: 'Willingdon Island Terminal',
        city: 'Kochi',
        state: 'Kerala',
        pincode: '682003',
        countryCode: 'IN'
      },
      {
        id: 1022,
        branchName: 'Guntur Spice Processing Center',
        address1: 'Guntur GT Road',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        pincode: '522001',
        countryCode: 'IN'
      }
    ]
  },
  {
    id: 1030,
    name: 'Titanium Engineering Works',
    iec: 'AAEET7788P',
    class: 'F',
    type: 'P',
    branches: [
      {
        id: 1031,
        branchName: 'Pune Auto Cluster Plant',
        address1: 'Chinchwad MIDC Industrial Zone',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411019',
        countryCode: 'IN'
      },
      {
        id: 1032,
        branchName: 'Chennai Guindy Depot',
        address1: 'Guindy Industrial Estate',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600032',
        countryCode: 'IN'
      }
    ]
  },
  {
    id: 1040,
    name: 'Evergreen Organics Pvt Ltd',
    iec: 'AAEOE5544R',
    class: 'F',
    type: 'P',
    branches: [
      {
        id: 1041,
        branchName: 'Bengaluru Biotech Park Branch',
        address1: 'Electronics City Phase 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560100',
        countryCode: 'IN'
      },
      {
        id: 1042,
        branchName: 'Mysuru Herbal Extraction Unit',
        address1: 'Hebbal Industrial Area',
        city: 'Mysuru',
        state: 'Karnataka',
        pincode: '570016',
        countryCode: 'IN'
      }
    ]
  },
  {
    id: 1050,
    name: 'Rajputana Handicrafts Ltd',
    iec: 'AARPR9911X',
    class: 'R',
    type: 'P',
    branches: [
      {
        id: 1051,
        branchName: 'Jaipur Artisan Export Hub',
        address1: 'Sitapura Industrial Area',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302022',
        countryCode: 'IN'
      },
      {
        id: 1052,
        branchName: 'Jodhpur Wooden Craft Depot',
        address1: 'Boranada SEZ Phase II',
        city: 'Jodhpur',
        state: 'Rajasthan',
        pincode: '342012',
        countryCode: 'IN'
      }
    ]
  },
  {
    id: 1060,
    name: 'Amit Exports',
    iec: 'AABCA4412L',
    class: 'F',
    type: 'P',
    branches: [
      {
        id: 1061,
        branchName: 'Mundra Export Office',
        address1: 'Plot 22 Port Industrial Zone',
        city: 'Mundra',
        state: 'Gujarat',
        pincode: '370421',
        countryCode: 'IN'
      }
    ]
  }
]

const seedBusinesses: Business[] = [
  {
    id: 1000,
    name: 'Gulf Retail LLC',
    isConsignee: true,
    isBuyer: true,
    isNotify: false,
    isThirdParty: false,
    branches: [
      {
        id: 1000,
        branchName: 'Dubai head office',
        address1: '18 Creek Road',
        city: 'Dubai',
        countryCode: 'AE'
      },
      {
        id: 2004,
        branchName: 'Abu Dhabi Distribution Hub',
        address1: 'KIZAD Industrial Zone',
        city: 'Abu Dhabi',
        countryCode: 'AE'
      }
    ]
  },
  {
    id: 2002,
    name: 'Northstar Trading Inc',
    isConsignee: true,
    isBuyer: true,
    isNotify: true,
    isThirdParty: false,
    branches: [
      {
        id: 2003,
        branchName: 'New Orleans warehouse',
        address1: '456 Import Street',
        city: 'New Orleans',
        state: 'Louisiana',
        countryCode: 'US'
      },
      {
        id: 2005,
        branchName: 'Houston Fulfillment Center',
        address1: '8900 Port of Houston Parkway',
        city: 'Houston',
        state: 'Texas',
        countryCode: 'US'
      }
    ]
  },
  {
    id: 2010,
    name: 'EuroGlobal Fashion GmbH',
    isConsignee: true,
    isBuyer: true,
    isNotify: true,
    isThirdParty: false,
    branches: [
      {
        id: 2011,
        branchName: 'Hamburg Central Hub',
        address1: 'Speicherstadt Logistics Park 4',
        city: 'Hamburg',
        countryCode: 'DE'
      },
      {
        id: 2012,
        branchName: 'Frankfurt Distribution Depot',
        address1: 'Flughafen Gateway Gardens',
        city: 'Frankfurt',
        countryCode: 'DE'
      }
    ]
  },
  {
    id: 2020,
    name: 'Pacific Rim Import Co.',
    isConsignee: true,
    isBuyer: true,
    isNotify: false,
    isThirdParty: false,
    branches: [
      {
        id: 2021,
        branchName: 'Los Angeles Port Terminal Branch',
        address1: '700 Harbor Boulevard',
        city: 'Los Angeles',
        state: 'California',
        countryCode: 'US'
      },
      {
        id: 2022,
        branchName: 'Seattle Gateway Warehouse',
        address1: '1200 Pacific Highway',
        city: 'Seattle',
        state: 'Washington',
        countryCode: 'US'
      }
    ]
  },
  {
    id: 2030,
    name: 'Al-Mansoor Trading FZE',
    isConsignee: true,
    isBuyer: true,
    isNotify: true,
    isThirdParty: false,
    branches: [
      {
        id: 2031,
        branchName: 'Jebel Ali Free Zone Office',
        address1: 'JAFZA North Tower 2',
        city: 'Dubai',
        countryCode: 'AE'
      },
      {
        id: 2032,
        branchName: 'Sharjah Industrial Depot',
        address1: 'SAIF Zone Building 5',
        city: 'Sharjah',
        countryCode: 'AE'
      }
    ]
  },
  {
    id: 2040,
    name: 'Apex Overseas Pte Ltd',
    isConsignee: true,
    isBuyer: true,
    isNotify: false,
    isThirdParty: false,
    branches: [
      {
        id: 2041,
        branchName: 'Singapore Tech Park Branch',
        address1: '50 Jurong East Street 21',
        city: 'Singapore',
        countryCode: 'SG'
      },
      {
        id: 2042,
        branchName: 'Changi Air Freight Center',
        address1: 'Cargo Agents Building C',
        city: 'Singapore',
        countryCode: 'SG'
      }
    ]
  },
  {
    id: 2050,
    name: 'British Heritage Imports Ltd',
    isConsignee: true,
    isBuyer: true,
    isNotify: true,
    isThirdParty: false,
    branches: [
      {
        id: 2051,
        branchName: 'London Gateway Terminal',
        address1: 'Thames Port Logistics Park',
        city: 'London',
        countryCode: 'GB'
      },
      {
        id: 2052,
        branchName: 'Manchester Regional Depot',
        address1: 'Trafford Industrial Estate',
        city: 'Manchester',
        countryCode: 'GB'
      }
    ]
  },
  {
    id: 2060,
    name: 'H&M HENNES & MAURITZ LTD',
    isConsignee: true,
    isBuyer: true,
    isNotify: true,
    isThirdParty: false,
    branches: [
      {
        id: 2061,
        branchName: 'Busan Distribution Hub',
        address1: '101 New Port Logistics Road',
        city: 'Busan',
        countryCode: 'KR'
      }
    ]
  }
]

function formatIsoTimestamp(val: unknown): string {
  if (!val) return new Date().toISOString()
  if (typeof val === 'number') {
    const ms = val < 10_000_000_000 ? val * 1000 : val
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  }
  if (typeof val === 'string') {
    const d = new Date(val)
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  }
  return new Date().toISOString()
}

function formatEpochDays(days: unknown): string {
  if (typeof days === 'number') {
    const d = new Date(days * 86_400_000)
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().split('T')[0] ?? ''
    }
  }
  return typeof days === 'string' ? days : ''
}

export function normalizeApiBill(raw: any): SavedBill {
  if (!raw) {
    return { id: 0, created: '', updated: '', values: emptyBill() }
  }

  if (raw.values && raw.id) {
    const existingValues = raw.values as ShippingBillFormValues
    const matchedExp = seedExporters.find((e) => String(e.id) === existingValues.exporterId)
    const matchedCon = seedBusinesses.find((b) => String(b.id) === existingValues.consigneeId)
    return {
      ...(raw as SavedBill),
      updated: formatIsoTimestamp(raw.updated),
      created: formatIsoTimestamp(raw.created),
      values: {
        ...existingValues,
        exporterName: existingValues.exporterName ?? matchedExp?.name,
        consigneeName: existingValues.consigneeName ?? matchedCon?.name,
        packingRanges: (existingValues as Partial<ShippingBillFormValues>).packingRanges ?? []
      }
    }
  }

  const id = Number(raw.id ?? raw.shippingBillId ?? raw.chaId ?? Math.floor(Math.random() * 100_000))
  const jobDateStr = formatEpochDays(raw.jobDate) || new Date().toISOString().slice(0, 10)
  const updated = formatIsoTimestamp(raw.updatedAt ?? raw.updated ?? raw.createdAt)
  const created = formatIsoTimestamp(raw.createdAt ?? raw.created ?? updated)

  const exporterByName =
    typeof raw.exporterName === 'string'
      ? seedExporters.find((e) => e.name.toLowerCase() === String(raw.exporterName).toLowerCase())
      : undefined
  const consigneeByName =
    typeof raw.consigneeName === 'string'
      ? seedBusinesses.find((b) => b.name.toLowerCase() === String(raw.consigneeName).toLowerCase())
      : undefined

  const resolvedExporterId = raw.exporterId ? String(raw.exporterId) : String(exporterByName?.id ?? '')
  const resolvedExporterBranchId = raw.exporterBranchId
    ? String(raw.exporterBranchId)
    : String(exporterByName?.branches[0]?.id ?? '')
  const resolvedConsigneeId = raw.consigneeId ? String(raw.consigneeId) : String(consigneeByName?.id ?? '')
  const resolvedConsigneeBranchId =
    (raw.consigneeAddressId ?? raw.consigneeBranchId)
      ? String(raw.consigneeAddressId ?? raw.consigneeBranchId)
      : String(consigneeByName?.branches[0]?.id ?? '')

  const rawInvoices = Array.isArray(raw.invoices) && raw.invoices.length > 0 ? (raw.invoices as any[]) : null

  const invoices = rawInvoices
    ? rawInvoices.map((inv: any, idx: number) => ({
        invoiceNumber: (inv.invoiceNumber as string | undefined) ?? `INV-${idx + 1}`,
        invoiceDate: formatEpochDays(inv.date ?? inv.invoiceDate) || jobDateStr,
        currency:
          typeof inv.currency === 'number'
            ? inv.currency === 840
              ? 'USD'
              : inv.currency === 356
                ? 'INR'
                : String(inv.currency)
            : ((inv.currency as string | undefined) ?? 'USD'),
        contractType: inv.contractType && typeof inv.contractType === 'string' ? String(inv.contractType) : 'FOB',
        buyerId: inv.buyerId ? String(inv.buyerId) : resolvedConsigneeId,
        buyerBranchId:
          (inv.buyerAddressId ?? inv.buyerBranchId)
            ? String(inv.buyerAddressId ?? inv.buyerBranchId)
            : resolvedConsigneeBranchId,
        buyerSameAsConsignee: inv.buyerId == null || String(inv.buyerId) === resolvedConsigneeId,
        freightAmount: inv.freightAmount ? String(inv.freightAmount) : '',
        insuranceAmount: inv.insuranceAmount ? String(inv.insuranceAmount) : '',
        items:
          Array.isArray(inv.items) && inv.items.length > 0
            ? (inv.items as any[]).map((item: any) => ({
                schemeCode: (item.schemeCode as string | undefined) ?? '',
                ritcCode: (item.ritcCode as string | undefined) ?? '',
                goodsDescription1:
                  (item.goodsDescription as string | undefined) ?? (item.goodsDescription1 as string | undefined) ?? '',
                quantity: item.quantity ? String(item.quantity) : '',
                unitOfMeasurement: (item.unitOfMeasurement as string | undefined) ?? 'PCS',
                unitPrice: item.unitPrice ? String(item.unitPrice) : '',
                unitOfRate:
                  (item.unitOfRate as string | undefined) ?? (item.unitOfMeasurement as string | undefined) ?? 'PCS',
                numberOfUnits: item.noOfUnits ? String(item.noOfUnits) : '1',
                presentMarketValue: item.presentMarketValue ? String(item.presentMarketValue) : '',
                thirdPartyItem: Boolean(item.thirdParty),
                rewardItem: Boolean(item.rewardItem),
                totalPackage: item.totalPackage ? String(item.totalPackage) : '',
                endUseOfItem: (item.endUseOfItem as string | undefined) ?? '',
                igstPaymentStatus: typeof item.igstPaymentStatus === 'string' ? item.igstPaymentStatus : 'LUT',
                originDistrictCode: item.originDistrictCode ? String(item.originDistrictCode) : '',
                tradeAgreementsCode: (item.tradeAgreementsCode as string | undefined) ?? 'NCPTI',
                drawbackSerialNumber: (item.drawbackSerialNumber as string | undefined) ?? '',
                drawbackQuantity: item.drawbackQuantity ? String(item.drawbackQuantity) : ''
              }))
            : emptyInvoice().items
      }))
    : [
        {
          ...emptyInvoice(),
          invoiceNumber: `INV/${String(raw.jobNumber ?? id)}`,
          invoiceDate: jobDateStr,
          buyerId: resolvedConsigneeId,
          buyerBranchId: resolvedConsigneeBranchId,
          items: [
            {
              ritcCode: '61091000',
              goodsDescription1: 'Knitted Cotton Garments',
              quantity: '100',
              unitOfMeasurement: 'PCS',
              unitPrice: '8.50',
              igstPaymentStatus: 'LUT',
              tradeAgreementsCode: 'NCPTI',
              rewardItem: true
            }
          ]
        }
      ]

  const rawPacking = (raw.packgingList ?? raw.packingRanges) as any[] | undefined
  const rawDocs = raw.documents as any[] | undefined

  const values: ShippingBillFormValues = {
    ...emptyBill(),
    jobNumber: raw.jobNumber ? String(raw.jobNumber) : `JOB-${id}`,
    jobDate: jobDateStr,
    exporterId: resolvedExporterId,
    exporterBranchId: resolvedExporterBranchId,
    exporterName: (raw.exporterName as string | undefined) ?? exporterByName?.name ?? '',
    consigneeId: resolvedConsigneeId,
    consigneeBranchId: resolvedConsigneeBranchId,
    consigneeName: (raw.consigneeName as string | undefined) ?? consigneeByName?.name ?? '',
    originStateCode: raw.originStateCode ? String(raw.originStateCode) : '',
    loadingPort: (raw.loadingPort as string | undefined) ?? '',
    finalDestinationPort:
      (raw.destinationPort as string | undefined) ?? (raw.finalDestinationPort as string | undefined) ?? '',
    dischargePort:
      (raw.dischargePort as string | undefined) ??
      (raw.destinationPort as string | undefined) ??
      (raw.finalDestinationPort as string | undefined) ??
      '',
    sealType: typeof raw.sealType === 'string' ? raw.sealType : undefined,
    natureOfCargo: typeof raw.natureOfCargo === 'string' ? raw.natureOfCargo : 'P',
    grossWeight: raw.grossWeight ? String(raw.grossWeight) : '',
    netWeight: raw.netWeight ? String(raw.netWeight) : '',
    measurementUnit: raw.measurementUnit === 'KGS' || !raw.measurementUnit ? 'KG' : String(raw.measurementUnit),
    totalPackages: raw.totalPackages ? String(raw.totalPackages) : '',
    marksAndNumbers: (raw.marksAndNumbers as string | undefined) ?? '',
    loosePackets: raw.loosePackets ? String(raw.loosePackets) : '',
    numberOfContainers: raw.numberOfContainers ? String(raw.numberOfContainers) : '',
    containers: Array.isArray(raw.containers) ? (raw.containers as ShippingBillFormValues['containers']) : [],
    invoices,
    packingRanges: Array.isArray(rawPacking)
      ? rawPacking.map((p: any) => ({
          packingNumberFrom: String(p.packingNumberFrom ?? ''),
          packingNumberTo: String(p.packingNumberTo ?? ''),
          packingCode: (p.packingCode as string | undefined) ?? 'CTN'
        }))
      : [],
    documents: Array.isArray(rawDocs)
      ? rawDocs.map((doc: any) => ({
          invoiceSerialNumber: String(doc.invoiceSerialNumber ?? '1'),
          itemSerialNumber: String(doc.itemSerialNumber ?? '1'),
          documentTypeCode: (doc.documentTypeCode as string | undefined) ?? '',
          documentReferenceNumber: (doc.documentReferenceNumber as string | undefined) ?? '',
          imageReferenceNumber: (doc.imageReferenceNumber as string | undefined) ?? '',
          documentIssueDate: formatEpochDays(doc.documentIssueDate) || jobDateStr,
          fileType: doc.fileType ? String(doc.fileType) : 'pdf'
        }))
      : [],
    licenses: Array.isArray(raw.licenses) ? (raw.licenses as ShippingBillFormValues['licenses']) : []
  }

  return { id, created, updated, values }
}

export function normalizeApiBills(list: any): SavedBill[] {
  if (!list) return []
  const arr = Array.isArray(list)
    ? list
    : Array.isArray(list.data)
      ? (list.data as unknown[])
      : Array.isArray(list.items)
        ? (list.items as unknown[])
        : []
  return arr.map(normalizeApiBill)
}

const primarySeedBill: SavedBill = {
  id: 3000,
  created: '2026-09-18T08:00:00.000Z',
  updated: '2026-09-18T08:00:00.000Z',
  values: {
    jobNumber: '2081',
    jobDate: '2026-09-18',
    exporterId: '1000',
    exporterBranchId: '1001',
    exporterName: 'Aarav Textiles Pvt Ltd',
    consigneeId: '2002',
    consigneeBranchId: '2003',
    consigneeName: 'Northstar Trading Inc',
    loadingPort: 'INMUN1',
    finalDestinationPort: 'USMSY',
    natureOfCargo: 'P',
    grossWeight: '34.6',
    netWeight: '23.5',
    measurementUnit: 'KG',
    totalPackages: '12',
    invoices: [
      {
        invoiceNumber: 'EX/2081/2026',
        invoiceDate: '2026-09-17',
        currency: 'USD',
        contractType: 'FOB',
        buyerSameAsConsignee: true,
        buyerId: '2002',
        buyerBranchId: '2003',
        items: [
          {
            ritcCode: '61091000',
            goodsDescription1: 'Cotton T-shirts',
            quantity: '51',
            unitOfMeasurement: 'PCS',
            unitPrice: '3.831',
            igstPaymentStatus: 'LUT',
            rewardItem: true
          }
        ]
      }
    ],
    containers: [],
    packingRanges: [],
    documents: [],
    licenses: []
  }
}

const seedBills: SavedBill[] = [primarySeedBill, ...normalizeApiBills(API_SEED_SHIPPING_BILLS)]

const seed: DemoData = {
  exporters: seedExporters,
  businesses: seedBusinesses,
  bills: seedBills
}

function enrichBillPartyNames(bill: SavedBill, exporters: Exporter[], businesses: Business[]): SavedBill {
  const exporter = exporters.find((e) => String(e.id) === bill.values.exporterId)
  const consignee = businesses.find((b) => String(b.id) === bill.values.consigneeId)
  return {
    ...bill,
    values: {
      ...bill.values,
      exporterName: exporter?.name ?? bill.values.exporterName,
      consigneeName: consignee?.name ?? bill.values.consigneeName,
      packingRanges: (bill.values as Partial<ShippingBillFormValues>).packingRanges ?? []
    }
  }
}

function loadData(): DemoData {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoData
      if (Array.isArray(parsed.exporters) && Array.isArray(parsed.businesses) && Array.isArray(parsed.bills)) {
        const existingExporterIds = new Set(parsed.exporters.map((e) => e.id))
        const missingExporters = seed.exporters.filter((e) => !existingExporterIds.has(e.id))
        const mergedExporters = [...parsed.exporters, ...missingExporters]

        const existingBusinessIds = new Set(parsed.businesses.map((b) => b.id))
        const missingBusinesses = seed.businesses.filter((b) => !existingBusinessIds.has(b.id))
        const mergedBusinesses = [...parsed.businesses, ...missingBusinesses]

        const existingBillIds = new Set(parsed.bills.map((b) => b.id))
        const missingBills = seed.bills.filter((b) => !existingBillIds.has(b.id))
        const mergedBills = [...parsed.bills, ...missingBills].map((bill) =>
          enrichBillPartyNames(bill, mergedExporters, mergedBusinesses)
        )

        return {
          exporters: mergedExporters,
          businesses: mergedBusinesses,
          bills: mergedBills
        }
      }
    }
  } catch {
    // Fall back to in-memory seed data if localStorage is unavailable or malformed.
  }
  return seed
}

let snapshot = loadData()
const listeners = new Set<() => void>()

function publish(next: DemoData) {
  snapshot = next
  try {
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // Keep in-memory state working even when storage quota or privacy settings block writes.
  }
  listeners.forEach((listener) => listener())
}

export function useDemoData() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => snapshot
  )
}

export function getDemoData(): DemoData {
  return snapshot
}

function nextId(): number {
  const ids = [
    ...snapshot.exporters.flatMap((record) => [record.id, ...record.branches.map((branch) => branch.id)]),
    ...snapshot.businesses.flatMap((record) => [record.id, ...record.branches.map((branch) => branch.id)]),
    ...snapshot.bills.map((bill) => bill.id)
  ]
  return Math.max(3000, ...ids) + 1
}

export function saveExporter(
  exporter: Omit<Exporter, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }
): Exporter {
  const id = exporter.id ?? nextId()
  const previous = snapshot.exporters.find((record) => record.id === id)
  const branches = previous?.branches ?? (exporter.firstBranch ? [{ ...exporter.firstBranch, id: id + 1 }] : [])
  const record: Exporter = {
    id,
    branches,
    name: exporter.name,
    iec: exporter.iec,
    class: exporter.class,
    type: exporter.type,
    pan: exporter.pan,
    tan: exporter.tan,
    aeoNumber: exporter.aeoNumber,
    website: exporter.website,
    notes: exporter.notes,
    disabled: exporter.disabled ?? previous?.disabled
  }
  publish({ ...snapshot, exporters: [...snapshot.exporters.filter((item) => item.id !== id), record] })
  return record
}

export function saveBusiness(
  business: Omit<Business, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }
): Business {
  const id = business.id ?? nextId()
  const previous = snapshot.businesses.find((record) => record.id === id)
  const branches = previous?.branches ?? (business.firstBranch ? [{ ...business.firstBranch, id: id + 1 }] : [])
  const record: Business = {
    id,
    branches,
    name: business.name,
    iec: business.iec,
    isConsignee: business.isConsignee,
    isBuyer: business.isBuyer,
    isNotify: business.isNotify,
    isThirdParty: business.isThirdParty
  }
  publish({ ...snapshot, businesses: [...snapshot.businesses.filter((item) => item.id !== id), record] })
  return record
}

export function saveBranch(
  kind: 'exporter' | 'business',
  ownerId: number,
  branch: Omit<Branch, 'id'> & { id?: number }
): Branch {
  const id = branch.id ?? nextId()
  const record: Branch = { ...branch, id }
  if (kind === 'exporter') {
    publish({
      ...snapshot,
      exporters: snapshot.exporters.map((owner) =>
        owner.id === ownerId
          ? { ...owner, branches: [...owner.branches.filter((item) => item.id !== id), record] }
          : owner
      )
    })
  } else {
    publish({
      ...snapshot,
      businesses: snapshot.businesses.map((owner) =>
        owner.id === ownerId
          ? { ...owner, branches: [...owner.branches.filter((item) => item.id !== id), record] }
          : owner
      )
    })
  }
  return record
}

export function deleteParty(kind: 'exporter' | 'business', id: number): boolean {
  const inUse = snapshot.bills.some((bill) =>
    kind === 'exporter'
      ? bill.values.exporterId === String(id)
      : bill.values.consigneeId === String(id) ||
        bill.values.invoices.some(
          (invoice) =>
            invoice.buyerId === String(id) ||
            invoice.thirdPartyId === String(id) ||
            invoice.items.some((item) => item.itemThirdPartyId === String(id))
        )
  )
  if (inUse) return false
  publish({
    ...snapshot,
    exporters: kind === 'exporter' ? snapshot.exporters.filter((record) => record.id !== id) : snapshot.exporters,
    businesses: kind === 'business' ? snapshot.businesses.filter((record) => record.id !== id) : snapshot.businesses
  })
  return true
}

export function deleteBranch(kind: 'exporter' | 'business', ownerId: number, id: number): boolean {
  const inUse = snapshot.bills.some((bill) =>
    kind === 'exporter'
      ? bill.values.exporterBranchId === String(id)
      : bill.values.consigneeBranchId === String(id) ||
        bill.values.invoices.some(
          (invoice) =>
            invoice.buyerBranchId === String(id) ||
            invoice.thirdPartyBranchId === String(id) ||
            invoice.items.some((item) => item.itemThirdPartyBranchId === String(id))
        )
  )
  if (inUse) return false
  if (kind === 'exporter') {
    publish({
      ...snapshot,
      exporters: snapshot.exporters.map((owner) =>
        owner.id === ownerId ? { ...owner, branches: owner.branches.filter((branch) => branch.id !== id) } : owner
      )
    })
  } else {
    publish({
      ...snapshot,
      businesses: snapshot.businesses.map((owner) =>
        owner.id === ownerId ? { ...owner, branches: owner.branches.filter((branch) => branch.id !== id) } : owner
      )
    })
  }
  return true
}

export function saveBill(values: ShippingBillFormValues, id?: number): SavedBill {
  const now = new Date().toISOString()
  const previous = snapshot.bills.find((bill) => bill.id === id)
  const exporter = snapshot.exporters.find((e) => String(e.id) === values.exporterId)
  const consignee = snapshot.businesses.find((b) => String(b.id) === values.consigneeId)
  const enrichedValues: ShippingBillFormValues = {
    ...values,
    exporterName: exporter?.name ?? values.exporterName,
    consigneeName: consignee?.name ?? values.consigneeName
  }
  const record: SavedBill = {
    id: id ?? nextId(),
    created: previous?.created ?? now,
    updated: now,
    values: enrichedValues,
    payload: toShippingBillPayload(enrichedValues)
  }
  publish({ ...snapshot, bills: [record, ...snapshot.bills.filter((bill) => bill.id !== record.id)] })
  return record
}

export function syncBillsFromApi(apiBills: SavedBill[]) {
  if (!apiBills.length) return
  const existingMap = new Map<number, SavedBill>()
  for (const b of snapshot.bills) {
    existingMap.set(b.id, b)
  }
  for (const b of apiBills) {
    existingMap.set(b.id, b)
  }
  publish({
    ...snapshot,
    bills: Array.from(existingMap.values())
  })
}
