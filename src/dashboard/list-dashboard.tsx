import { routes } from '@/shared/route-paths'
import { invoiceTotal, SavedBill } from '@/shipping-bills/model'
import { shippingBillService } from '@/shipping-bills/shipping-bill-service'
import { useQuery } from 'core/react-query'
import { navigate } from 'core/routing'
import { toast } from 'core/toast-manager'
import { useState } from 'react'
import { Badge } from 'ui/basic/badge'
import { Button } from 'ui/basic/button'
import { Card, CardContent } from 'ui/basic/card'
import { Table } from 'ui/basic/table'
import { Input } from 'ui/inputs/input'
import { AlertDanger } from 'ui/notify/alert'
import { LoadingSpinner } from 'ui/notify/loading-spinner'

export default function ListDashboard() {
  const [search, setSearch] = useState('')
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const billsQuery = useQuery({
    queryKey: ['shipping-bills'],
    queryFn: () => shippingBillService.list()
  })

  const bills = billsQuery.data ?? []

  async function handleRefresh() {
    const res = await billsQuery.refetch()
    if (res.data) {
      toast.success(`Loaded ${res.data.length} shipping bills`)
    }
  }

  async function handleDownloadFlatFile(bill: SavedBill) {
    try {
      setDownloadingId(bill.id)
      await shippingBillService.downloadFlatFile(bill.id, bill)
      const label = bill.values.jobNumber ?? bill.id
      toast.success(`Flat file (.sb) generated and downloaded for #${label}`)
    } catch {
      toast.error('Failed to generate flat file')
    } finally {
      setDownloadingId(null)
    }
  }

  const normalizedQuery = search.trim().toLowerCase()
  const filtered = bills.filter((bill) => {
    if (!normalizedQuery) return true
    const exporter = bill.values.exporterName ?? ''
    const consignee = bill.values.consigneeName ?? ''
    return [
      bill.id,
      bill.values.jobNumber,
      exporter,
      consignee,
      bill.values.loadingPort,
      bill.values.finalDestinationPort,
      ...bill.values.invoices.map((invoice) => invoice.invoiceNumber)
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  })

  const uniqueExportersCount = new Set(bills.map((b) => b.values.exporterName ?? b.values.exporterId).filter(Boolean))
    .size

  const uniqueConsigneesCount = new Set(
    bills.map((b) => b.values.consigneeName ?? b.values.consigneeId).filter(Boolean)
  ).size

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Shipping bills</h1>
          <p className="mt-1 text-sm text-gray-500">Create and continue the shipping bill step of each export job.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void handleRefresh()} disabled={billsQuery.isFetching}>
            {billsQuery.isFetching ? 'Syncing...' : 'Sync from API'}
          </Button>
          <Button onClick={() => navigate(routes.shippingBillNew)}>+ New shipping bill</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Shipping bills</p>
            <p className="mt-1 text-2xl font-semibold">{billsQuery.isLoading ? '—' : bills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Exporters</p>
            <p className="mt-1 text-2xl font-semibold">{billsQuery.isLoading ? '—' : uniqueExportersCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500">Businesses / Consignees</p>
            <p className="mt-1 text-2xl font-semibold">{billsQuery.isLoading ? '—' : uniqueConsigneesCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="w-full max-w-sm">
              <Input
                label="Search bills"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Job, invoice, exporter or consignee"
              />
            </div>
            {!billsQuery.isLoading && !billsQuery.isError && (
              <span className="text-sm text-gray-500">
                {filtered.length} {filtered.length === 1 ? 'bill' : 'bills'}
              </span>
            )}
          </div>

          {billsQuery.isLoading ? (
            <LoadingSpinner message="Loading shipping bills..." />
          ) : billsQuery.isError ? (
            <div className="space-y-3">
              <AlertDanger
                title="Could not load shipping bills"
                description={
                  billsQuery.error instanceof Error
                    ? billsQuery.error.message
                    : 'An unexpected error occurred while fetching shipping bills.'
                }
              />
              <div>
                <Button variant="outline" size="sm" onClick={() => void billsQuery.refetch()}>
                  Try again
                </Button>
              </div>
            </div>
          ) : filtered.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Exporter → Consignee</th>
                  <th>Route</th>
                  <th>Invoices</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill) => {
                  const rawExporter = bill.values.exporterName?.trim()
                  const rawConsignee = bill.values.consigneeName?.trim()
                  const exporterName = rawExporter !== undefined && rawExporter !== '' ? rawExporter : '—'
                  const consigneeName = rawConsignee !== undefined && rawConsignee !== '' ? rawConsignee : '—'
                  const loadingPortLabel = bill.values.loadingPort ? bill.values.loadingPort : '—'
                  const destPortLabel = bill.values.finalDestinationPort ? bill.values.finalDestinationPort : '—'
                  const total = bill.values.invoices.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)
                  const updatedTime = bill.updated ? new Date(bill.updated).getTime() : Number.NaN
                  const updatedLabel = !Number.isNaN(updatedTime) ? new Date(updatedTime).toLocaleDateString() : '—'

                  return (
                    <tr key={bill.id}>
                      <td className="font-medium">
                        {bill.values.jobNumber ? `#${bill.values.jobNumber}` : `Bill #${bill.id}`}
                        <span className="block text-xs font-normal text-gray-500">{bill.values.jobDate}</span>
                      </td>
                      <td>
                        {exporterName}
                        <span className="block text-xs text-gray-500">to {consigneeName}</span>
                      </td>
                      <td>
                        {loadingPortLabel} → {destPortLabel}
                      </td>
                      <td>
                        {bill.values.invoices.length}
                        <span className="block text-xs text-gray-500">
                          {total.toLocaleString(undefined, { maximumFractionDigits: 2 })} across items
                        </span>
                      </td>
                      <td>
                        <Badge variant="secondary">Draft</Badge>
                      </td>
                      <td>{updatedLabel}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={downloadingId === bill.id}
                            onClick={() => void handleDownloadFlatFile(bill)}>
                            {downloadingId === bill.id ? 'Downloading...' : 'Flat File'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(routes.toShippingBillEdit(bill.id))}>
                            Open
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
              <p className="font-medium">{search ? 'No matching shipping bills' : 'No shipping bills yet'}</p>
              <p className="mt-1 text-sm text-gray-500">
                {search ? 'Try another job number or party name.' : 'Create a bill to start an export job.'}
              </p>
              {search ? (
                <Button variant="outline" className="mt-4" onClick={() => setSearch('')}>
                  Clear search
                </Button>
              ) : (
                <Button className="mt-4" onClick={() => navigate(routes.shippingBillNew)}>
                  Create shipping bill
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
