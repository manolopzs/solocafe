import { Skeleton } from '@/components/ui/skeleton'

export default function OrderStatusLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-xl">
        <Skeleton className="h-4 w-28" />
        <div className="mt-8 flex gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="mt-8 h-12 w-40" />
        <Skeleton className="mt-8 h-28 w-full rounded-3xl" />
        <Skeleton className="mt-6 h-24 w-full" />
      </div>
    </main>
  )
}
