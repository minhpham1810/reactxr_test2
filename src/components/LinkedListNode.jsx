import { useRef, useState, useEffect } from 'react'
import { Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { Vector3 } from 'three'

// Node appearance constants
const COLORS = {
  default: '#2196F3',
  selected: '#4CAF50',
  hovered: '#FF9800',
  white: '#ffffff',
  black: '#000000'
}

const DIMENSIONS = {
  cylinder: {
    radius: 0.5,
    height: 0.2,
    segments: 32
  },
  text: {
    size: 0.2,
    height: 0.2
  },
  torus: {
    radius: 0.6,
    tube: 0.02,
    radialSegments: 16,
    tubularSegments: 32
  }
}

const MATERIAL = {
  metalness: 0.5,
  roughness: 0.5,
  emissiveIntensity: 0.2
}

export function LinkedListNode({
  position,
  data,
  isSelected,
  onSelect,
  onDragEnd,
  onDragStateChange,
  isPresenting,
  nodeIndex,
  showIndex = false,
  isStaging = false
}) {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const { camera } = useThree()
  const { session } = useXR()
  
  const dragPos = useRef()
  const dragTimeoutRef = useRef()
  const mouseDownRef = useRef(false)
  const holdTimeoutRef = useRef()
  
  useEffect(() => {
    if (meshRef.current && position) {
      // Handle both array and object position formats
      if (Array.isArray(position)) {
        meshRef.current.position.set(position[0], position[1], position[2])
      } else {
        meshRef.current.position.set(position.x, position.y, position.z)
      }
    }
  }, [position])

  // Cleanup timeout on unmount and add global mouse handling
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (mouseDownRef.current && !isPresenting) {
        mouseDownRef.current = false
        if (isDragging) {
          setIsDragging(false)
          onDragStateChange?.(false) // Notify parent that dragging stopped
          setDragProgress(0)
          if (meshRef.current) {
            onDragEnd({
              x: meshRef.current.position.x,
              y: meshRef.current.position.y,
              z: meshRef.current.position.z
            })
          }
        }
        if (holdTimeoutRef.current) {
          clearTimeout(holdTimeoutRef.current)
          holdTimeoutRef.current = null
        }
      }
    }

    const handleGlobalMouseMove = (event) => {
      if (isDragging && !isPresenting && meshRef.current) {
        // Convert screen coordinates to world coordinates
        const canvas = event.target.closest('canvas')
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
          
          // Use the camera from useThree to unproject the screen coordinates
          if (camera) {
            const vector = new Vector3(x, y, 0.5)
            vector.unproject(camera)
            
            const dir = vector.sub(camera.position).normalize()
            const distance = -camera.position.y / dir.y
            const pos = camera.position.clone().add(dir.multiplyScalar(distance))
            
            meshRef.current.position.set(pos.x, 0.5, pos.z) // Keep Y at 0.5 for consistency
          }
        }
      }
    }

    // Add global listeners for web mode
    if (!isPresenting) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('pointerup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('pointermove', handleGlobalMouseMove)
    }

    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current)
      }
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('pointerup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('pointermove', handleGlobalMouseMove)
    }
  }, [isDragging, isPresenting, onDragEnd, camera])

  // Hover and selection effects
  useFrame(() => {
    if (isHovered || isSelected) {
      meshRef.current.rotation.y += 0.02
    }
    
    if (isDragging) {
      // Update position based on pointer/controller
      if (isPresenting) {
        // AR dragging logic
        const controller = camera.parent
        if (controller) {
          meshRef.current.position.copy(controller.position)
        }
      }
    }
  })

  // Enhanced AR interaction with simplified dragging
  useFrame(() => {
    if (isDragging && isPresenting && meshRef.current) {
      // In AR mode, use camera position for dragging guidance
      // This provides a simple interaction where nodes follow head movement when selected
      const cameraPosition = camera.position.clone()
      cameraPosition.y -= 0.5 // Offset to appear in front of user
      cameraPosition.z -= 1   // Move it forward
      
      meshRef.current.position.lerp(cameraPosition, 0.1) // Smooth interpolation
    }
  })

  const handlePointerDown = (e) => {
    e.stopPropagation()
    mouseDownRef.current = true
    
    if (isPresenting) {
      // In AR mode, immediate selection and auto-release timer
      setIsDragging(true)
      onDragStateChange?.(true) // Notify parent that dragging started
      onSelect()
      
      // Auto-release after 3 seconds in AR mode
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
      
      // Progress indicator for AR dragging
      const startTime = Date.now()
      const duration = 3000
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setDragProgress(progress)
        
        if (progress < 1) {
          requestAnimationFrame(updateProgress)
        }
      }
      updateProgress()
      
      dragTimeoutRef.current = setTimeout(() => {
        setIsDragging(false)
        onDragStateChange?.(false) // Notify parent that dragging stopped
        setDragProgress(0)
        mouseDownRef.current = false
        if (meshRef.current) {
          onDragEnd({
            x: meshRef.current.position.x,
            y: meshRef.current.position.y,
            z: meshRef.current.position.z
          })
        }
      }, duration)
    } else {
      // Web mode - click and hold system
      if (meshRef.current) {
        dragPos.current = meshRef.current.position.clone()
      }
      
      // Start hold timer (100ms to differentiate between click and hold)
      holdTimeoutRef.current = setTimeout(() => {
        if (mouseDownRef.current) {
          setIsDragging(true)
          onDragStateChange?.(true) // Notify parent that dragging started
          onSelect()
        }
      }, 100)
    }
  }

  const handlePointerUp = (e) => {
    e.stopPropagation()
    mouseDownRef.current = false
    
    // Clear any timeouts
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
      dragTimeoutRef.current = null
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
    
    if (isDragging) {
      setIsDragging(false)
      onDragStateChange?.(false) // Notify parent that dragging stopped
      setDragProgress(0)
      // Notify parent of new position
      if (meshRef.current) {
        onDragEnd({
          x: meshRef.current.position.x,
          y: meshRef.current.position.y,
          z: meshRef.current.position.z
        })
      }
    } else if (!isPresenting) {
      // Quick click in web mode - just select without dragging
      onSelect()
    }
  }

  const handlePointerMove = (e) => {
    if (isDragging && !isPresenting && meshRef.current) {
      e.stopPropagation()
      // Use the intersection point from the raycaster
      const point = e.point || e.intersections?.[0]?.point
      if (point) {
        meshRef.current.position.copy(point)
      }
    }
  }

  const handlePointerLeave = (e) => {
    if (!isDragging) {
      setIsHovered(false)
    }
    // Don't clear dragging state when pointer leaves - continue dragging
  }

  return (
    <group
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
    >
      {/* Node body - enhanced for AR visibility with hold feedback */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[
          DIMENSIONS.cylinder.radius * (isPresenting ? 1.2 : 1) * (isDragging ? 1.1 : 1),
          DIMENSIONS.cylinder.radius * (isPresenting ? 1.2 : 1) * (isDragging ? 1.1 : 1),
          DIMENSIONS.cylinder.height * (isPresenting ? 1.5 : 1) * (isDragging ? 1.2 : 1),
          DIMENSIONS.cylinder.segments
        ]} />
        <meshStandardMaterial
          color={isDragging ? '#FF6B6B' :
                 isStaging ? '#FF9800' : 
                 isSelected ? COLORS.selected : 
                 isHovered ? COLORS.hovered : COLORS.default}
          metalness={MATERIAL.metalness}
          roughness={MATERIAL.roughness}
          emissive={isDragging ? '#FF6B6B' :
                    isHovered || isSelected || isPresenting ? COLORS.white : COLORS.black}
          emissiveIntensity={isDragging ? MATERIAL.emissiveIntensity * 3 :
                             isPresenting ? MATERIAL.emissiveIntensity * 2 : MATERIAL.emissiveIntensity}
          opacity={isStaging ? 0.8 : 1}
          transparent={isStaging}
        />
      </mesh>

      {/* Enhanced data display for AR with hold feedback */}
      <Text
        position={[0, DIMENSIONS.text.height * (isPresenting ? 1.5 : 1) * (isDragging ? 1.2 : 1), 0]}
        fontSize={DIMENSIONS.text.size * (isPresenting ? 1.3 : 1) * (isDragging ? 1.1 : 1)}
        color={isDragging ? '#FF6B6B' :
               isStaging ? '#FF9800' :
               isSelected ? COLORS.selected : 
               isHovered ? COLORS.hovered : COLORS.white}
        anchorX="center"
        anchorY="middle"
      >
        {data}
      </Text>

      {/* Index display for exercise mode */}
      {showIndex && nodeIndex !== undefined && !isStaging && (
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.15}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          index: {nodeIndex}
        </Text>
      )}

      {/* Staging indicator or hold indicator */}
      {isStaging && !isDragging && (
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.12}
          color="#FF9800"
          anchorX="center"
          anchorY="middle"
        >
          Drag to insert
        </Text>
      )}
      
      {isDragging && !isPresenting && (
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.12}
          color="#FF6B6B"
          anchorX="center"
          anchorY="middle"
        >
          Holding - Release to drop
        </Text>
      )}

      {/* AR dragging indicator with progress */}
      {isDragging && isPresenting && (
        <group position={[0, 0.8, 0]}>
          {/* Main indicator sphere */}
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Progress ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.15, 16, 1, 0, Math.PI * 2 * dragProgress]} />
            <meshStandardMaterial 
              color="#4CAF50" 
              emissive="#4CAF50"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
          
          {/* Timer text */}
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.08}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {Math.ceil((1 - dragProgress) * 3)}s
          </Text>
        </group>
      )}

      {/* Selection indicator - enhanced for AR */}
      {(isSelected || isHovered) && (
        <mesh position={[0, -DIMENSIONS.text.height * (isPresenting ? 1.5 : 1), 0]}>
          <torusGeometry args={[
            DIMENSIONS.torus.radius * (isPresenting ? 1.2 : 1),
            DIMENSIONS.torus.tube * (isPresenting ? 1.5 : 1),
            DIMENSIONS.torus.radialSegments,
            DIMENSIONS.torus.tubularSegments
          ]} />
          <meshStandardMaterial
            color={isSelected ? COLORS.selected : COLORS.hovered}
            emissive={isSelected ? COLORS.selected : COLORS.hovered}
            emissiveIntensity={MATERIAL.emissiveIntensity * (isPresenting ? 4 : 2.5)}
          />
        </mesh>
      )}
    </group>
  )
}