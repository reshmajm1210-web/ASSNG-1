import {
  getDemoData,
  saveBranch as persistBranch,
  saveBusiness as persistBusiness,
  saveExporter as persistExporter,
  useDemoData
} from './demo-store'
import { delay } from './mock-network'
import { Branch, Business, Exporter, loadingPorts, PortOption, ports } from './model'

/**
 * Async mock service for parties (exporters, consignees/buyers/third parties),
 * their branches, and ports. Only this service and the shipping bill service may
 * touch the demo store; UI code must call these functions.
 */

export interface ExporterInput {
  id?: number
  name: string
  iec: string
  class: string
  type: string
  pan?: string
  tan?: string
  aeoNumber?: string
  website?: string
  notes?: string
  disabled?: boolean
  firstBranch?: Omit<Branch, 'id'>
}

export interface BusinessInput {
  id?: number
  name: string
  iec?: string
  isConsignee: boolean
  isBuyer: boolean
  isNotify: boolean
  isThirdParty: boolean
  firstBranch?: Omit<Branch, 'id'>
}

export const partyMockService = {
  /**
   * Search Exporters by name or IEC
   */
  async searchExporters(query: string): Promise<Exporter[]> {
    const { exporters } = getDemoData()
    const q = query.trim().toLowerCase()
    const filtered = exporters.filter(
      (item) => !item.disabled && (item.name.toLowerCase().includes(q) || item.iec.toLowerCase().includes(q))
    )
    return delay(filtered)
  },

  /**
   * Search Branches belonging to a specific Exporter ID
   */
  async searchExporterBranches(exporterId: string, query: string): Promise<Branch[]> {
    if (!exporterId) return delay([])
    const { exporters } = getDemoData()
    const exporter = exporters.find((item) => String(item.id) === exporterId)
    if (!exporter) return delay([])

    const q = query.trim().toLowerCase()
    const filtered = exporter.branches.filter(
      (branch) => branch.branchName.toLowerCase().includes(q) || branch.city.toLowerCase().includes(q)
    )
    return delay(filtered)
  },

  /**
   * Search Consignees by name
   */
  async searchConsignees(query: string): Promise<Business[]> {
    const { businesses } = getDemoData()
    const q = query.trim().toLowerCase()
    const filtered = businesses.filter((item) => item.isConsignee && item.name.toLowerCase().includes(q))
    return delay(filtered)
  },

  /**
   * Search Branches belonging to a specific Consignee ID
   */
  async searchConsigneeBranches(consigneeId: string, query: string): Promise<Branch[]> {
    if (!consigneeId) return delay([])
    const { businesses } = getDemoData()
    const consignee = businesses.find((item) => String(item.id) === consigneeId)
    if (!consignee) return delay([])

    const q = query.trim().toLowerCase()
    const filtered = consignee.branches.filter(
      (branch) => branch.branchName.toLowerCase().includes(q) || branch.city.toLowerCase().includes(q)
    )
    return delay(filtered)
  },

  /**
   * Fetch a single Exporter by ID (used for label resolution)
   */
  async getExporterById(exporterId: string): Promise<Exporter | undefined> {
    const { exporters } = getDemoData()
    return delay(
      exporters.find((item) => String(item.id) === exporterId),
      100
    )
  },

  /**
   * Fetch a single Consignee by ID (used for label resolution)
   */
  async getConsigneeById(consigneeId: string): Promise<Business | undefined> {
    const { businesses } = getDemoData()
    return delay(
      businesses.find((item) => String(item.id) === consigneeId),
      100
    )
  },

  /**
   * Create or update an Exporter (quick-add dialog)
   */
  async saveExporter(input: ExporterInput): Promise<Exporter> {
    return delay(persistExporter(input))
  },

  /**
   * Create or update a Business (consignee / buyer / third party quick-add dialog)
   */
  async saveBusiness(input: BusinessInput): Promise<Business> {
    return delay(persistBusiness(input))
  },

  /**
   * Add or update a branch of an exporter or business
   */
  async saveBranch(
    kind: 'exporter' | 'business',
    ownerId: number,
    branch: Omit<Branch, 'id'> & { id?: number }
  ): Promise<Branch> {
    return delay(persistBranch(kind, ownerId, branch))
  },

  /**
   * Search Port of Loading (Indian ports: code starts with 'IN')
   */
  async searchLoadingPorts(query: string): Promise<PortOption[]> {
    const q = query.trim().toLowerCase()
    const portsList = loadingPorts.filter((port) => port.code.startsWith('IN'))
    const filtered = portsList.filter(
      (port) => port.name.toLowerCase().includes(q) || port.code.toLowerCase().includes(q)
    )
    return delay(filtered)
  },

  /**
   * Search Final Destination Ports (all ports)
   */
  async searchDestinationPorts(query: string): Promise<PortOption[]> {
    const q = query.trim().toLowerCase()
    const filtered = ports.filter((port) => port.name.toLowerCase().includes(q) || port.code.toLowerCase().includes(q))
    return delay(filtered)
  },

  /**
   * Fetch Port by Code (used for label resolution)
   */
  async getPortByCode(code: string): Promise<PortOption | undefined> {
    return delay(
      ports.find((port) => port.code === code),
      100
    )
  }
}

/** Service-layer view over the mock store's parties; re-renders when quick-add dialogs save a party. */
export function useParties() {
  const { exporters, businesses } = useDemoData()
  return { exporters, businesses }
}
