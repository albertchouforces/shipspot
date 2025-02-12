export type Equipment = {
  id: string
  name: string
  icon: string
  color: string
}

export type Marker = {
  id: number
  x: number
  y: number
  equipment: Equipment
}

export type Scenario = {
  id: string
  title: string
  category: string
  questionImage: string | null
  answerImage: string | null
  markers: Marker[]
  availableEquipment: string[]
}

export type CategoryGroup = {
  category: {
    id: string
    name: string
    order: number
  }
  scenarios: Scenario[]
}
