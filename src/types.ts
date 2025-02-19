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

export type AnswerLayer = {
  image: string
  equipmentId: string // Changed from label to equipmentId
}

export type Scenario = {
  id: string
  title: string
  category: string
  questionImage: string | null
  answerLayers: AnswerLayer[]
  markers: Marker[]
  availableEquipment: string[]
}
