import { cn } from '@/lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground border-border rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-md',
        className,
      )}
      {...props}
    />
  )
}
Card.displayName = 'Card'

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn('p-6 pb-4', className)}
      {...props}
    />
  )
}
CardHeader.displayName = 'CardHeader'

function CardTitle({ className, ...props }) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        'text-lg leading-none font-semibold tracking-tight',
        className,
      )}
      {...props}
    />
  )
}
CardTitle.displayName = 'CardTitle'

function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-muted-foreground mt-1 text-sm', className)}
      {...props}
    />
  )
}
CardDescription.displayName = 'CardDescription'

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}
CardAction.displayName = 'CardAction'

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
}
CardContent.displayName = 'CardContent'

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
