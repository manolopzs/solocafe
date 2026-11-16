import { SoloIconTile } from '@/components/brand/solo-cafe-logo'

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <SoloIconTile size={72} className="animate-pulse" />
      <p className="text-lg font-medium text-muted-foreground">Cargando...</p>
    </div>
  )
}
