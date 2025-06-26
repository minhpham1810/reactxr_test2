import { useRef } from 'react'
import { CatmullRomLine, Sphere } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export function NodeConnection({ startPos, endPos }) {
  const arrowRef = useRef()
  const pulseRef = useRef(0)

  // Animate the connection with a pulse effect
  useFrame((state, delta) => {
    pulseRef.current += delta * 2
    if (arrowRef.current) {
      arrowRef.current.material.opacity = 0.5 + Math.sin(pulseRef.current) * 0.3
    }
  })

  // Calculate control points for a curved path
  const midPoint = {
    x: (startPos.x + endPos.x) / 2,
    y: startPos.y + 0.5,
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
    x: endPos.x - normalized.x * 0.3,
    y: endPos.y - normalized.y * 0.3,
    z: endPos.z - normalized.z * 0.3
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
        color="#2196F3"
        lineWidth={6}
        tension={0.5}
      />

      {/* Glowing core line */}
      <CatmullRomLine
        points={points}
        color="#64B5F6"
        lineWidth={3}
        tension={0.5}
      />

      {/* Arrow indicator */}
      <mesh
        position={[arrowPos.x, arrowPos.y, arrowPos.z]}
        ref={arrowRef}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#2196F3"
          transparent
          opacity={0.8}
          emissive="#64B5F6"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}