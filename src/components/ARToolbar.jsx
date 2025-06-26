import { Text } from '@react-three/drei'
import { useState, useRef } from 'react'

// Material constants
const COLORS = {
  primary: '#2196F3',
  success: '#4CAF50',
  danger: '#f44336',
  purple: '#9c27b0',
  white: '#ffffff',
  background: '#333333'
}

const DIMENSIONS = {
  button: {
    width: 0.3,
    height: 0.1,
    depth: 0.05,
    textSize: 0.04,
    spacing: 0.12
  },
  toolbar: {
    width: 0.8,
    height: 0.4,
    depth: 0.02,
    titleSize: 0.05
  }
}

const MATERIAL = {
  metalness: 0.5,
  roughness: 0.5,
  opacity: 0.9,
  toolbarOpacity: 0.8
}

function ARButton({
  label,
  onClick,
  position,
  color = COLORS.primary
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
        <boxGeometry args={[
          DIMENSIONS.button.width,
          DIMENSIONS.button.height,
          DIMENSIONS.button.depth
        ]} />
        <meshStandardMaterial
          color={hovered ? COLORS.white : color}
          metalness={MATERIAL.metalness}
          roughness={MATERIAL.roughness}
          transparent
          opacity={MATERIAL.opacity}
          emissive={hovered ? color : COLORS.white}
          emissiveIntensity={0.3}
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

export function ARToolbar({ 
  position, 
  onAddNode, 
  onReset, 
  onExit, 
  isPresenting, 
  onStartInsert, 
  exerciseMode, 
  isComplete 
}) {
  const groupRef = useRef()

  // Show toolbar in AR mode only, but add debug logging
  console.log('ARToolbar - isPresenting:', isPresenting, 'position:', position)
  
  if (!isPresenting) return null

  return (
    <group position={position} ref={groupRef}>
      {/* Debug sphere to ensure the toolbar is being rendered */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#FF0000"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Make the background more visible and larger */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[
          DIMENSIONS.toolbar.width,
          exerciseMode ? 0.6 : DIMENSIONS.toolbar.height,
          DIMENSIONS.toolbar.depth
        ]} />
        <meshStandardMaterial
          color={COLORS.background}
          opacity={1.0}
          transparent={false}
          metalness={MATERIAL.metalness}
          roughness={MATERIAL.roughness}
          emissive={COLORS.background}
          emissiveIntensity={0.5}
        />
      </mesh>

      <Text
        position={[0, exerciseMode ? 0.22 : 0.12, 0.02]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {exerciseMode ? `${exerciseMode.toUpperCase()} Exercise` : 'Linked List Tools'}
      </Text>

      {/* Exercise status */}
      {exerciseMode && (
        <Text
          position={[0, 0.15, 0.02]}
          fontSize={0.03}
          color={isComplete ? "#4CAF50" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.7}
        >
          {isComplete ? "✅ Complete!" : "Insert node value 5 at position 2"}
        </Text>
      )}

      {!exerciseMode ? (
        <>
          <ARButton
            label="Start Insert"
            onClick={onStartInsert}
            position={[0, 0.06, 0.02]}
            color={COLORS.success}
          />

          <ARButton
            label="Add Node"
            onClick={onAddNode}
            position={[0, -0.06, 0.02]}
            color={COLORS.primary}
          />

          <ARButton
            label="Reset"
            onClick={onReset}
            position={[0, -0.18, 0.02]}
            color={COLORS.danger}
          />
        </>
      ) : (
        <>
          <ARButton
            label="Add Target"
            onClick={onAddNode}
            position={[0, 0.06, 0.02]}
            color={COLORS.purple}
          />

          <ARButton
            label="Reset"
            onClick={onReset}
            position={[0, -0.06, 0.02]}
            color={COLORS.danger}
          />
        </>
      )}

      <ARButton
        label="Exit AR"
        onClick={onExit}
        position={[0, exerciseMode ? -0.24 : -0.30, 0.02]}
        color={COLORS.purple}
      />
    </group>
  )
}