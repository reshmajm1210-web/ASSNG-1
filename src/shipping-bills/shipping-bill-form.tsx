/**
 * Shipping bill screen.
 *
 * This file is the *coordinator*: it owns the form state, the active tab, the
 * save workflow and the quick-add dialogs. Everything visual lives in the
 * extracted components, and everything data-related goes through the services:
 *
 *   DetailsTab / InvoiceEditor / ContainersTab / DocumentsTab / LicensesTab
 *        ↑ props (form context + reference data)
 *   BillEditor (this file)
 *        ↓ async calls
 *   referenceDataService · partyMockService · shippingBillService
 *
 * The three tabs are 1. Details, 2. Invoices & goods and 3. Others (containers,
 * packing list, supporting documents and licences).
 */

import { routes } from '@/shared/route-paths'
import { useFieldArray, useForm } from 'core/form'
import { Form } from 'core/form/components'
import { queryClient, useQuery } from 'core/react-query'
import { navigate, useParams } from 'core/routing'
import { toast } from 'core/toast-manager'
import { useEffect, useState } from 'react'
import { Button } from 'ui/basic/button'
import { Tabs, TabsList, TabsTrigger } from 'ui/interactive/tabs'
import { ContainersTab } from './containers-tab'
import { DetailsTab } from './details-tab'
import { DocumentsTab } from './documents-tab'
import { PersistentTab } from './form-sections'
import type { QuickAdd, QuickBranch } from './form-types'
import { InvoiceEditor } from './invoice-editor'
import { LicensesTab } from './licenses-tab'
import {
  emptyBill,
  emptyInvoice,
  type Branch,
  type Business,
  type Exporter,
  type SavedBill,
  type ShippingBillFormValues
} from './model'
import { BranchDialog, PartyDialog } from './party-dialogs'
import { emptyReferenceData, referenceDataService } from './reference-data-service'
import { billSchema } from './shipping-bill-schema'
import { shippingBillService } from './shipping-bill-service'
import { workflowSteps } from './workflow'

interface BillEditorProps {
  bill?: SavedBill
}

function BillEditor({ bill }: BillEditorProps) {
  const formCtx = useForm<ShippingBillFormValues>(billSchema, { defaultValues: bill?.values ?? emptyBill() })
  const { control, formState, setValue } = formCtx.hooks
  const values = formCtx.hooks.watch()
  const { fields: invoices, append: addInvoice, remove: removeInvoice } = useFieldArray({ control, name: 'invoices' })

  const referenceQuery = useQuery({ queryKey: ['reference-data'], queryFn: referenceDataService.loadReferenceData })
  const reference = referenceQuery.data ?? emptyReferenceData()

  const [activeTab, setActiveTab] = useState('details')
  const [draftId, setDraftId] = useState<number | undefined>(bill?.id)
  const [quickAdd, setQuickAdd] = useState<QuickAdd | null>(null)
  const [quickBranch, setQuickBranch] = useState<QuickBranch | null>(null)

  // Send the user to the tab that holds the first validation problem.
  useEffect(() => {
    if (!formState.submitCount || Object.keys(formState.errors).length === 0) return
    toast.error('Please check the required fields')
    if (
      [
        'jobDate',
        'exporterId',
        'exporterBranchId',
        'consigneeId',
        'consigneeBranchId',
        'loadingPort',
        'finalDestinationPort'
      ].some((field) => field in formState.errors)
    )
      setActiveTab('details')
    else if (formState.errors.invoices) setActiveTab('invoices')
    else if (
      formState.errors.containers ||
      formState.errors.packingRanges ||
      formState.errors.documents ||
      formState.errors.licenses
    )
      setActiveTab('documents')
    // otherwise: keep the user on whichever tab they submitted from
  }, [formState.submitCount, formState.errors])

  /**
   * Saved bills are cached by React Query with `staleTime: Infinity`, so the list
   * must be marked stale by hand; otherwise the dashboard would not show the bill
   * we just saved until the user pressed Refresh.
   */
  function refreshBillQueries() {
    void queryClient.invalidateQueries({ queryKey: ['shipping-bills'] })
    void queryClient.invalidateQueries({ queryKey: ['shipping-bill'] })
  }

  async function handleSave(data: ShippingBillFormValues) {
    try {
      const saved = await shippingBillService.save(data, draftId)
      setDraftId(saved.id)
      refreshBillQueries()
      toast.success(bill ? 'Shipping bill updated' : 'Shipping bill created')
      navigate(routes.toShippingBillEdit(saved.id))
    } catch (error) {
      // Keep the form editable: clear the submit flags and tell the user what happened.
      formCtx.hooks.reset(undefined, { keepValues: true })
      toast.error(error instanceof Error ? error.message : 'Failed to save shipping bill')
    }
  }

  /** Save the current values as a draft (used by "Previous" and "Save & Next"). */
  async function saveDraft(): Promise<boolean> {
    try {
      const saved = await shippingBillService.save(formCtx.hooks.getValues(), draftId)
      setDraftId(saved.id)
      refreshBillQueries()
      return true
    } catch (error) {
      formCtx.hooks.reset(undefined, { keepValues: true })
      toast.error(error instanceof Error ? error.message : 'Failed to save the draft')
      return false
    }
  }

  async function goToPreviousTab() {
    if (!(await saveDraft())) return
    setActiveTab(activeTab === 'documents' ? 'invoices' : 'details')
  }

  async function saveAndGoNext() {
    if (!(await saveDraft())) return
    toast.success('Details saved')
    setActiveTab(activeTab === 'details' ? 'invoices' : 'documents')
  }

  function handleQuickSaved(party: Exporter | Business) {
    if (!quickAdd || party.branches.length === 0) return
    const branchId = party.branches[0].id
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
              className={`rounded-lg border p-3 ${isShippingBill ? 'border-primary-300 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}>
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
            <DetailsTab formCtx={formCtx} reference={reference} onQuickAdd={setQuickAdd} onAddBranch={setQuickBranch} />
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
                reference={reference}
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
            <ContainersTab formCtx={formCtx} />
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
              <Button variant="outline" type="button" onClick={goToPreviousTab}>
                Previous
              </Button>
            )}
            {activeTab !== 'documents' ? (
              <Button type="button" onClick={saveAndGoNext}>
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
          key={`${quickAdd.kind}-${quickAdd.role ?? 'exporter'}-${quickAdd.invoiceIndex ?? 0}-${quickAdd.itemIndex ?? 0}`}
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
    queryFn: () => shippingBillService.get(id ?? ''),
    enabled: id !== undefined
  })

  if (id === undefined) return <BillEditor key="new" />

  if (billQuery.isLoading) return <p className="p-2 text-sm text-gray-500">Loading shipping bill #{id}...</p>

  if (billQuery.isError || !billQuery.data)
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Shipping bill not found</h1>
        <p className="text-sm text-gray-500">
          {billQuery.error instanceof Error ? billQuery.error.message : `Bill #${id} does not exist.`}
        </p>
        <Button onClick={() => navigate(routes.dashboard)}>Back to list</Button>
      </div>
    )

  return <BillEditor key={id} bill={billQuery.data} />
}
