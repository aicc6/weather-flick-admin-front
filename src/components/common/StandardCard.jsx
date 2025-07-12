import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function StandardCard({
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-500',
  children,
  className = '',
}) {
  return (
    <Card className={className}>
      <CardHeader className="card-header-standard">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
