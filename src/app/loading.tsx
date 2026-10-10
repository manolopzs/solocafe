import { Icon } from '@/components/ui/icon'

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <Icon name="coffee" className="h-10 w-10 animate-pulse text-accent" />
      <p className="text-lg font-medium text-muted-foreground">Cargando...</p>
    </div>
  )
}
