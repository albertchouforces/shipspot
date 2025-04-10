import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface HelpTooltipProps {
  isVisible: boolean
  onDismiss: () => void
}

const HelpTooltip = ({ isVisible, onDismiss }: HelpTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node)
      ) {
        onDismiss()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onDismiss])

  if (!isVisible) return null

  return (
    <div 
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 max-w-md w-full"
      ref={tooltipRef}
    >
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-lg flex items-start">
        <p className="text-sm text-amber-700 flex-1">
          Select a Deck and Marker type. Click on the image to place markers, use the Answer Key to test your knowledge or use as a reference.
        </p>
        <button
          onClick={onDismiss}
          className="ml-2 p-1 text-amber-500 hover:text-amber-700 rounded-full hover:bg-amber-100 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default HelpTooltip
