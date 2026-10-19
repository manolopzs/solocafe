import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function AccountOrdersLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-6">
      <div className="mx-auto max-w-xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </main>
  )
}
