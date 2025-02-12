export interface Category {
  id: string
  name: string
  description?: string
  order: number
}

export const categories: Category[] = [
  {
    id: 'harry-dewolf',
    name: 'Harry DeWolf-class',
    description: 'Arctic and Offshore Patrol Ship',
    order: 0
  },
  {
    id: 'halifax',
    name: 'Halifax-class',
    description: 'Patrol Frigate',
    order: 1
  }
]

export const UNCATEGORIZED_ID = 'uncategorized'
export const UNCATEGORIZED: Category = {
  id: UNCATEGORIZED_ID,
  name: 'Uncategorized',
  order: Number.MAX_SAFE_INTEGER
}

export function getCategoryById(id: string): Category {
  return categories.find(cat => cat.id === id) || UNCATEGORIZED
}

export function normalizeCategoryId(id: string | null | undefined): string {
  if (!id) return UNCATEGORIZED_ID
  return id.toLowerCase().trim().replace(/\s+/g, '-')
}

export function validateCategory(categoryId: string | null | undefined): string {
  const normalizedId = normalizeCategoryId(categoryId)
  return categories.some(cat => cat.id === normalizedId) ? normalizedId : UNCATEGORIZED_ID
}

export function getAllCategories(): Category[] {
  return [...categories, UNCATEGORIZED].sort((a, b) => a.order - b.order)
}
