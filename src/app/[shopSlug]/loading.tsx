import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the menu: header row, title, category chips, 2-column square tiles.
export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background pb-bag">
      <div className="flex h-14 items-center justify-between px-5">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <header className="px-5 pt-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-56" />
      </header>
      <div className="mt-4 flex gap-2 px-5">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
      </div>
      <main className="px-5 pt-6">
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="aspect-square w-full rounded-tile" />
              <Skeleton className="mt-3 h-4 w-24" />
              <Skeleton className="mt-1.5 h-4 w-14" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
