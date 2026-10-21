import Image from 'next/image'

export function ShopHero({ name, heroPhotoUrl }: { name: string; heroPhotoUrl?: string | null }) {
  if (!heroPhotoUrl) return null

  return (
    <div className="bg-background">
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <Image
          src={heroPhotoUrl}
          alt={`Foto de portada de ${name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
      </div>
    </div>
  )
}
