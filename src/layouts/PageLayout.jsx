import { PageHeader } from '@/components/common/PageHeader'

export function PageLayout({
  title,
  description,
  icon,
  action,
  children,
  className = '',
}) {
  return (
    <div className={`page-layout ${className}`}>
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        action={action}
      />
      {children}
    </div>
  )
}
