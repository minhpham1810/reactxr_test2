import { useRef } from 'react'
import { CatmullRomLine, Sphere } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

// Connection appearance constants
const COLORS = {
  line: '#2196F3',
  glow: '#64B5F6'
}

const DIMENSIONS = {
  lineWidth: {
    main: 6,
    glow: 3
  },
  arrow: {
    size: 0.08,
    segments: 16,
    distance: 0.3
  },
  curve: {
    tension: 0.5,
    heightOffset: 0.5
  }
}

const MATERIAL = {
  opacity: 0.8,
  emissiveIntensity: 0.5,
  pulseSpeed: 2,
  pulseRange: 0.3,
  baseOpacity: 0.5
}

export function NodeConnection({ startPos, endPos }) {
  const arrowRef = useRef()
  const pulseRef = useRef(0)

  // Animate the connection with a pulse effect
  useFrame((state, delta) => {
    pulseRef.current += delta * MATERIAL.pulseSpeed
    if (arrowRef.current) {
      arrowRef.current.material.opacity = MATERIAL.baseOpacity + Math.sin(pulseRef.current) * MATERIAL.pulseRange
    }
  })

  // Calculate control points for a curved path
  const midPoint = {
    x: (startPos.x + endPos.x) / 2,
    y: startPos.y + DIMENSIONS.curve.heightOffset,
    z: (startPos.z + endPos.z) / 2
  }

  // Calculate direction for arrow
  const direction = {
    x: endPos.x - startPos.x,
    y: endPos.y - startPos.y,
    z: endPos.z - startPos.z
  }
  const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2)
  const normalized = {
    x: direction.x / length,
    y: direction.y / length,
    z: direction.z / length
  }

  // Arrow position (slightly before end point)
  const arrowPos = {
    x: endPos.x - normalized.x * DIMENSIONS.arrow.distance,
    y: endPos.y - normalized.y * DIMENSIONS.arrow.distance,
    z: endPos.z - normalized.z * DIMENSIONS.arrow.distance
  }

  const points = [
    [startPos.x, startPos.y, startPos.z],
    [midPoint.x, midPoint.y, midPoint.z],
    [endPos.x, endPos.y, endPos.z]
  ]

  return (
    <group>
      {/* Main connection line */}
      <CatmullRomLine
        points={points}
        color={COLORS.line}
        lineWidth={DIMENSIONS.lineWidth.main}
        tension={DIMENSIONS.curve.tension}
      />

      {/* Glowing core line */}
      <CatmullRomLine
        points={points}
        color={COLORS.glow}
        lineWidth={DIMENSIONS.lineWidth.glow}
        tension={DIMENSIONS.curve.tension}
      />

      {/* Arrow indicator */}
      <mesh
        position={[arrowPos.x, arrowPos.y, arrowPos.z]}
        ref={arrowRef}
      >
        <sphereGeometry args={[
          DIMENSIONS.arrow.size,
          DIMENSIONS.arrow.segments,
          DIMENSIONS.arrow.segments
        ]} />
        <meshStandardMaterial
          color={COLORS.line}
          transparent
          opacity={MATERIAL.opacity}
          emissive={COLORS.glow}
          emissiveIntensity={MATERIAL.emissiveIntensity}
        />
      </mesh>
    </group>
  )
}