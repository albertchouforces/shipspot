import { Minus } from 'lucide-react'
import { Marker } from '../types'
import * as Icons from 'lucide-react'

interface MarkerComponentProps {
  marker: Marker
  onRemove: (id: number) => void
  showAnswer?: boolean
  opacity?: number
  size?: number
}

const MarkerComponent = ({ marker, onRemove, showAnswer, opacity = 1, size = 24 }: MarkerComponentProps) => {
  // Dynamically get the icon component from lucide-react
  const IconComponent = (Icons as any)[marker.equipment.icon] || Icons.HelpCircle

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
      style={{ 
        left: `${marker.x}%`,
        top: `${marker.y}%`,
        opacity: showAnswer ? opacity : 1
      }}
    >
      <div className="relative">
        <div className="rounded-full shadow-[0_0_0_2px_black,0_4px_6px_-1px_rgba(0,0,0,0.3)]">
          <IconComponent
            size={size}
            style={{ color: marker.equipment.color }}
            className="bg-white rounded-full p-1"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(marker.id)
          }}
          className="absolute -top-1 -right-1 bg-orange-500 text-white hover:bg-orange-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <Minus size={12} />
        </button>
      </div>
    </div>
  )
}

export default MarkerComponent
