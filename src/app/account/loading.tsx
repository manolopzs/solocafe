import { Skeleton } from '@/components/ui/skeleton'

export default function AccountLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-8 h-10 w-48" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-6 h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </main>
  )
}
