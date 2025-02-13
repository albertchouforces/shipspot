import { Scenario } from '../types'

// Helper function to ensure all required fields are present and valid
const ensureCategory = (scenario: Partial<Scenario>): Scenario => ({
  id: scenario.id || String(Date.now()),
  title: scenario.title?.trim() || 'Untitled Scenario',
  category: scenario.category?.trim() || 'Uncategorized',
  questionImage: scenario.questionImage || null,
  answerImage: scenario.answerImage || null,
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
    id: "1deck",
    title: "1 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/1Deck.png",
    answerImage: "images/Halifax/1DeckA.png",
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "2deck",
    title: "2 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/2Deck.png",
    answerImage: "images/Halifax/2DeckA.png",
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "3deck",
    title: "3 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/3Deck.png",
    answerImage: "images/Halifax/3DeckA.png",
    markers: [],
    availableEquipment: ["Halon", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "4deck",
    title: "4 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/4Deck.png",
    answerImage: "images/Halifax/4DeckA.png",
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "AFFF/Halon", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "scenario6",
    title: "Forward Deck Equipment",
    category: "Harry DeWolf-class",
    questionImage: "images/q1.png",
    answerImage: "images/a1.png",
    markers: [],
    availableEquipment: ["fire-extinguisherA", "fire-extinguisherB", "fire-extinguisherC", "fire-extinguisherD", "hose-station"]
  }
].map(scenario => ensureCategory(scenario))

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
