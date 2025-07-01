import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Text, Html } from '@react-three/drei'
import { useState, useRef } from 'react'
import { XR, createXRStore, useXR, XRHitTest, Interactive } from '@react-three/xr'
import './App.css'
import { Matrix4, Vector3 } from 'three'
import { getCompartmentPos, getNearestCompartment, checkSorted } from './sortHelpers';
import GeminiAPI from './gemini.js';
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
  const [isDragging, setIsDragging] = useState(false)

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
    <div className="app-root">
      <Canvas
        shadows
        className="scene-canvas"
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.2, 2.2], fov: 60 }}
        style={{}}
      >
        <XR store={store}>
          <XRStatus />
          {!isPresenting && (
            <Html center className="ar-enter-html">
              <button className="ar-enter-btn" onClick={handleEnterAR}>
                Enter AR
              </button>
            </Html>
          )}
          {isPresenting && (
            <group position={[0, 2.0, -1]}>
              <mesh
                position={[0, 0, 0]}
                onClick={handleExitAR}
              >
                <boxGeometry args={[1.2, 0.32, 0.08]} />
                <meshStandardMaterial color="#e53935" />
                <Text
                  position={[0, 0, 0.06]}
                  fontSize={0.18}
                  color="#fff"
                  anchorX="center"
                  anchorY="middle"
                >
                  Exit AR
                </Text>
              </mesh>
            </group>
          )}
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 4, 2]} intensity={1.1} />
          <OrbitControls enabled={!isDragging} enablePan={false} enableZoom={true} enableRotate={true} minDistance={1.2} maxDistance={6} target={[0, 1.2, -1]} />
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
              setIsDragging={setIsDragging}
            />
          )}
          <Environment preset="park" />
        </XR>
      </Canvas>
    </div>
  )
}

// Scaffold ExerciseSortVisualizer for Exercise Mode
function ExerciseSortVisualizer({ array, setArray, moveHistory, setMoveHistory, feedback, setFeedback, undo, reset, setIsDragging }) {
  // Use the same SCENE_SCALE as the demo
  const SCENE_SCALE = 0.7
  const compartmentCount = array.length
  const boxWidth = 2.4 * SCENE_SCALE
  const boxHeight = 0.18 * SCENE_SCALE
  const boxDepth = 0.3 * SCENE_SCALE
  const compartmentWidth = boxWidth / compartmentCount
  const yBase = 1.2 * SCENE_SCALE
  const zBase = -1 * SCENE_SCALE

  // Drag state
  const [draggedIdx, setDraggedIdx] = useState(null)
  const [dragPos, setDragPos] = useState(null)
  const dragging = draggedIdx !== null
  const meshRefs = useRef([])

  // AR drag state
  const [arDraggingIdx, setArDraggingIdx] = useState(null)
  const [arIsDragging, setArIsDragging] = useState(false)
  const [hitPos, setHitPos] = useState(null)
  const matrixHelper = useRef(new Matrix4())

  // Web drag handlers
  const handlePointerDown = (idx, e) => {
    e.stopPropagation()
    setDraggedIdx(idx)
    setDragPos(getCompartmentPos(idx, boxWidth, compartmentWidth, yBase, SCENE_SCALE, zBase))
    setIsDragging(true)
  }
  const handlePointerMove = (e) => {
    if (!dragging) return
    // Use e.point for accurate 3D cursor tracking
    const x = e.point.x
    setDragPos([x, yBase + 0.18 * SCENE_SCALE, zBase])
  }
  const handlePointerUp = (e) => {
    if (!dragging) return
    handleDrop(draggedIdx, dragPos)
    setIsDragging(false)
  }

  // AR drag handlers using Interactive and XRHitTest
  const handleARSelectStart = (idx) => {
    setArDraggingIdx(idx)
    setArIsDragging(true)
  }
  const handleARSelectEnd = () => {
    if (arDraggingIdx !== null && hitPos) {
      handleDrop(arDraggingIdx, hitPos)
    }
    setArDraggingIdx(null)
    setArIsDragging(false)
    setHitPos(null)
    setIsDragging(false)
  }

  const handleDrop = (idx, pos) => {
    const nearestIdx = getNearestCompartment(pos[0], array.length, boxWidth, compartmentWidth)
    if (nearestIdx === idx) {
      setDraggedIdx(null)
      setDragPos(null)
      return
    }
    // Move sphere from idx to nearestIdx
    const newArr = [...array]
    const [moved] = newArr.splice(idx, 1)
    newArr.splice(nearestIdx, 0, moved)
    setMoveHistory([...moveHistory, { array }])
    setArray(newArr)
    setDraggedIdx(null)
    setDragPos(null)
    // Check correctness
    const sorted = checkSorted(newArr)
    if (sorted) {
      setFeedback('Correct! The array is sorted.')
    } else {
      setFeedback('Keep sorting!')
    }
  }

  // Gemini suggestion loading state
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  // Async function to call Google Gemini API using imported GeminiAPI
  async function getGeminiSuggestion(array) {
    try {
      const suggestion = await GeminiAPI.generateSortSuggestion(array)
      return suggestion || 'No suggestion available.'
    } catch (err) {
      return 'Error fetching suggestion.'
    }
  }

  // Padding values
  const FEEDBACK_BOX_WIDTH = 2.0 * SCENE_SCALE;
  const FEEDBACK_BOX_HEIGHT = 0.7 * SCENE_SCALE;
  const FEEDBACK_BOX_DEPTH = 0.04 * SCENE_SCALE;
  const FEEDBACK_TEXT_PADDING = 0.12 * SCENE_SCALE;

  return (
    <>
      {/* XRHitTest for AR drag-and-drop */}
      {arIsDragging && (
        <XRHitTest
          onResults={(results, getWorldMatrix) => {
            if (results.length === 0) return
            getWorldMatrix(matrixHelper.current, results[0])
            const pos = new Vector3().setFromMatrixPosition(matrixHelper.current)
            setHitPos([pos.x, yBase + 0.18 * SCENE_SCALE, zBase])
          }}
        />
      )}
      {/* Virtual window for feedback */}
      <group position={[(boxWidth/2) + FEEDBACK_BOX_WIDTH/2 + 0.2 * SCENE_SCALE, yBase + 0.18 * SCENE_SCALE, zBase]}>
        <mesh>
          <boxGeometry args={[FEEDBACK_BOX_WIDTH, FEEDBACK_BOX_HEIGHT, FEEDBACK_BOX_DEPTH]} />
          <meshStandardMaterial color="#23283a" opacity={0.92} transparent />
        </mesh>
        <Text
          position={[-FEEDBACK_BOX_WIDTH/2 + FEEDBACK_TEXT_PADDING, 0, FEEDBACK_BOX_DEPTH/2 + 0.001]}
          fontSize={0.13 * SCENE_SCALE}
          color="#fff"
          anchorX="left"
          anchorY="middle"
          maxWidth={FEEDBACK_BOX_WIDTH - 2 * FEEDBACK_TEXT_PADDING}
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
      {/* Spheres as elements (draggable) */}
      {array.map((value, idx) => {
        const isDragged = draggedIdx === idx || arDraggingIdx === idx
        // AR: use hitPos if this sphere is being dragged in AR
        const pos = arIsDragging && arDraggingIdx === idx && hitPos
          ? hitPos
          : (draggedIdx === idx && dragPos ? dragPos : getCompartmentPos(idx, boxWidth, compartmentWidth, yBase, SCENE_SCALE, zBase))
        return (
          <Interactive
            key={idx + '-sphere'}
            onSelectStart={() => handleARSelectStart(idx)}
            onSelectEnd={handleARSelectEnd}
          >
            <mesh
              ref={el => meshRefs.current[idx] = el}
              position={pos}
              scale={1 * SCENE_SCALE}
              onPointerDown={e => handlePointerDown(idx, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              castShadow
            >
              <sphereGeometry args={[0.11 * SCENE_SCALE, 32, 32]} />
              <meshStandardMaterial color={isDragged ? '#FFC107' : '#2196f3'} />
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
          </Interactive>
        )
      })}
      {/* 3D Undo, Reset, and Suggestion Buttons */}
      <group position={[0, yBase - 0.5 * SCENE_SCALE, zBase]}>
        {/* Undo Button */}
        <mesh
          position={[-1.0 * SCENE_SCALE, 0, 0]}
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
          position={[0, 0, 0]}
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
        {/* Suggestion Button */}
        <mesh
          position={[1.0 * SCENE_SCALE, 0, 0]}
          onClick={async () => {
            if (loadingSuggestion) return
            setLoadingSuggestion(true)
            setFeedback('Loading suggestion...')
            const suggestion = await getGeminiSuggestion(array)
            setFeedback(suggestion)
            setLoadingSuggestion(false)
          }}
        >
          <boxGeometry args={[0.9 * SCENE_SCALE, 0.18 * SCENE_SCALE, 0.08 * SCENE_SCALE]} />
          <meshStandardMaterial color={loadingSuggestion ? '#888' : '#4caf50'} />
          <Text
            position={[0, 0, 0.06 * SCENE_SCALE]}
            fontSize={0.11 * SCENE_SCALE}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            {loadingSuggestion ? 'Loading...' : 'AI Suggestion'}
          </Text>
        </mesh>
      </group>
    </>
  )
}

export default App