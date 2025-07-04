export function PageHeader({
  title,
  description,
  action,
  icon: Icon,
  className = '',
}) {
  if (action) {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="rounded-lg bg-blue-100 p-2">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-lg bg-blue-100 p-2">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
