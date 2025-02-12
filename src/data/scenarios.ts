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
    id: "scenario1",
    title: "Engine Room Safety Equipment",
    category: "Harry DeWolf-class",
    questionImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/q1.png",
    answerImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/a1.png",
    markers: [],
    availableEquipment: ["fire-extinguisherA", "fire-extinguisherB", "fire-extinguisherC", "fire-extinguisherD", "hose-station"]
  },
  {
    id: "scenario2",
    title: "Bridge Equipment Layout",
    category: "Harry DeWolf-class",
    questionImage: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80&w=2000",
    answerImage: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=2000",
    markers: [],
    availableEquipment: ["first-aid"]
  },
  {
    id: "scenario3",
    title: "Deck Safety Equipment",
    category: "Harry DeWolf-class",
    questionImage: "https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&q=80&w=2000",
    answerImage: "https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&q=80&w=2000",
    markers: [],
    availableEquipment: ["life-buoy", "radio", "anchor"]
  },
  {
    id: "scenario4",
    title: "Engine Room Fire Systems",
    category: "Halifax-class",
    questionImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/q1.png",
    answerImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/a1.png",
    markers: [],
    availableEquipment: ["fire-extinguisherA", "fire-extinguisherB", "hose-station"]
  },
  {
    id: "scenario5",
    title: "Forward Deck Equipment",
    category: "Halifax-class",
    questionImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/q1.png",
    answerImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/a1.png",
    markers: [],
    availableEquipment: ["life-buoy", "radio", "anchor"]
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
