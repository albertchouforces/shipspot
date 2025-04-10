import { Hand, Maximize2, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import { Marker, AnswerLayer } from '../types'
import MarkerComponent from './MarkerComponent'
import LayerControls from './LayerControls'
import HelpTooltip from './HelpTooltip'
import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle, MouseEvent as ReactMouseEvent } from 'react'

interface ImageDimensions {
  width: number;
  height: number;
  left: number;
  top: number;
  naturalWidth: number;
  naturalHeight: number;
}

interface ImageViewerProps {
  image: string | null
  markers: Marker[]
  onImageClick: (x: number, y: number) => void
  onMarkerRemove: (id: number) => void
  onClearAll: () => void
  isHandToolActive: boolean
  onHandToolToggle: (active: boolean) => void
  onZoomPanChange?: (isZoomedOrPanned: boolean) => void
  markerSize?: number
  answerLayers: AnswerLayer[]
  visibleLayers: { [key: string]: boolean }
  onToggleLayer: (equipmentId: string) => void
  onToggleAllLayers: () => void
  showHelpTooltip: boolean
  onDismissHelpTooltip: () => void
}

export interface ImageViewerRef {
  handleResetZoom: () => void
}

const ImageViewer = forwardRef<ImageViewerRef, ImageViewerProps>(({ 
  image,
  markers, 
  onImageClick, 
  onMarkerRemove, 
  onClearAll,
  isHandToolActive,
  onHandToolToggle,
  onZoomPanChange,
  markerSize = 24,
  answerLayers,
  visibleLayers,
  onToggleLayer,
  onToggleAllLayers,
  showHelpTooltip,
  onDismissHelpTooltip
}, ref) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isRightClickDragging, setIsRightClickDragging] = useState(false)
  const isZoomedOrPannedRef = useRef(false)

  const isZoomedOrPanned = scale !== 1 || position.x !== 0 || position.y !== 0

  useEffect(() => {
    if (onZoomPanChange && isZoomedOrPannedRef.current !== isZoomedOrPanned) {
      isZoomedOrPannedRef.current = isZoomedOrPanned
      onZoomPanChange(isZoomedOrPanned)
    }
  }, [isZoomedOrPanned, onZoomPanChange])

  const updateImageDimensions = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return

    const container = containerRef.current
    const image = imageRef.current
    const containerRect = container.getBoundingClientRect()
    
    const imageAspectRatio = image.naturalWidth / image.naturalHeight
    const containerAspectRatio = containerRect.width / containerRect.height
    
    let imageWidth, imageHeight, left, top
    
    if (imageAspectRatio > containerAspectRatio) {
      imageWidth = containerRect.width
      imageHeight = containerRect.width / imageAspectRatio
      left = 0
      top = (containerRect.height - imageHeight) / 2
    } else {
      imageHeight = containerRect.height
      imageWidth = containerRect.height * imageAspectRatio
      left = (containerRect.width - imageWidth) / 2
      top = 0
    }
    
    setImageDimensions({
      width: imageWidth,
      height: imageHeight,
      left: left,
      top: top,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight
    })
  }, [])

  useEffect(() => {
    let timeoutId: number | null = null
    
    const handleResize = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      
      timeoutId = window.setTimeout(() => {
        updateImageDimensions()
        setScale(1)
        setPosition({ x: 0, y: 0 })
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [updateImageDimensions])

  const handleImageLoad = useCallback(() => {
    updateImageDimensions()
  }, [updateImageDimensions])

  const constrainPosition = useCallback((newX: number, newY: number): { x: number, y: number } => {
    if (!containerRef.current || !imageRef.current || !imageDimensions) {
      return { x: newX, y: newY }
    }

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    
    const scaledImageWidth = imageDimensions.width * scale
    const scaledImageHeight = imageDimensions.height * scale
    
    const maxX = Math.max((scaledImageWidth - containerWidth) / 2, 0)
    const maxY = Math.max((scaledImageHeight - containerHeight) / 2, 0)

    return {
      x: Math.min(Math.max(newX, -maxX), maxX),
      y: Math.min(Math.max(newY, -maxY), maxY)
    }
  }, [scale, imageDimensions])

  const calculateMarkerPosition = useCallback((clientX: number, clientY: number): { x: number, y: number } | null => {
    if (!containerRef.current || !imageRef.current || !imageDimensions) return null

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()

    const containerX = clientX - containerRect.left
    const containerY = clientY - containerRect.top

    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2

    const offsetX = (containerX - containerCenterX - position.x) / scale
    const offsetY = (containerY - containerCenterY - position.y) / scale

    const imageLeft = imageDimensions.left
    const imageTop = imageDimensions.top
    const imageWidth = imageDimensions.width
    const imageHeight = imageDimensions.height

    const imageX = containerCenterX + offsetX - imageLeft
    const imageY = containerCenterY + offsetY - imageTop

    const percentX = (imageX / imageWidth) * 100
    const percentY = (imageY / imageHeight) * 100

    if (percentX < 0 || percentX > 100 || percentY < 0 || percentY > 100) {
      return null
    }

    return { x: percentX, y: percentY }
  }, [scale, position, imageDimensions])

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    // Check if it's a right click (button 2)
    if (e.button === 2) {
      e.preventDefault() // Prevent context menu
      setIsRightClickDragging(true)
      setStartPanPosition({ x: e.clientX - position.x, y: e.clientY - position.y })
    } else if (isHandToolActive) {
      setIsDragging(true)
      setStartPanPosition({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [isHandToolActive, position])

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if ((isDragging && isHandToolActive) || isRightClickDragging) {
      const newX = e.clientX - startPanPosition.x
      const newY = e.clientY - startPanPosition.y
      const constrainedPosition = constrainPosition(newX, newY)
      setPosition(constrainedPosition)
    }
  }, [isDragging, isHandToolActive, isRightClickDragging, startPanPosition, constrainPosition])

  const handleMouseUp = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      setIsRightClickDragging(false)
    } else {
      setIsDragging(false)
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    setIsRightClickDragging(false)
    setShowToolbar(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setShowToolbar(true)
  }, [])

  const handleImageClick = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    // Only handle left clicks for marker placement
    if (e.button !== 0 || isHandToolActive || isDragging || isRightClickDragging || !imageDimensions) return

    if (toolbarRef.current?.contains(e.target as Node)) {
      return
    }

    const markerPosition = calculateMarkerPosition(e.clientX, e.clientY)
    if (markerPosition) {
      onImageClick(markerPosition.x, markerPosition.y)
    }
  }, [isHandToolActive, isDragging, isRightClickDragging, imageDimensions, calculateMarkerPosition, onImageClick])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault() // Prevent the context menu from appearing
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    const delta = -e.deltaY
    const newScale = scale * (1 + delta * 0.001)
    const boundedScale = Math.min(Math.max(newScale, 1), 4)

    if (containerRef.current && imageDimensions) {
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const scaleChange = boundedScale - scale
      const newX = position.x - (mouseX - rect.width / 2) * scaleChange / scale
      const newY = position.y - (mouseY - rect.height / 2) * scaleChange / scale
      
      const constrainedPosition = constrainPosition(newX, newY)
      
      setScale(boundedScale)
      setPosition(constrainedPosition)
    }
  }, [scale, position, imageDimensions, constrainPosition])

  const handleZoomIn = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation()
    const newScale = Math.min(scale * 1.2, 4)
    setScale(newScale)
    const constrainedPosition = constrainPosition(position.x, position.y)
    setPosition(constrainedPosition)
  }, [scale, position, constrainPosition])

  const handleZoomOut = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation()
    const newScale = Math.max(scale / 1.2, 1)
    setScale(newScale)
    const constrainedPosition = constrainPosition(position.x, position.y)
    setPosition(constrainedPosition)
  }, [scale, position, constrainPosition])

  const handleResetZoom = useCallback((e?: ReactMouseEvent) => {
    if (e) e.stopPropagation()
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  useImperativeHandle(ref, () => ({
    handleResetZoom: () => handleResetZoom()
  }), [handleResetZoom])

  if (!image) {
    return (
      <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">Upload an image for this scenario</p>
      </div>
    )
  }

  return (
    <div className="relative h-full flex flex-col gap-4">
      <div 
        ref={containerRef}
        className={`relative w-full h-full border rounded-lg overflow-hidden bg-white select-none ${
          isHandToolActive
            ? isDragging ? 'cursor-grabbing' : 'cursor-grab'
            : isRightClickDragging
              ? 'cursor-grabbing'
              : 'cursor-crosshair'
        }`}
        onClick={handleImageClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onWheel={handleWheel}
      >
        {/* Help Tooltip */}
        <HelpTooltip 
          isVisible={showHelpTooltip} 
          onDismiss={onDismissHelpTooltip} 
        />

        <div
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-100 ease-out select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center'
          }}
        >
          <div className="relative" style={{ maxHeight: '100%', width: 'auto' }}>
            <img 
              ref={imageRef}
              src={image} 
              alt="Ship Compartment"
              className="max-h-full w-auto object-contain select-none"
              style={{ maxWidth: '100%', height: 'auto' }}
              draggable={false}
              onLoad={handleImageLoad}
            />
            {/* Answer Layers */}
            {answerLayers.map((layer) => (
              visibleLayers[layer.equipmentId] && (
                <img
                  key={layer.equipmentId}
                  src={layer.image}
                  alt={`Answer Layer ${layer.equipmentId}`}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  style={{ opacity: 0.7 }}
                />
              )
            ))}
            <div className="absolute top-0 left-0 w-full h-full">
              {markers.map((marker) => (
                <MarkerComponent
                  key={marker.id}
                  marker={marker}
                  onRemove={onMarkerRemove}
                  size={markerSize}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Controls Container at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 mb-4">
          {/* Quick Toolbar */}
          <div
            ref={toolbarRef}
            className={`flex items-center gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg transition-opacity duration-200 ${
              showToolbar ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Zoom"
            >
              <Maximize2 size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onHandToolToggle(!isHandToolActive)
              }}
              className={`p-2 rounded-lg transition-colors ${
                isHandToolActive 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'hover:bg-gray-100'
              }`}
              title="Hand Tool (or use right-click to pan)"
            >
              <Hand size={20} />
            </button>
            
            {markers.length > 0 && (
              <>
                <div className="w-px h-6 bg-gray-200" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClearAll()
                  }}
                  className="flex items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  title="Clear All Markers"
                >
                  <Trash2 size={20} />
                  <span className="text-sm font-medium">Clear All</span>
                </button>
              </>
            )}
          </div>

          {/* Layer Controls */}
          {answerLayers.length > 0 && (
            <LayerControls
              answerLayers={answerLayers}
              visibleLayers={visibleLayers}
              onToggleLayer={onToggleLayer}
              onToggleAllLayers={onToggleAllLayers}
            />
          )}
        </div>
      </div>
    </div>
  )
})

ImageViewer.displayName = 'ImageViewer'

export default ImageViewer
