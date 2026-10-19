import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function AccountLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-6">
      <div className="mx-auto max-w-xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
        <Card className="space-y-4 p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </Card>
      </div>
    </main>
  )
}
