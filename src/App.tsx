import './index.css'
import { useState, useEffect, useRef } from 'react'
import ImageViewer from './components/ImageViewer'
import Sidebar from './components/Sidebar'
import { Equipment, Marker, Scenario } from './types'
import { predefinedScenarios } from './data/scenarios'

// Constants for localStorage keys
const STORAGE_KEYS = {
  USER_PROGRESS: 'shipUserProgress',
  SCENARIOS: 'shipScenarios',
  MARKER_SIZE: 'shipMarkerSize',
  LAST_SELECTED: 'lastSelectedScenario',
  VERSION: 'appVersion'
}

// Default category and scenario constants (matching Sidebar.tsx)
const DEFAULT_CATEGORY = 'Halifax-class'
const DEFAULT_SCENARIO_TITLE = '02 Deck'

function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>(predefinedScenarios)
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [userProgress, setUserProgress] = useState<{ [key: string]: Marker[] }>({})
  const [isHandToolActive, setIsHandToolActive] = useState(false)
  const [markerSize, setMarkerSize] = useState(24)
  const [isInitialized, setIsInitialized] = useState(false)
  const [visibleLayers, setVisibleLayers] = useState<{ [key: string]: boolean }>({})
  const [showHelpTooltip, setShowHelpTooltip] = useState(true)
  const hasInitialized = useRef(false)
  const imageViewerRef = useRef<{ handleResetZoom: () => void } | null>(null)

  // Handle initial app state initialization
  useEffect(() => {
    const initializeAppState = () => {
      try {
        // Load saved data with version check
        const currentVersion = '1.0.1'
        const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION)

        // Clear all data if version mismatch
        if (storedVersion !== currentVersion) {
          localStorage.clear()
          localStorage.setItem(STORAGE_KEYS.VERSION, currentVersion)
        } else {
          // Load saved state if version matches
          const savedProgress = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS)
          if (savedProgress) {
            setUserProgress(JSON.parse(savedProgress))
          }

          const savedMarkerSize = localStorage.getItem(STORAGE_KEYS.MARKER_SIZE)
          if (savedMarkerSize) {
            setMarkerSize(Number(savedMarkerSize))
          }
        }

        // Always show help tooltip on refresh (no localStorage check)
        setShowHelpTooltip(true)
        
        // Always use predefined scenarios
        setScenarios(predefinedScenarios)
        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing app state:', error)
        // Reset to default state on error
        setScenarios(predefinedScenarios)
        setUserProgress({})
        setMarkerSize(24)
        setShowHelpTooltip(true)
        setIsInitialized(true)
      }
    }

    if (!hasInitialized.current) {
      initializeAppState()
      hasInitialized.current = true
    }
  }, [])

  // Select initial scenario only once after initialization
  useEffect(() => {
    if (isInitialized && !currentScenario && scenarios.length > 0) {
      // Find default scenario based on category and title
      const defaultScenario = scenarios.find(
        scenario => 
          scenario.category === DEFAULT_CATEGORY && 
          scenario.title === DEFAULT_SCENARIO_TITLE
      )
      
      if (defaultScenario) {
        setCurrentScenario(defaultScenario)
      } else {
        // Fallback to first scenario if default not found
        console.warn('Default scenario not found, using first available scenario')
        setCurrentScenario(scenarios[0])
      }
    }
  }, [isInitialized, scenarios, currentScenario])

  // Reset visible layers when scenario changes
  useEffect(() => {
    if (currentScenario) {
      const newVisibleLayers: { [key: string]: boolean } = {}
      currentScenario.answerLayers.forEach(layer => {
        newVisibleLayers[layer.equipmentId] = false
      })
      setVisibleLayers(newVisibleLayers)
    }
  }, [currentScenario])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(userProgress))
    }
  }, [userProgress, isInitialized])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.MARKER_SIZE, String(markerSize))
    }
  }, [markerSize, isInitialized])

  const handleDismissHelpTooltip = () => {
    setShowHelpTooltip(false)
    // Removed localStorage saving to make tooltip show on each refresh
  }

  const getCurrentMarkers = () => {
    if (!currentScenario) return []
    return userProgress[currentScenario.id] || []
  }

  const handleImageClick = (x: number, y: number) => {
    if (!selectedEquipment || !currentScenario || isHandToolActive) return

    const newMarker: Marker = {
      id: Date.now(),
      x,
      y,
      equipment: selectedEquipment,
    }

    setUserProgress(prev => ({
      ...prev,
      [currentScenario.id]: [...(prev[currentScenario.id] || []), newMarker]
    }))
  }

  const handleRemoveMarker = (id: number) => {
    if (!currentScenario) return

    setUserProgress(prev => ({
      ...prev,
      [currentScenario.id]: prev[currentScenario.id].filter(marker => marker.id !== id)
    }))
  }

  const handleClearAll = () => {
    if (!currentScenario) return

    setUserProgress(prev => ({
      ...prev,
      [currentScenario.id]: []
    }))
  }

  const handleScenarioSelect = (scenario: Scenario) => {
    setCurrentScenario(scenario)
    // Store the selected scenario ID in localStorage
    localStorage.setItem(STORAGE_KEYS.LAST_SELECTED, scenario.id)
  }

  const handleZoomPanChange = () => {
    // Removed automatic hand tool activation
  }

  const handleResetZoom = () => {
    if (imageViewerRef.current) {
      imageViewerRef.current.handleResetZoom()
    }
  }

  const handleMarkerSizeChange = (size: number) => {
    setMarkerSize(size)
  }

  const handleResetMarkerSize = () => {
    setMarkerSize(24)
  }

  const handleToggleLayer = (equipmentId: string) => {
    setVisibleLayers(prev => ({
      ...prev,
      [equipmentId]: !prev[equipmentId]
    }))
  }

  const handleToggleAllLayers = () => {
    if (!currentScenario) return
    
    const allVisible = currentScenario.answerLayers.every(
      layer => visibleLayers[layer.equipmentId]
    )
    
    setVisibleLayers(prev => {
      const newState = { ...prev }
      currentScenario.answerLayers.forEach(layer => {
        newState[layer.equipmentId] = !allVisible
      })
      return newState
    })
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        scenarios={scenarios}
        currentScenario={currentScenario}
        onScenarioSelect={handleScenarioSelect}
        selectedEquipment={selectedEquipment}
        setSelectedEquipment={setSelectedEquipment}
        isHandToolActive={isHandToolActive}
        onDisableHandTool={() => setIsHandToolActive(false)}
        onResetZoom={handleResetZoom}
        markerSize={markerSize}
        onMarkerSizeChange={handleMarkerSizeChange}
        onResetMarkerSize={handleResetMarkerSize}
        visibleLayers={visibleLayers}
        onToggleLayer={handleToggleLayer}
        onToggleAllLayers={handleToggleAllLayers}
      />
      <main className="flex-1 p-6">
        {currentScenario ? (
          <ImageViewer
            ref={imageViewerRef}
            image={currentScenario.questionImage}
            markers={getCurrentMarkers()}
            onImageClick={handleImageClick}
            onMarkerRemove={handleRemoveMarker}
            onClearAll={handleClearAll}
            isHandToolActive={isHandToolActive}
            onHandToolToggle={setIsHandToolActive}
            onZoomPanChange={handleZoomPanChange}
            markerSize={markerSize}
            answerLayers={currentScenario.answerLayers}
            visibleLayers={visibleLayers}
            onToggleLayer={handleToggleLayer}
            onToggleAllLayers={handleToggleAllLayers}
            showHelpTooltip={showHelpTooltip}
            onDismissHelpTooltip={handleDismissHelpTooltip}
          />
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Select a scenario to begin</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
