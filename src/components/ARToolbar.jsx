import { Text } from '@react-three/drei'
import { useState, useRef } from 'react'

function ARButton({
  label,
  onClick,
  position,
  color = '#2196F3'
}) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()

  const handlePointerDown = (e) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        castShadow
        onPointerDown={handlePointerDown}
        onPointerEnter={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
      >
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : color}
          metalness={0.5}
          roughness={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Text
        position={[0, 0, 0.03]}
        fontSize={0.04}
        color={hovered ? color : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

export function ARToolbar({ position, onAddNode, onReset, onExit, isPresenting }) {
  const groupRef = useRef()

  if (!isPresenting) return null

  return (
    <group position={position} ref={groupRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.4, 0.02]} />
        <meshStandardMaterial
          color="#333333"
          opacity={0.8}
          transparent
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      <Text
        position={[0, 0.12, 0.02]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Linked List Tools
      </Text>

      <ARButton
        label="Insert Node"
        onClick={onAddNode}
        position={[0, 0, 0.02]}
        color="#4CAF50"
      />

      <ARButton
        label="Reset List"
        onClick={onReset}
        position={[0, -0.12, 0.02]}
        color="#f44336"
      />

      <ARButton
        label="Exit AR"
        onClick={onExit}
        position={[0, -0.24, 0.02]}
        color="#9c27b0"
      />
    </group>
  )
}