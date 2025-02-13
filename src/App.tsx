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

function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>(predefinedScenarios)
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userProgress, setUserProgress] = useState<{ [key: string]: Marker[] }>({})
  const [isHandToolActive, setIsHandToolActive] = useState(false)
  const [markerSize, setMarkerSize] = useState(24)
  const [isInitialized, setIsInitialized] = useState(false)
  const imageViewerRef = useRef<{ handleResetZoom: () => void } | null>(null)

  // Initialize app state with proper version check
  useEffect(() => {
    const initializeAppState = () => {
      try {
        // Load saved data with version check
        const currentVersion = '1.0.1' // Update this when deploying new versions
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

        // Always use predefined scenarios instead of cached ones
        setScenarios(predefinedScenarios)
        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing app state:', error)
        // Reset to default state on error
        setScenarios(predefinedScenarios)
        setUserProgress({})
        setMarkerSize(24)
        setIsInitialized(true)
      }
    }

    initializeAppState()
  }, [])

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

  const getCurrentMarkers = () => {
    if (!currentScenario) return []
    return userProgress[currentScenario.id] || []
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedEquipment || !currentScenario) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

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

  const handleToggleAnswer = () => {
    setShowAnswer(prev => !prev)
  }

  const handleScenarioSelect = (scenario: Scenario) => {
    setCurrentScenario(scenario)
    setShowAnswer(false)
  }

  const handleZoomPanChange = (isZoomedOrPanned: boolean) => {
    if (isZoomedOrPanned) {
      setSelectedEquipment(null)
      setIsHandToolActive(true)
    }
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
        showAnswer={showAnswer}
        onToggleAnswer={handleToggleAnswer}
        onDisableHandTool={() => setIsHandToolActive(false)}
        isHandToolActive={isHandToolActive}
        onResetZoom={handleResetZoom}
        markerSize={markerSize}
        onMarkerSizeChange={handleMarkerSizeChange}
        onResetMarkerSize={handleResetMarkerSize}
      />
      <main className="flex-1 p-6">
        {currentScenario ? (
          <ImageViewer
            ref={imageViewerRef}
            image={currentScenario.questionImage}
            answerImage={currentScenario.answerImage}
            showAnswer={showAnswer}
            markers={getCurrentMarkers()}
            onImageClick={handleImageClick}
            onMarkerRemove={handleRemoveMarker}
            onClearAll={handleClearAll}
            isHandToolActive={isHandToolActive}
            onHandToolToggle={setIsHandToolActive}
            onZoomPanChange={handleZoomPanChange}
            onToggleAnswer={handleToggleAnswer}
            markerSize={markerSize}
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
