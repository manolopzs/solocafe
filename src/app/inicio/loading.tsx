import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the shop directory: header row, greeting, one shop card.
export default function InicioLoading() {
  return (
    <main className="min-h-screen bg-background pb-tabs">
      <div className="flex h-14 items-center justify-between px-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
      <div className="px-5 pt-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-8 h-6 w-32" />
        <div className="mt-4 overflow-hidden rounded-card bg-surface-elevated">
          <Skeleton className="h-[184px] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
      </div>
    </main>
  )
}
