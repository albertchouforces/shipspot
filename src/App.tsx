import './index.css'
import { useState, useEffect, useRef } from 'react'
import ImageViewer from './components/ImageViewer'
import Sidebar from './components/Sidebar'
import { Equipment, Marker, Scenario } from './types'
import { predefinedScenarios } from './data/scenarios'

const STORAGE_KEYS = {
  SCENARIOS: 'shipScenarios',
  USER_PROGRESS: 'shipUserProgress',
  MARKER_SIZE: 'shipMarkerSize',
}

function App() {
  const [scenarios] = useState<Scenario[]>(() => {
    // Try to load scenarios from localStorage
    const savedScenarios = localStorage.getItem(STORAGE_KEYS.SCENARIOS)
    if (savedScenarios) {
      try {
        const parsed = JSON.parse(savedScenarios)
        return Array.isArray(parsed) ? parsed : predefinedScenarios
      } catch {
        return predefinedScenarios
      }
    }
    // If no saved scenarios, use predefined ones and save them
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(predefinedScenarios))
    return predefinedScenarios
  })

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userProgress, setUserProgress] = useState<{ [key: string]: Marker[] }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS)
    return saved ? JSON.parse(saved) : {}
  })
  const [isHandToolActive, setIsHandToolActive] = useState(false)
  const [markerSize, setMarkerSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MARKER_SIZE)
    return saved ? Number(saved) : 24
  })
  const imageViewerRef = useRef<{ handleResetZoom: () => void } | null>(null)

  // Ensure scenarios are always saved when they change
  useEffect(() => {
    if (Array.isArray(scenarios) && scenarios.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios))
    }
  }, [scenarios])

  // Save user progress when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(userProgress))
  }, [userProgress])

  // Save marker size when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARKER_SIZE, String(markerSize))
  }, [markerSize])

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
    if (!scenario) return
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
