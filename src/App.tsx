import './index.css'
import { useState, useEffect, useRef } from 'react'
import ImageViewer from './components/ImageViewer'
import Sidebar from './components/Sidebar'
import { Equipment, Marker, Scenario } from './types'
import { predefinedScenarios } from './data/scenarios'
import { equipmentTypes } from './data/equipment'

function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>(predefinedScenarios)
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userProgress, setUserProgress] = useState<{ [key: string]: Marker[] }>({})
  const [isHandToolActive, setIsHandToolActive] = useState(false)
  const [markerSize, setMarkerSize] = useState(24) // Default marker size
  const imageViewerRef = useRef<{ handleResetZoom: () => void } | null>(null)

  // Load saved data and set default scenario on mount
  useEffect(() => {
    // Load user progress
    const savedProgress = localStorage.getItem('shipUserProgress')
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress))
    }

    // Load saved scenarios
    const savedScenarios = localStorage.getItem('shipScenarios')
    if (savedScenarios) {
      const parsedScenarios = JSON.parse(savedScenarios)
      setScenarios(parsedScenarios)
    }

    // Load saved marker size
    const savedMarkerSize = localStorage.getItem('shipMarkerSize')
    if (savedMarkerSize) {
      setMarkerSize(Number(savedMarkerSize))
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('shipUserProgress', JSON.stringify(userProgress))
  }, [userProgress])

  useEffect(() => {
    localStorage.setItem('shipScenarios', JSON.stringify(scenarios))
  }, [scenarios])

  useEffect(() => {
    localStorage.setItem('shipMarkerSize', String(markerSize))
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
    setCurrentScenario(scenario)
    setShowAnswer(false)
    
    // Store the selected scenario in localStorage
    localStorage.setItem('lastSelectedScenario', JSON.stringify(scenario))
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
    setMarkerSize(24) // Reset to default size
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
