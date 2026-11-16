/** Header of /explore, which is also Inicio for a phone that hasn't visited a shop yet. */
export function ExploreIntro({ sort }: { sort: 'name' | 'distance' }) {
  return (
    <section className="px-4 pb-6 pt-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground">Elige tu cafetería</h1>
        <p className="mt-2 max-w-md text-base leading-6 text-muted-foreground">Pide desde aquí y recoge sin cola.</p>
        {sort === 'distance' && (
          <p className="mt-1 max-w-md text-sm leading-5 text-muted-foreground">Ordenadas de la más cercana a la más lejana.</p>
        )}
      </div>
    </section>
  )
}
