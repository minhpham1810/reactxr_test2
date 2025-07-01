import { Text } from '@react-three/drei'
import React from 'react'

function DemoSortVisualizer({
  array, i, j, isSorting, done, nextStep, reset
}) {
  // Scale factor for the whole scene
  const SCENE_SCALE = 0.7
  // Visual parameters
  const compartmentCount = array.length
  const boxWidth = 2.4 * SCENE_SCALE
  const boxHeight = 0.18 * SCENE_SCALE
  const boxDepth = 0.3 * SCENE_SCALE
  const compartmentWidth = boxWidth / compartmentCount
  const yBase = 1.2 * SCENE_SCALE
  const zBase = -1 * SCENE_SCALE

  // Explanation for current step
  let explanation = ''
  if (done) {
    explanation = 'Array is fully sorted!'
  } else if (isSorting && i < array.length) {
    if (j > 0 && array[j] < array[j - 1]) {
      explanation = `Comparing ${array[j]} and ${array[j - 1]}. Swapping because ${array[j]} < ${array[j - 1]}.`
    } else if (j === i) {
      explanation = `Inserting element ${array[j]} into the sorted part of the array.`
    } else {
      explanation = `No swap needed. ${array[j]} is in the correct position.`
    }
  } else {
    explanation = 'Press Next Step to start sorting.'
  }

  // 3D Controls (Next Step, Reset) as clickable meshes
  const buttonY = yBase - 0.5 * SCENE_SCALE
  const buttonZ = zBase
  const buttonWidth = 0.7 * SCENE_SCALE
  const buttonHeight = 0.18 * SCENE_SCALE
  const buttonGap = 0.3 * SCENE_SCALE

  // Helper for button background color
  const buttonColor = (disabled) => disabled ? '#555a6a' : '#222a38'

  return (
    <>
      {/* Virtual window for explanation */}
      <group position={[0, yBase + 0.6 * SCENE_SCALE, zBase]}>
        <mesh>
          <boxGeometry args={[2.2 * SCENE_SCALE, 0.32 * SCENE_SCALE, 0.04 * SCENE_SCALE]} />
          <meshStandardMaterial color="#23283a" opacity={0.92} transparent />
        </mesh>
        <Text
          position={[0, 0, 0.04 * SCENE_SCALE]}
          fontSize={0.15 * SCENE_SCALE}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.0 * SCENE_SCALE}
        >
          {explanation}
        </Text>
      </group>
      {/* Array box with compartments */}
      <mesh position={[0, yBase, zBase]}>
        <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
        <meshStandardMaterial color="#222a38" />
      </mesh>
      {/* Compartments */}
      {array.map((_, idx) => (
        <mesh key={idx} position={[
          -boxWidth / 2 + compartmentWidth / 2 + idx * compartmentWidth,
          yBase,
          zBase + 0.001 * SCENE_SCALE
        ]}>
          <boxGeometry args={[compartmentWidth * 0.98, boxHeight * 0.96, boxDepth * 1.01]} />
          <meshStandardMaterial color="#2e3a4d" />
        </mesh>
      ))}
      {/* 0-indexed indices under the array */}
      {array.map((_, idx) => (
        <Text
          key={'idx-label-' + idx}
          position={[
            -boxWidth / 2 + compartmentWidth / 2 + idx * compartmentWidth,
            yBase - 0.16 * SCENE_SCALE,
            zBase + 0.03 * SCENE_SCALE
          ]}
          fontSize={0.11 * SCENE_SCALE}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {idx}
        </Text>
      ))}
      {/* Spheres as elements */}
      {array.map((value, idx) => {
        // Animate the current element being inserted
        let highlight = (idx === j && isSorting)
        let sorted = (idx < i && !isSorting)
        return (
          <mesh
            key={idx + '-sphere'}
            position={[
              -boxWidth / 2 + compartmentWidth / 2 + idx * compartmentWidth,
              yBase + 0.18 * SCENE_SCALE,
              zBase
            ]}
            scale={highlight ? 1.15 * SCENE_SCALE : 1 * SCENE_SCALE}
            castShadow
          >
            <sphereGeometry args={[0.11 * SCENE_SCALE, 32, 32]} />
            <meshStandardMaterial color={highlight ? '#f9d923' : sorted ? '#4caf50' : '#2196f3'} />
            {/* Value label */}
            <Text
              position={[0, 0, 0.13 * SCENE_SCALE]}
              fontSize={0.13 * SCENE_SCALE}
              color="#000"
              anchorX="center"
              anchorY="middle"
            >
              {value}
            </Text>
          </mesh>
        )
      })}
      {/* 3D Controls for AR and Web */}
      <group position={[0, buttonY, buttonZ]}>
        {/* Next Step Button */}
        <mesh
          position={[-buttonWidth / 2 - buttonGap / 2, 0, 0]}
          onClick={() => { if (!done) nextStep() }}
        >
          <boxGeometry args={[buttonWidth, buttonHeight, 0.08 * SCENE_SCALE]} />
          <meshStandardMaterial color={buttonColor(done)} />
          <Text
            position={[0, 0, 0.06 * SCENE_SCALE]}
            fontSize={0.11 * SCENE_SCALE}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            {done ? 'Sorted!' : 'Next Step'}
          </Text>
        </mesh>
        {/* Reset Button */}
        <mesh
          position={[buttonWidth / 2 + buttonGap / 2, 0, 0]}
          onClick={reset}
        >
          <boxGeometry args={[buttonWidth, buttonHeight, 0.08 * SCENE_SCALE]} />
          <meshStandardMaterial color={'#2e3a4d'} />
          <Text
            position={[0, 0, 0.06 * SCENE_SCALE]}
            fontSize={0.11 * SCENE_SCALE}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            Reset
          </Text>
        </mesh>
      </group>
    </>
  )
}

export default DemoSortVisualizer 