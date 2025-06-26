import { useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useXR } from '@react-three/xr'

export function LinkedListNode({ position, data, isSelected, onSelect, onDragEnd }) {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)
  const { isPresenting } = useXR()

  // Hover effects
  useFrame(() => {
    if (isHovered || isSelected) {
      meshRef.current.rotation.y += 0.02
    }
  })

  const handleGrab = (e) => {
    if (isPresenting) {
      onSelect()
    }
  }

  const handleClick = (e) => {
    if (!isPresenting) {
      onSelect()
    }
  }

  return (
    <group
      position={position}
      ref={meshRef}
      onClick={handleClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onGrabStart={handleGrab}
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