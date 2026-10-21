import { routes } from '@/shared/route-paths'
import { useFieldArray, useForm } from 'core/form'
import { Form } from 'core/form/components'
import { queryClient, useQuery } from 'core/react-query'
import { navigate, useParams } from 'core/routing'
import { toast } from 'core/toast-manager'
import { useEffect, useState } from 'react'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Tabs, TabsList, TabsTrigger } from 'ui/interactive/tabs'
import { ContainersTab } from './containers-tab'
import { DetailsTab } from './details-tab'
import { DocumentsTab } from './documents-tab'
import { PersistentTab } from './form-sections'
import { QuickAdd, QuickBranch } from './form-types'
import { InvoiceEditor } from './invoice-editor'
import { LicensesTab } from './licenses-tab'
import { Branch, Business, emptyBill, emptyInvoice, Exporter, SavedBill, ShippingBillFormValues } from './model'
import { PackingTab } from './packing-tab'
import { BranchDialog, PartyDialog } from './party-dialogs'
import { useParties } from './party-mock-service'
import { shippingBillService } from './shipping-bill-service'
import { billSchema } from './shipping-bill-validation'
import { workflowSteps } from './workflow'

const DETAILS_TAB_FIELDS = [
  'jobDate',
  'exporterId',
  'exporterBranchId',
  'consigneeId',
  'consigneeBranchId',
  'loadingPort',
  'finalDestinationPort'
]

function BillEditor({ bill }: { bill?: SavedBill }) {
  const { businesses } = useParties()
  const formCtx = useForm<ShippingBillFormValues>(billSchema, { defaultValues: bill?.values ?? emptyBill() })
  const { control, setValue, formState } = formCtx.hooks
  const values = formCtx.hooks.watch()
  const { fields: invoices, append: addInvoice, remove: removeInvoice } = useFieldArray({ control, name: 'invoices' })
  const [activeTab, setActiveTab] = useState('details')
  const [draftId, setDraftId] = useState<number | undefined>(bill?.id)
  const [quickAdd, setQuickAdd] = useState<QuickAdd | null>(null)
  const [quickBranch, setQuickBranch] = useState<QuickBranch | null>(null)

  // Switch to the tab holding the first validation error after submit.
  useEffect(() => {
    if (!formState.submitCount || !Object.keys(formState.errors).length) return
    toast.error('Please check the required fields')
    if (DETAILS_TAB_FIELDS.some((field) => field in formState.errors)) setActiveTab('details')
    else if (formState.errors.invoices) setActiveTab('invoices')
    else if (
      formState.errors.containers ||
      formState.errors.packingRanges ||
      formState.errors.documents ||
      formState.errors.licenses
    )
      setActiveTab('documents')
  }, [formState.submitCount, formState.errors])

  function invalidateBillQueries() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['shipping-bills'] }),
      queryClient.invalidateQueries({ queryKey: ['shipping-bill'] })
    ])
  }

  async function handleSave(data: ShippingBillFormValues) {
    try {
      const { bill: saved } = await shippingBillService.save(data, draftId)
      setDraftId(saved.id)
      await invalidateBillQueries()
      toast.success(bill ? 'Shipping bill updated' : 'Shipping bill created')
      navigate(routes.toShippingBillEdit(saved.id))
    } catch {
      toast.error('Failed to save shipping bill')
    }
  }

  /** Saves a draft without submit validation (Save & Next / Previous buttons). */
  async function handleSaveDraft(): Promise<boolean> {
    try {
      const current = formCtx.hooks.getValues()
      const { bill: saved } = await shippingBillService.save(current, draftId)
      setDraftId(saved.id)
      await invalidateBillQueries()
      return true
    } catch {
      toast.error('Failed to save shipping bill')
      return false
    }
  }

  function handleQuickSaved(party: Exporter | Business) {
    const branchId = party.branches[0]?.id
    if (!quickAdd || !branchId) return
    if (quickAdd.kind === 'exporter') {
      setValue('exporterId', String(party.id), { shouldValidate: true })
      setValue('exporterBranchId', String(branchId), { shouldValidate: true })
    } else if (quickAdd.role === 'consignee') {
      setValue('consigneeId', String(party.id), { shouldValidate: true })
      setValue('consigneeBranchId', String(branchId), { shouldValidate: true })
    } else if (quickAdd.role === 'itemThirdParty' && quickAdd.invoiceIndex != null && quickAdd.itemIndex != null) {
      setValue(`invoices.${quickAdd.invoiceIndex}.items.${quickAdd.itemIndex}.itemThirdPartyId`, String(party.id), {
        shouldValidate: true
      })
      setValue(
        `invoices.${quickAdd.invoiceIndex}.items.${quickAdd.itemIndex}.itemThirdPartyBranchId`,
        String(branchId),
        { shouldValidate: true }
      )
    } else if (quickAdd.invoiceIndex != null) {
      const field = quickAdd.role === 'buyer' ? 'buyer' : 'thirdParty'
      setValue(`invoices.${quickAdd.invoiceIndex}.${field}Id`, String(party.id), { shouldValidate: true })
      setValue(`invoices.${quickAdd.invoiceIndex}.${field}BranchId`, String(branchId), { shouldValidate: true })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button className="mb-2 text-sm text-gray-500 hover:underline" onClick={() => navigate(routes.dashboard)}>
            ← Shipping bills
          </button>
          <h1 className="text-2xl font-semibold text-gray-950">
            {bill ? `Edit shipping bill #${bill.id}` : 'New shipping bill'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter the everyday details first. Open advanced sections only when needed.
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {workflowSteps.map((step, index) => {
          const isShippingBill = step.id === 'shipping-bill'
          return (
            <div
              key={step.id}
              className={`rounded-lg border p-3 ${
                isShippingBill ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-gray-50'
              }`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs">
                  {index + 1}
                </span>
                {step.title}
              </div>
              <p className="ml-8 text-xs text-gray-500">{step.description}</p>
            </div>
          )
        })}
      </div>
      <Form ctx={formCtx} handleSubmit={handleSave} className="space-y-5">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(String(value))}>
          <TabsList className="flex w-full justify-start overflow-x-auto">
            <TabsTrigger value="details">1. Details</TabsTrigger>
            <TabsTrigger value="invoices">2. Invoices & goods</TabsTrigger>
            <TabsTrigger value="documents">3. Others</TabsTrigger>
          </TabsList>

          <PersistentTab value="details" activeTab={activeTab} className="space-y-4">
            <DetailsTab
              formCtx={formCtx}
              onQuickAdd={setQuickAdd}
              onQuickBranch={setQuickBranch}
              containerCount={values.containers.length}
            />
          </PersistentTab>

          <PersistentTab value="invoices" activeTab={activeTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Invoices & goods</h2>
                <p className="text-sm text-gray-500">One invoice and one item are ready to fill in.</p>
              </div>
              <Button variant="outline" onClick={() => addInvoice(emptyInvoice())}>
                + Add invoice
              </Button>
            </div>
            {invoices.map((field, index) => (
              <InvoiceEditor
                key={field.id}
                formCtx={formCtx}
                index={index}
                invoice={values.invoices[index] ?? emptyInvoice()}
                businesses={businesses}
                onQuickAdd={(role, invoiceIndex, itemIndex) =>
                  setQuickAdd({ kind: 'business', role, invoiceIndex, itemIndex })
                }
                onAddBranch={(ownerId, branchName) => setQuickBranch({ kind: 'business', ownerId, branchName })}
                onRemove={() => removeInvoice(index)}
                canRemove={invoices.length > 1}
              />
            ))}
          </PersistentTab>

          <PersistentTab value="documents" activeTab={activeTab} className="space-y-4">
            <Card>
              <CardHeader title="Cargo & Package Detail" />
              <CardContent className="space-y-5">
                <ContainersTab formCtx={formCtx} />
                <PackingTab formCtx={formCtx} />
              </CardContent>
            </Card>
            <DocumentsTab formCtx={formCtx} />
            <LicensesTab formCtx={formCtx} />
          </PersistentTab>
        </Tabs>
        <div className="flex flex-wrap justify-between gap-2 border-t border-gray-200 pt-4">
          <Button variant="outline" type="button" onClick={() => navigate(routes.dashboard)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== 'details' && (
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  void handleSaveDraft().then((saved) => {
                    if (saved) setActiveTab(activeTab === 'documents' ? 'invoices' : 'details')
                  })
                }}>
                Previous
              </Button>
            )}
            {activeTab !== 'documents' ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  void handleSaveDraft().then((saved) => {
                    if (saved) {
                      toast.success('Details saved')
                      setActiveTab(activeTab === 'details' ? 'invoices' : 'documents')
                    }
                  })
                }}>
                Save & Next
              </Button>
            ) : (
              <Button type="submit">Save changes</Button>
            )}
          </div>
        </div>
      </Form>
      {quickAdd && (
        <PartyDialog
          key={`${quickAdd.kind}-${quickAdd.role ?? 'exporter'}-${quickAdd.invoiceIndex ?? 0}`}
          kind={quickAdd.kind}
          initialRole={quickAdd.role === 'itemThirdParty' ? 'thirdParty' : quickAdd.role}
          onClose={() => setQuickAdd(null)}
          onSaved={handleQuickSaved}
        />
      )}
      {quickBranch && (
        <BranchDialog
          key={`${quickBranch.kind}-${quickBranch.ownerId}`}
          kind={quickBranch.kind}
          ownerId={quickBranch.ownerId}
          onClose={() => setQuickBranch(null)}
          onSaved={(branch: Branch) => setValue(quickBranch.branchName, String(branch.id), { shouldValidate: true })}
        />
      )}
    </div>
  )
}

export default function ShippingBillPage() {
  const { id } = useParams<{ id?: string }>()
  const billQuery = useQuery({
    queryKey: ['shipping-bill', id],
    queryFn: () => shippingBillService.getById(id ?? ''),
    enabled: id != null
  })
  const bill = billQuery.data

  if (id && billQuery.isLoading) {
    return <p className="text-sm text-gray-500">Loading shipping bill...</p>
  }
  if (id && !bill) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Shipping bill not found</h1>
        <Button onClick={() => navigate(routes.dashboard)}>Back to list</Button>
      </div>
    )
  }
  return <BillEditor key={id ?? 'new'} bill={bill} />
}
