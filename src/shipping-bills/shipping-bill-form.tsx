import { routes } from '@/shared/route-paths'
import { useFieldArray, useForm } from 'core/form'
import { Form, SubmitButton } from 'core/form/components'
import { queryClient, useQuery } from 'core/react-query'
import { navigate, useParams } from 'core/routing'
import { toast } from 'core/toast-manager'
import { useEffect, useState } from 'react'
import { Button } from 'ui/basic/button'
import { Tabs, TabsList, TabsTrigger } from 'ui/interactive/tabs'
import { AlertDanger } from 'ui/notify/alert'
import { LoadingSpinner } from 'ui/notify/loading-spinner'
import { ContainersPackingSection } from './containers-packing-section'
import { DetailsTab } from './details-tab'
import { DocumentsLicensesSection } from './documents-licenses-section'
import { PersistentTab } from './form-primitives'
import type { QuickAdd, QuickBranch } from './form-types'
import { InvoiceEditor } from './invoice-editor'
import { defaultShippingBillLookups, lookupService, ShippingBillLookups } from './lookup-service'
import { Branch, Business, emptyBill, emptyInvoice, Exporter, SavedBill, ShippingBillFormValues } from './model'
import { BranchDialog, PartyDialog } from './party-dialogs'
import { shippingBillService } from './shipping-bill-service'
import { billSchema, resolveFirstErrorTab } from './validation'
import { workflowSteps } from './workflow'

interface BillEditorProps {
  bill?: SavedBill
  lookups: ShippingBillLookups
}

function BillEditor({ bill, lookups }: BillEditorProps) {
  const formCtx = useForm<ShippingBillFormValues>(billSchema, { defaultValues: bill?.values ?? emptyBill() })
  const { control, setValue, formState } = formCtx.hooks
  const { errors, submitCount } = formState
  const values = formCtx.hooks.watch()

  const { fields: invoices, append: addInvoice, remove: removeInvoice } = useFieldArray({ control, name: 'invoices' })
  const {
    fields: containers,
    append: addContainer,
    remove: removeContainer
  } = useFieldArray({ control, name: 'containers' })
  const {
    fields: packingRanges,
    append: addPackingRange,
    remove: removePackingRange
  } = useFieldArray({ control, name: 'packingRanges' })
  const {
    fields: documents,
    append: addDocument,
    remove: removeDocument
  } = useFieldArray({ control, name: 'documents' })
  const { fields: licenses, append: addLicense, remove: removeLicense } = useFieldArray({ control, name: 'licenses' })

  const [activeTab, setActiveTab] = useState('details')
  const [draftId, setDraftId] = useState<number | undefined>(bill?.id)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [partyVersion, setPartyVersion] = useState(0)
  const [quickAdd, setQuickAdd] = useState<QuickAdd | null>(null)
  const [quickBranch, setQuickBranch] = useState<QuickBranch | null>(null)

  useEffect(() => {
    if (!submitCount || !Object.keys(errors).length) return
    toast.error('Please check the required fields')
    const targetTab = resolveFirstErrorTab(errors)
    if (targetTab) {
      setActiveTab(targetTab)
    }
  }, [submitCount, errors])

  async function persistBill(data: ShippingBillFormValues): Promise<SavedBill> {
    const saved = await shippingBillService.save(data, draftId)
    setDraftId(saved.id)
    queryClient.setQueryData(['shipping-bill', String(saved.id)], saved)
    await queryClient.invalidateQueries({ queryKey: ['shipping-bills'] })
    return saved
  }

  async function handleSave(data: ShippingBillFormValues) {
    try {
      const saved = await persistBill(data)
      formCtx.hooks.reset(saved.values)
      toast.success(bill ? 'Shipping bill updated' : 'Shipping bill created')
      navigate(routes.toShippingBillEdit(saved.id))
    } catch {
      toast.error('Failed to save shipping bill')
    }
  }

  async function handleStepTransition(nextTab: string, showToast: boolean) {
    try {
      setIsSavingDraft(true)
      const current = formCtx.hooks.getValues()
      await persistBill(current)
      if (showToast) {
        toast.success('Details saved')
      }
      setActiveTab(nextTab)
    } catch {
      toast.error('Failed to save draft details')
    } finally {
      setIsSavingDraft(false)
    }
  }

  function handleQuickSaved(party: Exporter | Business) {
    setPartyVersion((v) => v + 1)
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
          <button
            type="button"
            className="mb-2 text-sm text-gray-500 hover:underline"
            onClick={() => navigate(routes.dashboard)}>
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
              values={values}
              containersCount={containers.length}
              lookups={lookups}
              partyVersion={partyVersion}
              onQuickAdd={(add) => setQuickAdd(add)}
              onAddBranch={(kind, ownerId, branchName) => setQuickBranch({ kind, ownerId, branchName })}
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
                lookups={lookups}
                partyVersion={partyVersion}
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
            <ContainersPackingSection
              formCtx={formCtx}
              containers={containers}
              packingRanges={packingRanges}
              lookups={lookups}
              onAddContainer={(container) => addContainer(container)}
              onRemoveContainer={(index) => removeContainer(index)}
              onAddPackingRange={(range) => addPackingRange(range)}
              onRemovePackingRange={(index) => removePackingRange(index)}
            />
            <DocumentsLicensesSection
              formCtx={formCtx}
              documents={documents}
              licenses={licenses}
              lookups={lookups}
              onAddDocument={(doc) => addDocument(doc)}
              onRemoveDocument={(index) => removeDocument(index)}
              onAddLicense={(license) => addLicense(license)}
              onRemoveLicense={(index) => removeLicense(index)}
            />
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
                disabled={isSavingDraft}
                onClick={() => void handleStepTransition(activeTab === 'documents' ? 'invoices' : 'details', false)}>
                Previous
              </Button>
            )}
            {activeTab !== 'documents' ? (
              <Button
                type="button"
                loading={isSavingDraft}
                onClick={(e) => {
                  e.preventDefault()
                  void handleStepTransition(activeTab === 'details' ? 'invoices' : 'documents', true)
                }}>
                Save & Next
              </Button>
            ) : (
              <SubmitButton>Save changes</SubmitButton>
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
          onSaved={(branch: Branch) => {
            setPartyVersion((v) => v + 1)
            setValue(quickBranch.branchName, String(branch.id), { shouldValidate: true })
          }}
        />
      )}
    </div>
  )
}

export default function ShippingBillPage() {
  const { id } = useParams<{ id?: string }>()

  const lookupsQuery = useQuery({
    queryKey: ['shipping-bill-lookups'],
    queryFn: () => lookupService.getFormLookups()
  })

  const billQuery = useQuery({
    queryKey: ['shipping-bill', id ?? 'new'],
    queryFn: () => (id ? shippingBillService.getById(id) : Promise.resolve(null)),
    enabled: Boolean(id)
  })

  if (lookupsQuery.isLoading || (Boolean(id) && billQuery.isLoading)) {
    return <LoadingSpinner message="Loading shipping bill..." />
  }

  if (lookupsQuery.isError || billQuery.isError) {
    const err = billQuery.error ?? lookupsQuery.error
    return (
      <div className="space-y-4">
        <AlertDanger
          title="Failed to load shipping bill"
          description={err instanceof Error ? err.message : 'An unexpected error occurred while loading data.'}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              void lookupsQuery.refetch()
              if (id) void billQuery.refetch()
            }}>
            Try again
          </Button>
          <Button onClick={() => navigate(routes.dashboard)}>Back to list</Button>
        </div>
      </div>
    )
  }

  if (id && !billQuery.data) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Shipping bill not found</h1>
        <p className="text-sm text-gray-500">No shipping bill with ID #{id} exists in local storage.</p>
        <Button onClick={() => navigate(routes.dashboard)}>Back to list</Button>
      </div>
    )
  }

  return (
    <BillEditor
      key={id ?? 'new'}
      bill={billQuery.data ?? undefined}
      lookups={lookupsQuery.data ?? defaultShippingBillLookups}
    />
  )
}
