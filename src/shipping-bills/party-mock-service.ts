import { getDemoData, saveBranch, saveBusiness, saveExporter } from './demo-store'
import { allPorts, Branch, Business, Exporter, loadingPorts, PortOption, ports } from './model'

export type BusinessRole = 'consignee' | 'buyer' | 'thirdParty'

const MOCK_DELAY_MS = 200

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}

function matchesBusinessRole(item: Business, role?: BusinessRole, selectedId?: string): boolean {
  if (selectedId && String(item.id) === selectedId) return true
  if (!role) return true
  if (role === 'consignee') return item.isConsignee
  if (role === 'buyer') return item.isBuyer
  return item.isThirdParty
}

export const partyMockService = {
  async searchExporters(query: string, selectedId?: string): Promise<Exporter[]> {
    const { exporters } = getDemoData()
    const q = query.trim().toLowerCase()
    const filtered = exporters.filter(
      (item) =>
        (!item.disabled || String(item.id) === selectedId) &&
        (item.name.toLowerCase().includes(q) || item.iec.toLowerCase().includes(q))
    )
    return delay(filtered)
  },

  async searchExporterBranches(exporterId: string, query: string): Promise<Branch[]> {
    if (!exporterId) return delay([], 80)
    const { exporters } = getDemoData()
    const exporter = exporters.find((item) => String(item.id) === exporterId)
    if (!exporter) return delay([], 80)

    const q = query.trim().toLowerCase()
    const filtered = exporter.branches.filter(
      (branch) => branch.branchName.toLowerCase().includes(q) || branch.city.toLowerCase().includes(q)
    )
    return delay(filtered)
  },

  async searchBusinesses(query: string, role?: BusinessRole, selectedId?: string): Promise<Business[]> {
    const { businesses } = getDemoData()
    const q = query.trim().toLowerCase()
    const filtered = businesses.filter(
      (item) => matchesBusinessRole(item, role, selectedId) && item.name.toLowerCase().includes(q)
    )
    return delay(filtered)
  },

  async searchConsignees(query: string): Promise<Business[]> {
    return partyMockService.searchBusinesses(query, 'consignee')
  },

  async searchBusinessBranches(businessId: string, query: string): Promise<Branch[]> {
    if (!businessId) return delay([], 80)
    const { businesses } = getDemoData()
    const business = businesses.find((item) => String(item.id) === businessId)
    if (!business) return delay([], 80)

    const q = query.trim().toLowerCase()
    const filtered = business.branches.filter(
      (branch) => branch.branchName.toLowerCase().includes(q) || branch.city.toLowerCase().includes(q)
    )
    return delay(filtered)
  },

  async searchConsigneeBranches(consigneeId: string, query: string): Promise<Branch[]> {
    return partyMockService.searchBusinessBranches(consigneeId, query)
  },

  async getExporterById(exporterId: string): Promise<Exporter | undefined> {
    if (!exporterId) return delay(undefined, 60)
    const { exporters } = getDemoData()
    return delay(
      exporters.find((item) => String(item.id) === exporterId),
      100
    )
  },

  async getBusinessById(businessId: string): Promise<Business | undefined> {
    if (!businessId) return delay(undefined, 60)
    const { businesses } = getDemoData()
    return delay(
      businesses.find((item) => String(item.id) === businessId),
      100
    )
  },

  async getConsigneeById(consigneeId: string): Promise<Business | undefined> {
    return partyMockService.getBusinessById(consigneeId)
  },

  async getPartyById(kind: 'exporter' | 'business', partyId: string): Promise<Exporter | Business | undefined> {
    return kind === 'exporter' ? partyMockService.getExporterById(partyId) : partyMockService.getBusinessById(partyId)
  },

  async getBranchById(kind: 'exporter' | 'business', ownerId: string, branchId: string): Promise<Branch | undefined> {
    if (!ownerId || !branchId) return delay(undefined, 60)
    const party = await partyMockService.getPartyById(kind, ownerId)
    return party?.branches.find((branch) => String(branch.id) === branchId)
  },

  async saveExporter(
    input: Omit<Exporter, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }
  ): Promise<Exporter> {
    const saved = saveExporter(input)
    return delay(saved, 180)
  },

  async saveBusiness(
    input: Omit<Business, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }
  ): Promise<Business> {
    const saved = saveBusiness(input)
    return delay(saved, 180)
  },

  async saveBranch(
    kind: 'exporter' | 'business',
    ownerId: number,
    input: Omit<Branch, 'id'> & { id?: number }
  ): Promise<Branch> {
    const saved = saveBranch(kind, ownerId, input)
    return delay(saved, 180)
  },

  async searchLoadingPorts(query: string): Promise<PortOption[]> {
    const q = query.trim().toLowerCase()
    const portsList = loadingPorts.filter((port) => port.code.startsWith('IN'))
    const filtered = portsList.filter(
      (port) => port.name.toLowerCase().includes(q) || port.code.toLowerCase().includes(q)
    )
    return delay(filtered)
  },

  async searchDestinationPorts(query: string): Promise<PortOption[]> {
    const q = query.trim().toLowerCase()
    const filtered = ports.filter((port) => port.name.toLowerCase().includes(q) || port.code.toLowerCase().includes(q))
    return delay(filtered)
  },

  async getPortByCode(code: string): Promise<PortOption | undefined> {
    if (!code) return delay(undefined, 60)
    return delay(
      allPorts.find((port) => port.code === code),
      100
    )
  }
}
