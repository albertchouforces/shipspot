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
  answerLayers: (scenario.answerLayers || []).map(layer => ({
    ...layer,
    image: addVersionToUrl(layer.image) || ''
  })),
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
    answerLayers: [
      {
        image: "images/Halifax/01DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/Halifax/01DeckA-H.png",
        equipmentId: "Halon"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon"]
  },
  {
    id: "1deck",
    title: "1 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/1Deck.png",
    answerLayers: [
      {
        image: "images/Halifax/1DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/Halifax/1DeckA-H.png",
        equipmentId: "Halon"
      },
      {
        image: "images/Halifax/1DeckA-A.png",
        equipmentId: "AFFF-system"
      },
      {
        image: "images/Halifax/1DeckA-Q.png",
        equipmentId: "Quartzoid/Gallay Range Guard"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "2deck",
    title: "2 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/2Deck.png",
    answerLayers: [
      {
        image: "images/Halifax/2DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/Halifax/2DeckA-H.png",
        equipmentId: "Halon"
      },
      {
        image: "images/Halifax/2DeckA-A.png",
        equipmentId: "AFFF-system"
      },
      {
        image: "images/Halifax/2DeckA-Q.png",
        equipmentId: "Quartzoid/Gallay Range Guard"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "3deck",
    title: "3 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/3Deck.png",
    answerLayers: [
      {
        image: "images/Halifax/3DeckA-H.png",
        equipmentId: "Halon"
      },
      {
        image: "images/Halifax/3DeckA-Q.png",
        equipmentId: "Quartzoid/Gallay Range Guard"
      }
    ],
    markers: [],
    availableEquipment: ["Halon", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "4deck",
    title: "4 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/4Deck.png",
    answerLayers: [
      {
        image: "images/Halifax/4DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/Halifax/4DeckA-H.png",
        equipmentId: "Halon"
      },
      {
        image: "images/Halifax/4DeckA-A.png",
        equipmentId: "AFFF-system"
      },
      {
        image: "images/Halifax/4DeckA-AH.png",
        equipmentId: "AFFF/Halon"
      },
      {
        image: "images/Halifax/4DeckA-Q.png",
        equipmentId: "Quartzoid/Gallay Range Guard"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "AFFF/Halon", "Quartzoid/Gallay Range Guard"]
  },
  {
    id: "hwd01deck",
    title: "01 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/q1.png",
    answerLayers: [
      {
        image: "images/a1.png",
        equipmentId: "fire-extinguisherA"
      },
      {
        image: "images/a1.png",
        equipmentId: "hose-station"
      }
    ],
    markers: [],
    availableEquipment: ["fire-extinguisherA", "fire-extinguisherB", "fire-extinguisherC", "fire-extinguisherD", "hose-station"]
  }
].map(scenario => {
  const processed = ensureCategory(scenario)
  // Add cache-busting query parameter to image URLs
  return {
    ...processed,
    questionImage: processed.questionImage ? `${processed.questionImage}?v=${VERSION}` : null,
    answerLayers: processed.answerLayers.map(layer => ({
      ...layer,
      image: `${layer.image}?v=${VERSION}`
    }))
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
