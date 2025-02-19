import { Minus } from 'lucide-react'
import { Marker } from '../types'
import * as Icons from 'lucide-react'
import { CSSProperties } from 'react'

interface MarkerComponentProps {
  marker: Marker
  onRemove: (id: number) => void
  size?: number
}

const MarkerComponent = ({ marker, onRemove, size = 24 }: MarkerComponentProps) => {
  // Dynamically get the icon component from lucide-react
  const IconComponent = (Icons as any)[marker.equipment.icon] || Icons.HelpCircle

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Helper function to get RGB values from any color
  const getRgbValues = (color: string): { r: number; g: number; b: number } => {
    // For hex colors
    if (color.startsWith('#')) {
      return hexToRgb(color) || { r: 0, g: 0, b: 0 }
    }
    
    // For named colors, create a temporary element to get RGB values
    const tempEl = document.createElement('div')
    tempEl.style.color = color
    document.body.appendChild(tempEl)
    const computedColor = window.getComputedStyle(tempEl).color
    document.body.removeChild(tempEl)
    
    // Parse rgb(r, g, b) format
    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10)
      }
    }
    
    return { r: 0, g: 0, b: 0 }
  }

  // Helper function to create a lighter version of the color
  const getLighterColor = (color: string): string => {
    const { r, g, b } = getRgbValues(color)
    // Mix with white (255, 255, 255) with 85% of the original color
    const lightR = Math.round(r + (255 - r) * 0.85)
    const lightG = Math.round(g + (255 - g) * 0.85)
    const lightB = Math.round(b + (255 - b) * 0.85)
    return `rgb(${lightR}, ${lightG}, ${lightB})`
  }

  const markerStyle: CSSProperties = {
    backgroundColor: getLighterColor(marker.equipment.color),
    padding: '4px',
    boxShadow: `
      0 0 0 2px white,
      0 0 0 3px ${marker.equipment.color},
      0 4px 6px -1px rgba(0,0,0,0.2),
      0 2px 4px -2px rgba(0,0,0,0.1)
    `
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
      style={{ 
        left: `${marker.x}%`,
        top: `${marker.y}%`
      }}
    >
      <div className="relative">
        <div 
          className="rounded-full transition-transform duration-200 group-hover:scale-105"
          style={markerStyle}
        >
          <IconComponent
            size={size}
            style={{ 
              color: marker.equipment.color,
              strokeWidth: 2.5,
              fill: 'none',
              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
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
