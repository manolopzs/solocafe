import { Skeleton } from '@/components/ui/skeleton'

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <Skeleton className="h-56 w-full rounded-none sm:h-72" />
      <header className="px-4">
        <div className="mx-auto flex max-w-3xl items-start gap-3">
          <Skeleton className="-mt-9 h-[4.5rem] w-[4.5rem] shrink-0 rounded-3xl" />
          <div className="flex-1 space-y-2 pt-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </header>
      <div className="mt-6 flex gap-4 border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <main className="mx-auto max-w-3xl px-4 py-4">
        <Skeleton className="mb-2 h-7 w-40" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-border py-4">
            <Skeleton className="h-[104px] w-[104px] shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
