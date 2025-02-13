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

  // Convert color to RGB format for background transparency
  const getRgbaBackground = (color: string) => {
    // If it's a hex color
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, 0.15)`
    }
    // If it's a named color, return with opacity
    return `var(--${color}-transparent, ${color}1A)` // 1A is hex for 10% opacity
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
      style={{ 
        left: `${marker.x}%`,
        top: `${marker.y}%`,
        opacity: showAnswer ? opacity : 1,
        // Add CSS variables for color transparency
        '--red-transparent': 'rgba(255, 0, 0, 0.15)',
        '--blue-transparent': 'rgba(0, 0, 255, 0.15)',
        '--green-transparent': 'rgba(0, 128, 0, 0.15)',
        '--purple-transparent': 'rgba(128, 0, 128, 0.15)',
        '--orange-transparent': 'rgba(255, 165, 0, 0.15)',
      }}
    >
      <div className="relative">
        <div 
          className="rounded-full transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: getRgbaBackground(marker.equipment.color),
            padding: '4px',
            boxShadow: `
              0 0 0 2px white,
              0 0 0 3px ${marker.equipment.color},
              0 4px 6px -1px rgba(0,0,0,0.2),
              0 2px 4px -2px rgba(0,0,0,0.1)
            `,
          }}
        >
          <IconComponent
            size={size}
            style={{ 
              color: marker.equipment.color,
              strokeWidth: 2.5,
              fill: 'none', // Remove the fill
              filter: `drop-shadow(0 1px 1px rgba(0,0,0,0.1))`,
            }}
            className="rounded-full"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(marker.id)
          }}
          className="absolute -top-1 -right-1 bg-red-500 text-white hover:bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <Minus size={12} />
        </button>
      </div>
    </div>
  )
}

export default MarkerComponent
