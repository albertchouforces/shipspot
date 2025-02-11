import { Equipment, Scenario } from '../types'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  scenarios: Scenario[]
  currentScenario: Scenario | null
  onScenarioSelect: (scenario: Scenario) => void
  selectedEquipment: Equipment | null
  setSelectedEquipment: (equipment: Equipment | null) => void
  showAnswer: boolean
  onToggleAnswer: () => void
  onDisableHandTool?: () => void
  isHandToolActive?: boolean
  onResetZoom?: () => void
  markerSize: number
  onMarkerSizeChange: (size: number) => void
  onResetMarkerSize: () => void
}

import { equipmentTypes } from '../data/equipment'

const Sidebar = ({
  scenarios,
  currentScenario,
  onScenarioSelect,
  selectedEquipment,
  setSelectedEquipment,
  isHandToolActive,
  onDisableHandTool,
  onResetZoom,
  markerSize,
  onMarkerSizeChange,
  onResetMarkerSize,
}: SidebarProps) => {
  const [scenariosExpanded, setScenariosExpanded] = useState(true)
  const [equipmentExpanded, setEquipmentExpanded] = useState(true)

  const availableEquipment = currentScenario
    ? equipmentTypes.filter(equipment => 
        currentScenario.availableEquipment.includes(equipment.id)
      )
    : []

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(null)
    if (onResetZoom) {
      onResetZoom()
    }
    if (onDisableHandTool && isHandToolActive) {
      onDisableHandTool()
    }
    setTimeout(() => {
      setSelectedEquipment(equipment)
    }, 300)
  }

  const handleScenarioSelect = (scenario: Scenario) => {
    onScenarioSelect(scenario)
    setSelectedEquipment(null)
    
    if (onResetZoom) {
      onResetZoom()
    }
    
    setTimeout(() => {
      const firstEquipment = equipmentTypes.find(eq => 
        scenario.availableEquipment.includes(eq.id)
      )
      if (firstEquipment) {
        setSelectedEquipment(firstEquipment)
      }
    }, 300)
  }

  return (
    <div className="w-64 bg-white border-r flex flex-col h-screen">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Ship Equipment Marker</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="border-2 rounded-lg overflow-hidden shadow-md">
            <button
              onClick={() => setScenariosExpanded(!scenariosExpanded)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-medium text-sm text-gray-700">Scenarios</span>
              {scenariosExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {scenariosExpanded && (
              <div className="p-2 space-y-1">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    className={`w-full text-left p-2 rounded-lg transition-all duration-200 text-sm break-words whitespace-normal ${
                      currentScenario?.id === scenario.id
                        ? 'bg-blue-100 text-blue-800 shadow-sm font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleScenarioSelect(scenario)}
                  >
                    {scenario.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentScenario && availableEquipment.length > 0 && (
            <>
              <div className="border-2 rounded-lg overflow-hidden shadow-md">
                <button
                  onClick={() => setEquipmentExpanded(!equipmentExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                >
                  <span className="font-medium text-sm text-gray-700">Equipment Types</span>
                  {equipmentExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {equipmentExpanded && (
                  <div className="p-2 space-y-1">
                    {availableEquipment.map((equipment) => {
                      const IconComponent = (Icons as any)[equipment.icon] || Icons.HelpCircle
                      return (
                        <button
                          key={equipment.id}
                          className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm ${
                            selectedEquipment?.id === equipment.id && !isHandToolActive
                              ? 'bg-blue-100 text-blue-800 shadow-sm font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => handleEquipmentSelect(equipment)}
                        >
                          <IconComponent size={16} style={{ color: equipment.color }} />
                          <span className="truncate">{equipment.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-2 rounded-lg overflow-hidden shadow-md p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Marker Size</span>
                  <button
                    onClick={onResetMarkerSize}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded-lg"
                    title="Reset to default size"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="16"
                    max="48"
                    value={markerSize}
                    onChange={(e) => onMarkerSizeChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-gray-500 w-8">{markerSize}px</span>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  Click on the image to place markers for the selected equipment type. Markers can only be placed when the image is not zoomed or panned.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 border-t bg-white">
        <div className="text-[11px] text-gray-500 space-y-1">
          <p className="leading-relaxed">
            (Version 1.0) This is a professional development learning project. For more information please contact the Learning Support Centre Product Development Lead (Pacific) at{' '}
            <a 
              href="mailto:joshua.hawthorne@ecn.forces.gc.ca"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              joshua.hawthorne@ecn.forces.gc.ca
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
