import { Scenario } from '../types'

// Add version timestamp to force cache refresh
const VERSION = Date.now()

// Helper function to add version to image URLs
const addVersionToUrl = (url: string | null): string | null => {
  if (!url) return null
  return `${url}?v=${VERSION}`
}

// Helper function to ensure all required fields are present and valid
const ensureCategory = (scenario: Partial<Scenario>): Scenario => ({
  id: scenario.id || String(Date.now()),
  title: scenario.title?.trim() || 'Untitled Scenario',
  category: scenario.category?.trim() || 'Uncategorized',
  questionImage: addVersionToUrl(scenario.questionImage || null),
  answerImage: addVersionToUrl(scenario.answerImage || null),
  markers: scenario.markers || [],
  availableEquipment: scenario.availableEquipment || []
})

// Predefined scenarios with consistent categorization
export const predefinedScenarios: Scenario[] = [
  {
    id: "01deck",
    title: "01 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/01Deck.png",
    answerImage: "images/Halifax/01DeckA.png",
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon"]
  },
  {
    id: "h1deck",
    title: "1 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/1Deck.png",
    answerImage: "images/Halifax/1DeckA.png",
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "h2deck",
    title: "2 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/2Deck.png",
    answerImage: "images/Halifax/2DeckA.png",
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "h3deck",
    title: "3 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/3Deck.png",
    answerImage: "images/Halifax/3DeckA.png",
    markers: [],
    availableEquipment: ["Halon", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "h4deck",
    title: "4 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/4Deck.png",
    answerImage: "images/Halifax/4DeckA.png",
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "AFFF/Halon", "Quartzoid/Gallay Range Guard"]
  }
].map(scenario => {
  const processed = ensureCategory(scenario)
  // Add cache-busting query parameter to image URLs
  return {
    ...processed,
    questionImage: processed.questionImage ? `${processed.questionImage}?v=${VERSION}` : null,
    answerImage: processed.answerImage ? `${processed.answerImage}?v=${VERSION}` : null,
  }
})

// Helper function to sort scenarios by category and title
export const getSortedScenarios = (scenarios: Scenario[]): Scenario[] => {
  return [...scenarios].sort((a, b) => {
    // First sort by category
    const categoryComparison = a.category.localeCompare(b.category)
    if (categoryComparison !== 0) return categoryComparison
    
    // Then sort by title within each category
    return a.title.localeCompare(b.title)
  })
}

// Helper function to get unique categories from scenarios
export const getUniqueCategories = (scenarios: Scenario[]): string[] => {
  const categories = new Set(scenarios.map(s => s.category))
  return Array.from(categories).sort()
}
