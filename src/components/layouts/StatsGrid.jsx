export function StatsGrid({ 
  children, 
  columns = 3, 
  className = '' 
}) {
  const gridClasses = {
    2: 'table-grid',
    3: 'stats-grid', 
    4: 'stats-grid-4'
  }

  const gridClass = gridClasses[columns] || 'stats-grid'

  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  )
}