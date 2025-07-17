import { memo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * StatsCard 로딩 스켈레톤
 */
export const StatsCardSkeleton = memo(({ className }) => {
  return (
    <Card className={cn('transition-all duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <Skeleton className="mb-1 h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="mb-1 h-3 w-8" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="mb-1 h-5 w-16 rounded-full" />
            <Skeleton className="h-6 w-10" />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="mb-1 h-5 w-12 rounded-full" />
            <Skeleton className="h-6 w-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

StatsCardSkeleton.displayName = 'StatsCardSkeleton'
