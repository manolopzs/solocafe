import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-8 h-10 w-56" />
        <Skeleton className="h-4 w-40" />
        <div className="space-y-4 pt-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </main>
  )
}
