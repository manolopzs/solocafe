import { Skeleton } from '@/components/ui/skeleton'

export default function ExploreLoading() {
  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="mt-8 h-10 w-64" />
        <Skeleton className="mt-3 h-4 w-72" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl bg-surface">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
