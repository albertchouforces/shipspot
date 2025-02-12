import { Scenario } from '../types'
import { validateCategory } from './categories'

export const predefinedScenarios: Scenario[] = [
  {
    id: "scenario1",
    title: "Engine Room Safety Equipment",
    category: validateCategory("harry-dewolf"),
    questionImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/q1.png",
    answerImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/a1.png",
    markers: [],
    availableEquipment: ["fire-extinguisherA", "fire-extinguisherB", "fire-extinguisherC", "fire-extinguisherD", "hose-station"]
  },
  {
    id: "scenario2",
    title: "Bridge Equipment Layout",
    category: validateCategory("harry-dewolf"),
    questionImage: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&q=80&w=2000",
    answerImage: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=2000",
    markers: [],
    availableEquipment: ["first-aid"]
  },
  {
    id: "scenario3",
    title: "Deck Safety Equipment",
    category: validateCategory("harry-dewolf"),
    questionImage: "https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&q=80&w=2000",
    answerImage: "https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&q=80&w=2000",
    markers: [],
    availableEquipment: []
  },
  {
    id: "scenario4",
    title: "Engine Room Fire Systems",
    category: validateCategory("halifax"),
    questionImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/q1.png",
    answerImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/a1.png",
    markers: [],
    availableEquipment: ["fire-extinguisherA", "fire-extinguisherB", "hose-station"]
  },
  {
    id: "scenario5",
    title: "Forward Deck Equipment",
    category: validateCategory("halifax"),
    questionImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/q1.png",
    answerImage: "https://raw.githubusercontent.com/albertchouforces/shipspot/refs/heads/main/public/images/a1.png",
    markers: [],
    availableEquipment: ["life-buoy", "radio", "anchor"]
  }
]
