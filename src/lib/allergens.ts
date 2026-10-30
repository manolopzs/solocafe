export const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'Gluten',
  crustaceans: 'Crustáceos',
  eggs: 'Huevos',
  fish: 'Pescado',
  peanuts: 'Cacahuetes',
  soybeans: 'Soja',
  milk: 'Lácteos',
  nuts: 'Frutos de cáscara',
  celery: 'Apio',
  mustard: 'Mostaza',
  sesame: 'Sésamo',
  sulphites: 'Sulfitos',
  lupin: 'Altramuces',
  molluscs: 'Moluscos',
}

export const ALLERGEN_CODES = Object.keys(ALLERGEN_LABELS).sort()

export function allergenLabel(code: string): string {
  return ALLERGEN_LABELS[code] ?? code
}
