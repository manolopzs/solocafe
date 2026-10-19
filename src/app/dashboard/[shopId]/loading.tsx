import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="space-y-8 px-5 py-6 md:px-8 md:py-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-56" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="space-y-2 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-2 flex-1" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </Card>
        <Card className="space-y-4 p-6">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
