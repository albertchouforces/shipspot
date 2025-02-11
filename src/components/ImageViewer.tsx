import { Trash2, ZoomIn, ZoomOut, Maximize2, Hand } from 'lucide-react'
import { Marker } from '../types'
import MarkerComponent from './MarkerComponent'
import { useState, useCallback, useRef, MouseEvent, useEffect, forwardRef, useImperativeHandle } from 'react'

const ANSWER_OVERLAY_OPACITY = 1.0;
const MARKERS_OPACITY = 0.15;

interface ImageDimensions {
  width: number;
  height: number;
  left: number;
  top: number;
}

interface ImageViewerProps {
  image: string | null
  answerImage?: string | null
  showAnswer?: boolean
  markers: Marker[]
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onMarkerRemove: (id: number) => void
  onClearAll: () => void
  isHandToolActive: boolean
  onHandToolToggle: (active: boolean) => void
  onZoomPanChange?: (isZoomedOrPanned: boolean) => void
}

export interface ImageViewerRef {
  handleResetZoom: () => void
}

const ImageViewer = forwardRef<ImageViewerRef, ImageViewerProps>(({ 
  image, 
  answerImage,
  showAnswer,
  markers, 
  onImageClick, 
  onMarkerRemove, 
  onClearAll,
  isHandToolActive,
  onHandToolToggle,
  onZoomPanChange
}, ref) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const isZoomedOrPanned = scale !== 1 || position.x !== 0 || position.y !== 0

  useEffect(() => {
    onZoomPanChange?.(isZoomedOrPanned)
  }, [isZoomedOrPanned, onZoomPanChange])

  const handleImageLoad = useCallback(() => {
    if (containerRef.current && imageRef.current) {
      const container = containerRef.current
      const image = imageRef.current
      const containerRect = container.getBoundingClientRect()
      const imageRect = image.getBoundingClientRect()

      setImageDimensions({
        width: imageRect.width,
        height: imageRect.height,
        left: (containerRect.width - imageRect.width) / 2,
        top: (containerRect.height - imageRect.height) / 2
      })
    }
  }, [])

  const constrainPosition = useCallback((newX: number, newY: number): { x: number, y: number } => {
    if (!containerRef.current || !imageRef.current) return { x: newX, y: newY }

    const container = containerRef.current
    const image = imageRef.current
    
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    
    const imageWidth = image.clientWidth * scale
    const imageHeight = image.clientHeight * scale
    
    const maxX = Math.max((imageWidth - containerWidth) / 2, 0)
    const maxY = Math.max((imageHeight - containerHeight) / 2, 0)

    return {
      x: Math.min(Math.max(newX, -maxX), maxX),
      y: Math.min(Math.max(newY, -maxY), maxY)
    }
  }, [scale])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const delta = -e.deltaY
    const newScale = scale * (1 + delta * 0.001)
    const boundedScale = Math.min(Math.max(newScale, 1), 4)

    if (containerRef.current) {
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
  }, [scale, position, constrainPosition])

  const calculateMarkerPosition = useCallback((clientX: number, clientY: number): { x: number, y: number } | null => {
    if (!containerRef.current || !imageRef.current || !imageDimensions) return null

    const container = containerRef.current
    const image = imageRef.current
    const rect = container.getBoundingClientRect()

    // Calculate the actual image dimensions and position after scaling
    const scaledImageWidth = image.width * scale
    const scaledImageHeight = image.height * scale
    
    // Calculate the image position relative to the container
    const imageLeft = (rect.width - scaledImageWidth) / 2 + position.x
    const imageTop = (rect.height - scaledImageHeight) / 2 + position.y

    // Calculate click position relative to the container
    const clickX = clientX - rect.left
    const clickY = clientY - rect.top

    // Calculate click position relative to the scaled image
    const imageRelativeX = (clickX - imageLeft) / scale
    const imageRelativeY = (clickY - imageTop) / scale

    // Convert to percentages
    const percentX = (imageRelativeX / image.width) * 100
    const percentY = (imageRelativeY / image.height) * 100

    // Check if the click is within the image bounds
    if (percentX >= 0 && percentX <= 100 && percentY >= 0 && percentY <= 100) {
      return { x: percentX, y: percentY }
    }

    return null
  }, [scale, position, imageDimensions])

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isHandToolActive) {
      setIsDragging(true)
      setStartPanPosition({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging && isHandToolActive) {
      const newX = e.clientX - startPanPosition.x
      const newY = e.clientY - startPanPosition.y
      const constrainedPosition = constrainPosition(newX, newY)
      setPosition(constrainedPosition)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 4)
    setScale(newScale)
    const constrainedPosition = constrainPosition(position.x, position.y)
    setPosition(constrainedPosition)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale / 1.2, 1)
    setScale(newScale)
    const constrainedPosition = constrainPosition(position.x, position.y)
    setPosition(constrainedPosition)
  }

  const handleResetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  useImperativeHandle(ref, () => ({
    handleResetZoom
  }))

  const toggleHandTool = () => {
    onHandToolToggle(!isHandToolActive)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHandToolActive || isDragging) return
    e.preventDefault()

    const markerPosition = calculateMarkerPosition(e.clientX, e.clientY)
    if (markerPosition) {
      const syntheticEvent = {
        ...e,
        currentTarget: containerRef.current!,
        clientX: e.clientX,
        clientY: e.clientY
      }
      onImageClick(syntheticEvent)
    }
  }

  if (!image) {
    return (
      <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">Upload an image for this scenario</p>
      </div>
    )
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {markers.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClearAll()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-red-600"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={toggleHandTool}
          className={`p-2 border rounded-lg shadow-sm transition-colors ${
            isHandToolActive 
              ? 'bg-blue-100 border-blue-300 text-blue-700' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Hand size={16} />
        </button>
      </div>
      <div 
        ref={containerRef}
        className={`relative w-full h-full border rounded-lg overflow-hidden bg-white select-none ${
          isHandToolActive
            ? isDragging ? 'cursor-grabbing' : 'cursor-grab'
            : 'cursor-crosshair'
        }`}
        onClick={handleImageClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="absolute w-full h-full transition-transform duration-100 ease-out select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center'
          }}
        >
          <img 
            ref={imageRef}
            src={image} 
            alt="Ship Compartment"
            className="w-full h-full object-contain select-none"
            draggable={false}
            onLoad={handleImageLoad}
          />
          {showAnswer && answerImage && (
            <img
              src={answerImage}
              alt="Answer Overlay"
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
              style={{ opacity: ANSWER_OVERLAY_OPACITY }}
            />
          )}
          {markers.map((marker) => (
            <MarkerComponent
              key={marker.id}
              marker={marker}
              onRemove={onMarkerRemove}
              showAnswer={showAnswer}
              opacity={MARKERS_OPACITY}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

ImageViewer.displayName = 'ImageViewer'

export default ImageViewer
