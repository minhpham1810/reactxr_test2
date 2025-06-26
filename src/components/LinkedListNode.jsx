import { useRef, useState, useEffect } from 'react'
import { Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import * as THREE from 'three'

export function LinkedListNode({ position, data, isSelected, onSelect, onDragEnd }) {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { isPresenting } = useXR()
  const { camera } = useThree()
  
  const dragPos = useRef(new THREE.Vector3())
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(new THREE.Vector3(...position))
    }
  }, [position])

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

  const handlePointerDown = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    dragPos.current.copy(meshRef.current.position)
  }

  const handlePointerUp = (e) => {
    e.stopPropagation()
    if (isDragging) {
      setIsDragging(false)
      // Notify parent of new position
      onDragEnd([
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      ])
    } else {
      onSelect()
    }
  }

  const handlePointerMove = (e) => {
    if (isDragging && !isPresenting) {
      e.stopPropagation()
      const pos = new THREE.Vector3(e.point.x, e.point.y, e.point.z)
      meshRef.current.position.copy(pos)
    }
  }

  return (
    <group
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => !isDragging && setIsHovered(false)}
    >
      {/* Node body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
        <meshStandardMaterial
          color={isSelected ? "#4CAF50" : isHovered ? "#FF9800" : "#2196F3"}
          metalness={0.5}
          roughness={0.5}
          emissive={isHovered || isSelected ? "#ffffff" : "#000000"}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Data display */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.2}
        color={isSelected ? "#4CAF50" : isHovered ? "#FF9800" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
      >
        {data}
      </Text>

      {/* Selection indicator */}
      {(isSelected || isHovered) && (
        <mesh position={[0, -0.2, 0]}>
          <torusGeometry args={[0.6, 0.02, 16, 32]} />
          <meshStandardMaterial
            color={isSelected ? "#4CAF50" : "#FF9800"}
            emissive={isSelected ? "#4CAF50" : "#FF9800"}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}