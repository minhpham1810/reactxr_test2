import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Text, Html } from '@react-three/drei'
import { useState } from 'react'
import { XR, createXRStore, useXR } from '@react-three/xr'
import './App.css'

// Helper to generate a random array
function randomArray(length = 6, min = 1, max = 9) {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

const store = createXRStore({ frameRate: 90, foveation: 1 })

function InsertionSortVisualizer({
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
              color="#fff"
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

export function App() {
  // Insertion sort state and logic
  const [array, setArray] = useState(randomArray())
  const [step, setStep] = useState(1)
  const [i, setI] = useState(1)
  const [j, setJ] = useState(1)
  const [isSorting, setIsSorting] = useState(false)
  const [done, setDone] = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)
  const [mode, setMode] = useState('demo') // 'demo' or 'exercise'
  const [exerciseArray, setExerciseArray] = useState(randomArray())
  const [moveHistory, setMoveHistory] = useState([])
  const [exerciseFeedback, setExerciseFeedback] = useState('')

  // Step through insertion sort (Demo Mode)
  const nextStep = () => {
    if (done) return
    let arr = [...array]
    let _i = i
    let _j = j
    let sorting = true
    let finished = false
    if (_i >= arr.length) {
      sorting = false
      finished = true
    } else {
      if (_j > 0 && arr[_j] < arr[_j - 1]) {
        // Swap
        const temp = arr[_j]
        arr[_j] = arr[_j - 1]
        arr[_j - 1] = temp
        _j--
      } else {
        _i++
        _j = _i
      }
      if (_i >= arr.length) {
        sorting = false
        finished = true
      }
    }
    setArray(arr)
    setI(_i)
    setJ(_j)
    setStep(_i)
    setIsSorting(sorting)
    setDone(finished)
  }

  const reset = () => {
    setArray(randomArray())
    setStep(1)
    setI(1)
    setJ(1)
    setIsSorting(false)
    setDone(false)
    setExerciseArray(randomArray())
    setMoveHistory([])
    setExerciseFeedback('')
  }

  // Undo for Exercise Mode
  const undoExercise = () => {
    if (moveHistory.length > 0) {
      const prev = moveHistory[moveHistory.length - 1]
      setExerciseArray(prev.array)
      setMoveHistory(moveHistory.slice(0, -1))
      setExerciseFeedback('')
    }
  }

  // 3D Mode Toggle Button
  const renderModeToggle = (SCENE_SCALE) => (
    <group position={[0, 2.1 * SCENE_SCALE, -1 * SCENE_SCALE]}>
      <mesh
        onClick={() => setMode(mode === 'demo' ? 'exercise' : 'demo')}
        scale={[1.2 * SCENE_SCALE, 0.4 * SCENE_SCALE, 0.1 * SCENE_SCALE]}
      >
        <boxGeometry args={[1, 0.32, 0.08]} />
        <meshStandardMaterial color={mode === 'demo' ? '#2196f3' : '#f9d923'} />
        <Text
          position={[0, 0, 0.06 * SCENE_SCALE]}
          fontSize={0.16 * SCENE_SCALE}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {mode === 'demo' ? 'Switch to Exercise' : 'Switch to Demo'}
        </Text>
      </mesh>
    </group>
  )

  // AR enter/exit logic
  const handleEnterAR = () => {
    store.enterAR()
  }
  const handleExitAR = () => {
    store.exitAR()
  }

  // Listen for AR presenting state
  const XRStatus = () => {
    const xr = useXR()
    if (xr.isPresenting && !isPresenting) setIsPresenting(true)
    if (!xr.isPresenting && isPresenting) setIsPresenting(false)
    return null
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows
        className="scene-canvas"
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.2, 2.2], fov: 60 }}
        style={{ background: '#181a20', width: '100vw', height: '100vh', display: 'block' }}
      >
        <XR store={store}>
          <XRStatus />
          {/* Enter AR button as Html overlay, only when not in AR */}
          {!isPresenting && (
            <Html center style={{ pointerEvents: 'auto' }}>
              <button
                onClick={handleEnterAR}
                style={{ fontSize: 20, padding: '12px 32px', borderRadius: 10, background: '#4caf50', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Enter AR
              </button>
            </Html>
          )}
          {/* AR-only Exit AR button */}
          {isPresenting && (
            <Html center style={{ pointerEvents: 'auto', top: 24 }}>
              <button
                onClick={handleExitAR}
                style={{ fontSize: 20, padding: '12px 32px', borderRadius: 10, background: '#e53935', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Exit AR
              </button>
            </Html>
          )}
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 4, 2]} intensity={1.1} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} minDistance={1.2} maxDistance={6} target={[0, 1.2, -1]} />
          {/* 3D Mode Toggle Button */}
          {renderModeToggle(0.7)}
          {/* Main Visualizer: Demo or Exercise Mode */}
          {mode === 'demo' ? (
            <InsertionSortVisualizer
              array={array}
              i={i}
              j={j}
              isSorting={isSorting}
              done={done}
              nextStep={nextStep}
              reset={reset}
            />
          ) : (
            <ExerciseSortVisualizer
              array={exerciseArray}
              setArray={setExerciseArray}
              moveHistory={moveHistory}
              setMoveHistory={setMoveHistory}
              feedback={exerciseFeedback}
              setFeedback={setExerciseFeedback}
              undo={undoExercise}
              reset={reset}
            />
          )}
          <Environment preset="park" />
        </XR>
      </Canvas>
    </div>
  )
}

// Scaffold ExerciseSortVisualizer for Exercise Mode
function ExerciseSortVisualizer({ array, setArray, moveHistory, setMoveHistory, feedback, setFeedback, undo, reset }) {
  // Use the same SCENE_SCALE as the demo
  const SCENE_SCALE = 0.7
  const compartmentCount = array.length
  const boxWidth = 2.4 * SCENE_SCALE
  const boxHeight = 0.18 * SCENE_SCALE
  const boxDepth = 0.3 * SCENE_SCALE
  const compartmentWidth = boxWidth / compartmentCount
  const yBase = 1.2 * SCENE_SCALE
  const zBase = -1 * SCENE_SCALE

  // TODO: Implement drag-and-drop logic

  return (
    <>
      {/* Virtual window for feedback */}
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
          {feedback || 'Drag and drop the spheres to sort the array!'}
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
      {/* Spheres as elements (draggable UI only for now) */}
      {array.map((value, idx) => (
        <mesh
          key={idx + '-sphere'}
          position={[
            -boxWidth / 2 + compartmentWidth / 2 + idx * compartmentWidth,
            yBase + 0.18 * SCENE_SCALE,
            zBase
          ]}
          scale={1 * SCENE_SCALE}
        >
          <sphereGeometry args={[0.11 * SCENE_SCALE, 32, 32]} />
          <meshStandardMaterial color={'#2196f3'} />
          <Text
            position={[0, 0, 0.13 * SCENE_SCALE]}
            fontSize={0.13 * SCENE_SCALE}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            {value}
          </Text>
        </mesh>
      ))}
      {/* 3D Undo and Reset Buttons */}
      <group position={[0, yBase - 0.5 * SCENE_SCALE, zBase]}>
        {/* Undo Button */}
        <mesh
          position={[-0.5 * SCENE_SCALE, 0, 0]}
          onClick={undo}
        >
          <boxGeometry args={[0.7 * SCENE_SCALE, 0.18 * SCENE_SCALE, 0.08 * SCENE_SCALE]} />
          <meshStandardMaterial color={'#FFC107'} />
          <Text
            position={[0, 0, 0.06 * SCENE_SCALE]}
            fontSize={0.11 * SCENE_SCALE}
            color="#23283a"
            anchorX="center"
            anchorY="middle"
          >
            Undo
          </Text>
        </mesh>
        {/* Reset Button */}
        <mesh
          position={[0.5 * SCENE_SCALE, 0, 0]}
          onClick={reset}
        >
          <boxGeometry args={[0.7 * SCENE_SCALE, 0.18 * SCENE_SCALE, 0.08 * SCENE_SCALE]} />
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

export default App