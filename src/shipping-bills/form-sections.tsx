/**
 * Small layout helpers shared by the form tabs.
 *
 * They are purely presentational; keeping them here avoids repeating the same
 * heading / collapsible / tab-panel markup in every tab component.
 */

interface SectionHeadingProps {
  title: string
  description?: string
}

/** Section title with an optional explanation line. */
export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-950">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  )
}

interface AdvancedProps {
  title: string
  children: React.ReactNode
  open?: boolean
  onToggle?: (isOpen: boolean) => void
}

/**
 * Collapsible "advanced" section. Optional fields live in here so the everyday
 * fields stay visible.
 */
export function Advanced({ title, children, open, onToggle }: AdvancedProps) {
  return (
    <details
      className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
      open={open}
      onToggle={(event) => onToggle?.(event.currentTarget.open)}>
      <summary className="cursor-pointer text-sm font-medium text-gray-700">{title}</summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

interface PersistentTabProps {
  value: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

/**
 * Tab panel that stays mounted when hidden, so React Hook Form keeps every field
 * registered and validates the whole bill on submit.
 */
export function PersistentTab({ value, activeTab, children, className }: PersistentTabProps) {
  return (
    <div role="tabpanel" hidden={activeTab !== value} className={`mt-3 ${className}`}>
      {children}
    </div>
  )
}
