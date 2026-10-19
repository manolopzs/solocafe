import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function OrderStatusLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-32" />
        </div>
        <Card className="space-y-4 p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </Card>
      </div>
    </main>
  )
}
