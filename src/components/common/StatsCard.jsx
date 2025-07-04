import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Badge } from '../ui/badge'

export function StatsCard({
  title,
  description,
  icon: Icon,
  iconColor,
  total,
  active,
  inactive,
  totalColor,
}) {
  return (
    <Card>
      <CardHeader className="card-header-standard">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="flex-between gap-standard">
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-xs">총</span>
            <span className={`text-lg font-bold ${totalColor}`}>{total}</span>
          </div>
          <div className="flex flex-col items-center">
            <Badge variant="success" className="mb-1">
              활성
            </Badge>
            <span className="font-bold text-green-600">{active}</span>
          </div>
          <div className="flex flex-col items-center">
            <Badge variant="destructive" className="mb-1">
              비활성
            </Badge>
            <span className="font-bold text-gray-500">{inactive}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
