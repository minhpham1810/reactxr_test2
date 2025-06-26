import { useXR } from '@react-three/xr'
import { Text } from '@react-three/drei'
import { useState } from 'react'

function ARButton({ label, onClick, position, color = '#2196F3' }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group position={position}>
      <mesh
        castShadow
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : color}
          metalness={0.5}
          roughness={0.5}
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

export function ARToolbar({ position, onAddNode, onReset, onExit }) {
  const { isPresenting } = useXR()

  if (!isPresenting) return null

  return (
    <group position={position}>
      {/* Background panel */}
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

      {/* Title */}
      <Text
        position={[0, 0.12, 0.02]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Linked List Tools
      </Text>

      {/* Buttons */}
      <ARButton
        label="Add Node"
        onClick={onAddNode}
        position={[0, 0, 0.02]}
        color="#2196F3"
      />

      <ARButton
        label="Reset"
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