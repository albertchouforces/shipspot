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
    id: "02deck",
    title: "02 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/02Deck.png",
    answerLayers: [
      {
        image: "images/Halifax/02DeckA-H.png",
        equipmentId: "Halon"
      }
    ],
    markers: [],
    availableEquipment: ["Halon"]
  },
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
        equipmentId: "Quartzoid"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "Quartzoid"]
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
        image: "images/Halifax/2DeckA-AH.png",
        equipmentId: "AFFF/Halon"
      },
      {
        image: "images/Halifax/2DeckA-Q.png",
        equipmentId: "Quartzoid"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "AFFF/Halon", "Quartzoid"]
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
        equipmentId: "Quartzoid"
      }
    ],
    markers: [],
    availableEquipment: ["Halon", "Quartzoid"]
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
        equipmentId: "Quartzoid"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon", "AFFF-system", "AFFF/Halon", "Quartzoid"]
  },
  {
    id: "5deck",
    title: "5 Deck",
    category: "Halifax-class",
    questionImage: "images/Halifax/5Deck.png",
    answerLayers: [
      {
        image: "images/Halifax/5DeckA-AH.png",
        equipmentId: "AFFF/Halon"
      }
    ],
    markers: [],
    availableEquipment: ["AFFF/Halon"]
  },
  {
    id: "hwd05deck",
    title: "05 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/HDW/05Deck.png",
    answerLayers: [
      {
        image: "images/HDW/05DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray"]
  },
  {
    id: "hwd04deck",
    title: "04 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/HDW/04Deck.png",
    answerLayers: [
      {
        image: "images/HDW/04DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray"]
  },
  {
    id: "hwd03deck",
    title: "03 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/HDW/03Deck.png",
    answerLayers: [
      {
        image: "images/HDW/03DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/HDW/03DeckA-A.png",
        equipmentId: "AFFF-system"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "AFFF-system"]
  },
  {
    id: "hwd02deck",
    title: "02 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/HDW/02Deck.png",
    answerLayers: [
      {
        image: "images/HDW/02DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/HDW/02DeckA-A.png",
        equipmentId: "AFFF-system"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "AFFF-system"]
  },
  {
    id: "hwd01deck",
    title: "01 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/HDW/01Deck.png",
    answerLayers: [
      {
        image: "images/HDW/01DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray"]
  },
  {
    id: "hwd1deck",
    title: "1 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/HDW/1Deck.png",
    answerLayers: [
      {
        image: "images/HDW/1DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/HDW/1DeckA-Q.png",
        equipmentId: "Quartzoid"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Quartzoid"]
  },
  {
    id: "hwd2deck",
    title: "2 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/HDW/2Deck.png",
    answerLayers: [
      {
        image: "images/HDW/2DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/HDW/2DeckA-H.png",
        equipmentId: "Halon"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon"]
  },
  {
    id: "hwd3deck",
    title: "3 Deck",
    category: "Harry DeWolf-class",
    questionImage: "images/HDW/3Deck.png",
    answerLayers: [
      {
        image: "images/HDW/3DeckA-M.png",
        equipmentId: "Magazine-Flood-and-Spray"
      },
      {
        image: "images/HDW/3DeckA-H.png",
        equipmentId: "Halon"
      }
    ],
    markers: [],
    availableEquipment: ["Magazine-Flood-and-Spray", "Halon"]
  }
].map(scenario => ensureCategory(scenario))

// Helper function to group scenarios by category while maintaining order
export const groupScenariosByCategory = (scenarios: Scenario[]): { [key: string]: Scenario[] } => {
  const grouped: { [key: string]: Scenario[] } = {}
  
  scenarios.forEach((scenario) => {
    if (!grouped[scenario.category]) {
      grouped[scenario.category] = []
    }
    grouped[scenario.category].push(scenario)
  })
  
  return grouped
}

// Helper function to get unique categories while maintaining order
export const getUniqueCategories = (scenarios: Scenario[]): string[] => {
  return Array.from(new Set(scenarios.map(s => s.category)))
}
