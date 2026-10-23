import { RrCaretDown } from 'icons/rr/fi-rr-caret-down'
import { useEffect, useRef, useState } from 'react'
import { getFormContext, getNestedSchema, Path, RegisterOptions, useController } from 'ui/form'
import { InputError } from 'ui/inputs/error'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/interactive/popover'
import { PopoverContext } from 'ui/interactive/popover-context'
import { clsxJoin, getContext } from 'ui/utils'
import type { AsyncOption } from './form-types'
import type { ShippingBillFormValues } from './model'

interface AsyncPartySelectProps {
  name: Path<ShippingBillFormValues>
  placeholder?: string
  disabled?: boolean
  className?: string
  rules?: RegisterOptions<ShippingBillFormValues>
  deps?: React.DependencyList
  fetchOptions: (query: string) => Promise<AsyncOption[]>
  getInitialLabel?: (id: string) => Promise<string>
}

export function AsyncPartySelect({
  name,
  placeholder = 'Search...',
  disabled = false,
  className,
  rules,
  deps = [],
  fetchOptions,
  getInitialLabel
}: AsyncPartySelectProps) {
  const ctx = getFormContext<ShippingBillFormValues>()
  const schemaRules = getNestedSchema(name, ctx.schema) as RegisterOptions<ShippingBillFormValues> | undefined
  const {
    field: { onChange, value, ref }
  } = useController({
    name,
    control: ctx.hooks.control,
    rules: schemaRules ?? rules,
    disabled
  })

  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<AsyncOption[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCounter, setRetryCounter] = useState(0)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const fetchOptionsRef = useRef(fetchOptions)
  fetchOptionsRef.current = fetchOptions

  const getInitialLabelRef = useRef(getInitialLabel)
  getInitialLabelRef.current = getInitialLabel

  const stringValue = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''

  useEffect(() => {
    let active = true
    if (stringValue) {
      if (getInitialLabelRef.current) {
        void getInitialLabelRef
          .current(stringValue)
          .then((lbl) => {
            if (active && lbl) setSelectedLabel(lbl)
          })
          .catch(() => {
            if (active) setSelectedLabel(stringValue)
          })
      } else {
        const found = options.find((o) => o.value === stringValue)
        if (found) setSelectedLabel(found.label)
      }
    } else {
      setSelectedLabel('')
    }
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringValue, ...deps])

  useEffect(() => {
    if (!isOpen && !query) return

    let active = true
    setLoading(true)
    setErrorMessage(null)

    const timer = setTimeout(() => {
      void fetchOptionsRef
        .current(query)
        .then((results) => {
          if (active) {
            setOptions(results)
            setLoading(false)
          }
        })
        .catch((err: unknown) => {
          if (active) {
            setOptions([])
            setErrorMessage(err instanceof Error ? err.message : 'Failed to load options')
            setLoading(false)
          }
        })
    }, 180)

    return () => {
      active = false
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isOpen, retryCounter, ...deps])

  return (
    <div>
      <input type="hidden" name={name} value={stringValue} ref={ref} disabled={disabled} />
      <Popover placement="bottom-start" fallbackPlacements={['top-start']} onOpenCallback={(open) => setIsOpen(open)}>
        <PopoverTrigger
          className={clsxJoin(
            'outline-focus-select group flex w-full cursor-pointer items-center justify-between rounded border border-gray-200 pr-2 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50',
            className ?? 'bg-white',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled}>
          <div className="flex items-center p-2 text-sm">
            <span className={selectedLabel ? 'font-medium text-gray-900' : 'text-gray-400'}>
              {selectedLabel ? selectedLabel : placeholder}
            </span>
          </div>
          <RrCaretDown className="size-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
        </PopoverTrigger>
        <InputError<ShippingBillFormValues> name={name} />
        <PopoverContent className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="focus:border-primary-500 focus:ring-primary-500 w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:ring-1"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {loading ? (
              <div className="p-3 text-center text-xs text-gray-500">Searching mock service...</div>
            ) : errorMessage ? (
              <div className="space-y-1.5 p-3 text-center text-xs text-red-600">
                <p>{errorMessage}</p>
                <button
                  type="button"
                  className="text-primary-700 font-medium underline"
                  onClick={() => setRetryCounter((n) => n + 1)}>
                  Retry
                </button>
              </div>
            ) : options.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">No matching results found</div>
            ) : (
              options.map((opt) => (
                <PopoverOptionItem
                  key={opt.value}
                  option={opt}
                  isSelected={stringValue === opt.value}
                  onSelect={(selected) => {
                    onChange(selected.value)
                    ctx.hooks.setValue(name, selected.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    })
                    setSelectedLabel(selected.label)
                    setQuery('')
                  }}
                />
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface PopoverOptionItemProps {
  option: AsyncOption
  isSelected: boolean
  onSelect: (opt: AsyncOption) => void
}

function PopoverOptionItem({ option, isSelected, onSelect }: PopoverOptionItemProps) {
  const { setOpen } = getContext(PopoverContext)

  return (
    <div
      onClick={() => {
        onSelect(option)
        setOpen(false)
      }}
      className={clsxJoin(
        'flex cursor-pointer flex-col rounded p-2 text-sm transition-colors',
        isSelected ? 'bg-primary-50 text-primary-900 font-semibold' : 'text-gray-950 hover:bg-gray-100'
      )}>
      <span>{option.label}</span>
      {option.sublabel && <span className="text-xs text-gray-500">{option.sublabel}</span>}
    </div>
  )
}
