import { Eye, EyeOff, Hand, Maximize2, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import { Marker } from '../types'
import MarkerComponent from './MarkerComponent'
import { useState, useCallback, useRef, MouseEvent, useEffect, forwardRef, useImperativeHandle } from 'react'

const ANSWER_OVERLAY_OPACITY = 0.5;
const MARKERS_OPACITY = 1.0;

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
  answerImage?: string | null
  showAnswer?: boolean
  markers: Marker[]
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onMarkerRemove: (id: number) => void
  onClearAll: () => void
  isHandToolActive: boolean
  onHandToolToggle: (active: boolean) => void
  onZoomPanChange?: (isZoomedOrPanned: boolean) => void
  onToggleAnswer: () => void
  markerSize?: number
}

export interface ImageViewerRef {
  handleResetZoom: () => void
}

interface SyntheticMouseEvent extends React.MouseEvent<HTMLDivElement> {
  currentTarget: {
    getBoundingClientRect: () => DOMRect;
  };
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
  onZoomPanChange,
  onToggleAnswer,
  markerSize = 24
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

  const isZoomedOrPanned = scale !== 1 || position.x !== 0 || position.y !== 0

  // Update image dimensions when container size changes
  const updateImageDimensions = useCallback(() => {
    if (containerRef.current && imageRef.current) {
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
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      updateImageDimensions()
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateImageDimensions])

  useEffect(() => {
    onZoomPanChange?.(isZoomedOrPanned)
  }, [isZoomedOrPanned, onZoomPanChange])

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

    // Get the click position relative to the container
    const containerX = clientX - containerRect.left
    const containerY = clientY - containerRect.top

    // Calculate the center of the container
    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2

    // Calculate the offset from the center, accounting for scale and pan
    const offsetX = (containerX - containerCenterX - position.x) / scale
    const offsetY = (containerY - containerCenterY - position.y) / scale

    // Calculate the image bounds
    const imageLeft = imageDimensions.left
    const imageTop = imageDimensions.top
    const imageWidth = imageDimensions.width
    const imageHeight = imageDimensions.height

    // Calculate the click position relative to the image's original position
    const imageX = containerCenterX + offsetX - imageLeft
    const imageY = containerCenterY + offsetY - imageTop

    // Convert to percentages
    const percentX = (imageX / imageWidth) * 100
    const percentY = (imageY / imageHeight) * 100

    // Validate that the click is within the image bounds
    if (percentX < 0 || percentX > 100 || percentY < 0 || percentY > 100) {
      return null
    }

    return { x: percentX, y: percentY }
  }, [scale, position, imageDimensions])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHandToolActive) {
      setIsDragging(true)
      setStartPanPosition({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setShowToolbar(false)
  }

  const handleMouseEnter = () => {
    setShowToolbar(true)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHandToolActive || isDragging || !imageDimensions) return

    if (toolbarRef.current?.contains(e.target as Node)) {
      return
    }

    const markerPosition = calculateMarkerPosition(e.clientX, e.clientY)
    if (markerPosition) {
      const syntheticEvent: SyntheticMouseEvent = {
        ...e,
        currentTarget: {
          getBoundingClientRect: () => ({
            left: 0,
            top: 0,
            width: 100,
            height: 100,
            right: 100,
            bottom: 100,
            x: 0,
            y: 0,
            toJSON() {
            return {
              left: this.left,
              top: this.top,
              width: this.width,
              height: this.height,
              right: this.right,
              bottom: this.bottom,
              x: this.x,
              y: this.y
            };
          }
          })
        }
      }

      // Update clientX and clientY
      Object.defineProperties(syntheticEvent, {
        clientX: { value: markerPosition.x },
        clientY: { value: markerPosition.y }
      })

      onImageClick(syntheticEvent)
    }
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
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
  }, [scale, position, constrainPosition, imageDimensions])

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newScale = Math.min(scale * 1.2, 4)
    setScale(newScale)
    const constrainedPosition = constrainPosition(position.x, position.y)
    setPosition(constrainedPosition)
  }

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newScale = Math.max(scale / 1.2, 1)
    setScale(newScale)
    const constrainedPosition = constrainPosition(position.x, position.y)
    setPosition(constrainedPosition)
  }

  const handleResetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  useImperativeHandle(ref, () => ({
    handleResetZoom: () => handleResetZoom()
  }))

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
            : 'cursor-crosshair'
        }`}
        onClick={handleImageClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <div
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-100 ease-out select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center'
          }}
        >
          {/* Image wrapper to maintain aspect ratio */}
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
            {showAnswer && answerImage && (
              <img
                src={answerImage}
                alt="Answer Overlay"
                className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
                style={{ opacity: ANSWER_OVERLAY_OPACITY }}
              />
            )}
            {/* Marker container that matches image dimensions */}
            <div className="absolute top-0 left-0 w-full h-full">
              {markers.map((marker) => (
                <MarkerComponent
                  key={marker.id}
                  marker={marker}
                  onRemove={onMarkerRemove}
                  showAnswer={showAnswer}
                  opacity={MARKERS_OPACITY}
                  size={markerSize}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Answer Toggle Button */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleAnswer()
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg transition-all duration-200 ${
              showAnswer 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {showAnswer ? (
              <>
                <EyeOff size={20} />
                <span className="font-medium">Hide Answer</span>
              </>
            ) : (
              <>
                <Eye size={20} />
                <span className="font-medium">Show Answer</span>
              </>
            )}
          </button>
        </div>

        {/* Floating Toolbar */}
        <div className={`absolute left-1/2 -translate-x-1/2 bottom-4 transition-opacity duration-200 ${
          showToolbar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div
            ref={toolbarRef}
            className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg"
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
              title="Hand Tool"
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
                  <span className="text-sm font-medium">Clear All Markers</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

ImageViewer.displayName = 'ImageViewer'

export default ImageViewer
