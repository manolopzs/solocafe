import { Skeleton } from '@/components/ui/skeleton'

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="relative overflow-hidden bg-surface px-4 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-6">
        <div className="relative mx-auto max-w-3xl">
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="h-16 w-16 shrink-0 rounded-2xl sm:h-20 sm:w-20" />
            <div className="min-w-0 flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md px-4 py-3 sm:px-5">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Skeleton className="h-10 w-24 shrink-0 rounded-full" />
            <Skeleton className="h-10 w-28 shrink-0 rounded-full" />
            <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-5 py-7">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
