import { Equipment, Scenario, CategoryGroup } from '../types'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { equipmentTypes } from '../data/equipment'
import { getAllCategories } from '../data/categories'

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
  
  const [equipmentExpanded, setEquipmentExpanded] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Get available equipment for current scenario
  const availableEquipment = useMemo(() => 
    currentScenario
      ? equipmentTypes.filter(equipment => 
          currentScenario.availableEquipment.includes(equipment.id)
        )
      : []
  , [currentScenario])

  // Enhanced categorization logic with proper type safety
  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const allCategories = getAllCategories()
    
    return allCategories.map(category => {
      const categoryScenarios = scenarios.filter(
        scenario => scenario.category === category.id
      ).sort((a, b) => a.title.localeCompare(b.title))

      return {
        category,
        scenarios: categoryScenarios
      }
    }).filter(group => group.scenarios.length > 0)
  }, [scenarios])

  // Initialize expanded states for categories
  useEffect(() => {
    const initialState = categoryGroups.reduce<Record<string, boolean>>(
      (acc, group) => ({
        ...acc,
        [group.category.id]: true
      }),
      {}
    )
    setExpandedCategories(initialState)
  }, [categoryGroups])

  const handleEquipmentSelect = (equipment: Equipment) => {
    if (isHandToolActive && onDisableHandTool) {
      onDisableHandTool()
    }
    if (onResetZoom) {
      onResetZoom()
    }
    setSelectedEquipment(equipment)
  }

  const handleScenarioSelect = (scenario: Scenario) => {
    onScenarioSelect(scenario)
    setSelectedEquipment(null)
    
    if (onResetZoom) {
      onResetZoom()
    }
    
    // Select first available equipment after a short delay
    setTimeout(() => {
      const firstEquipment = equipmentTypes.find(eq => 
        scenario.availableEquipment.includes(eq.id)
      )
      if (firstEquipment) {
        setSelectedEquipment(firstEquipment)
      }
    }, 300)
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  return (
    <div className="w-64 bg-white border-r flex flex-col h-screen">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Ship Equipment Marker</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Categories and their scenarios */}
          {categoryGroups.map(({ category, scenarios: categoryScenarios }) => (
            <div key={category.id} className="border rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="font-semibold text-sm text-gray-800">{category.name}</span>
                {expandedCategories[category.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {expandedCategories[category.id] && (
                <div className="p-2 space-y-1">
                  {categoryScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      className={`w-full text-left p-2 rounded-md transition-all duration-200 text-sm break-words whitespace-normal ${
                        currentScenario?.id === scenario.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => handleScenarioSelect(scenario)}
                    >
                      {scenario.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {currentScenario && availableEquipment.length > 0 && (
            <>
              {/* Equipment Types Section */}
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setEquipmentExpanded(!equipmentExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <span className="font-semibold text-sm text-gray-800">Equipment Types</span>
                  {equipmentExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {equipmentExpanded && (
                  <div className="p-2 space-y-1">
                    {availableEquipment.map((equipment) => {
                      const IconComponent = (Icons as any)[equipment.icon] || Icons.HelpCircle
                      return (
                        <button
                          key={equipment.id}
                          className={`w-full px-3 py-2 rounded-md flex items-center gap-2 transition-all duration-200 text-sm ${
                            selectedEquipment?.id === equipment.id && !isHandToolActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
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

              {/* Marker Size Section */}
              <div className="border rounded-lg overflow-hidden shadow-sm p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Marker Size</span>
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

              {/* Help Text */}
              <div className="bg-amber-50 border rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  Click on the image to place markers for the selected equipment type. Markers can only be placed when the image is not zoomed or panned.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <div className="text-[11px] text-gray-500 space-y-1 text-center">
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
