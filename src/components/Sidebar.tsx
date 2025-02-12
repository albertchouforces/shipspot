import { Equipment, Scenario } from '../types'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

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

// New types for better type safety
type CategoryMap = {
  [key: string]: {
    name: string;
    scenarios: Scenario[];
    order: number;
  };
};

const DEFAULT_CATEGORY = 'Uncategorized';

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
  const [scenariosExpanded, setScenariosExpanded] = useState(true);
  const [equipmentExpanded, setEquipmentExpanded] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  const availableEquipment = currentScenario
    ? equipmentTypes.filter(equipment => 
        currentScenario.availableEquipment.includes(equipment.id)
      )
    : [];

  // Enhanced category organization with proper ordering and type safety
  const categorizedScenarios = useMemo(() => {
    const categoryMap: CategoryMap = {};
    let orderCounter = 0;

    // First pass: collect all categories and initialize them
    scenarios.forEach(scenario => {
      const category = scenario.category?.trim() || DEFAULT_CATEGORY;
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          scenarios: [],
          order: orderCounter++
        };
      }
    });

    // Second pass: populate scenarios into their categories
    scenarios.forEach(scenario => {
      const category = scenario.category?.trim() || DEFAULT_CATEGORY;
      categoryMap[category].scenarios.push(scenario);
    });

    // Sort categories by order and filter out empty ones
    return Object.entries(categoryMap)
      .filter(([_, data]) => data.scenarios.length > 0)
      .sort((a, b) => {
        // Special handling for Uncategorized (always last)
        if (a[0] === DEFAULT_CATEGORY) return 1;
        if (b[0] === DEFAULT_CATEGORY) return -1;
        return a[1].order - b[1].order;
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value.scenarios;
        return acc;
      }, {} as { [key: string]: Scenario[] });
  }, [scenarios]);

  // Initialize expanded categories with proper type checking
  useEffect(() => {
    const initialExpandedState = Object.keys(categorizedScenarios).reduce(
      (acc, category) => ({
        ...acc,
        [category]: true
      }),
      {}
    );
    setExpandedCategories(initialExpandedState);
  }, [categorizedScenarios]);

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(null);
    if (onResetZoom) {
      onResetZoom();
    }
    if (onDisableHandTool && isHandToolActive) {
      onDisableHandTool();
    }
    setTimeout(() => {
      setSelectedEquipment(equipment);
    }, 300);
  };

  const handleScenarioSelect = (scenario: Scenario) => {
    onScenarioSelect(scenario);
    setSelectedEquipment(null);
    
    if (onResetZoom) {
      onResetZoom();
    }
    
    setTimeout(() => {
      const firstEquipment = equipmentTypes.find(eq => 
        scenario.availableEquipment.includes(eq.id)
      );
      if (firstEquipment) {
        setSelectedEquipment(firstEquipment);
      }
    }, 300);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Get ordered categories maintaining proper type safety
  const orderedCategories = useMemo(() => 
    Object.keys(categorizedScenarios)
  , [categorizedScenarios]);

  const hasContent = orderedCategories.length > 0;

  return (
    <div className="w-64 bg-white border-r flex flex-col h-screen">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Ship Equipment Marker</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Main Sections Container */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            {/* Ships Section Header */}
            <button
              onClick={() => setScenariosExpanded(!scenariosExpanded)}
              className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <span className="font-semibold text-sm text-gray-800">Ships</span>
              {scenariosExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {scenariosExpanded && hasContent && (
              <div className="divide-y divide-gray-100">
                {orderedCategories.map((category) => (
                  <div key={category} className="bg-white">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`w-full flex items-center justify-between p-2.5 bg-gray-50/80 hover:bg-gray-50 border-l-4 ${
                        category === DEFAULT_CATEGORY 
                          ? 'border-gray-300/20' 
                          : 'border-blue-500/20'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-600 ml-1">{category}</span>
                      {expandedCategories[category] ? 
                        <ChevronUp size={14} className="text-gray-400" /> : 
                        <ChevronDown size={14} className="text-gray-400" />
                      }
                    </button>
                    
                    {/* Category Content */}
                    {expandedCategories[category] && categorizedScenarios[category] && (
                      <div className="py-1 px-2">
                        {categorizedScenarios[category].map((scenario) => (
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
              </div>
            )}
          </div>

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
                      const IconComponent = (Icons as any)[equipment.icon] || Icons.HelpCircle;
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
                      );
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
  );
};

export default Sidebar;
