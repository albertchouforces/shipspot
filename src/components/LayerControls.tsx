import * as Icons from 'lucide-react'
import { equipmentTypes } from '../data/equipment'
import { AnswerLayer } from '../types'
import { memo, useCallback } from 'react'

interface LayerControlsProps {
  answerLayers: AnswerLayer[]
  visibleLayers: { [key: string]: boolean }
  onToggleLayer: (equipmentId: string) => void
  onToggleAllLayers: () => void
}

const LayerControls = memo(({
  answerLayers,
  visibleLayers,
  onToggleLayer,
  onToggleAllLayers,
}: LayerControlsProps) => {
  const areAllLayersVisible = useCallback(() => 
    Object.values(visibleLayers).every(v => v), 
    [visibleLayers]
  )

  if (answerLayers.length === 0) return null

  const handleLayerToggle = (e: React.MouseEvent, equipmentId: string) => {
    e.stopPropagation() // Prevent image click event
    onToggleLayer(equipmentId)
  }

  const handleAllLayersToggle = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent image click event
    onToggleAllLayers()
  }

  const allVisible = areAllLayersVisible()

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center gap-1.5 p-2">
        {/* Title and Show/Hide All Button */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-blue-700">
            Answer Key:
          </span>
          <button
            onClick={handleAllLayersToggle}
            className={`px-2 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              allVisible
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {allVisible ? 'Hide All' : 'Show All'}
          </button>
        </div>

        <div className="w-px h-5 bg-gray-300" />

        {/* Individual Layer Toggles */}
        {answerLayers.map((layer) => {
          const equipment = equipmentTypes.find(eq => eq.id === layer.equipmentId)
          if (!equipment) return null

          const IconComponent = (Icons as any)[equipment.icon] || Icons.HelpCircle
          const isVisible = visibleLayers[layer.equipmentId]
          
          return (
            <button
              key={layer.equipmentId}
              onClick={(e) => handleLayerToggle(e, layer.equipmentId)}
              className={`p-1.5 rounded-md transition-all duration-200 relative group hover:scale-105`}
              style={{
                backgroundColor: isVisible ? equipment.color : 'transparent',
                color: isVisible ? 'white' : equipment.color,
                borderColor: equipment.color,
                borderWidth: '1.5px',
              }}
              title={`${isVisible ? 'Hide' : 'Show'} ${equipment.name}`}
            >
              <IconComponent 
                size={18}
                strokeWidth={2.5}
                className={`transition-transform duration-200 ${
                  isVisible ? 'scale-110' : 'scale-100'
                }`}
              />
              {/* Enhanced Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                {equipment.name}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-3 border-x-transparent border-t-3 border-t-gray-900"></div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
})

LayerControls.displayName = 'LayerControls'

export default LayerControls
