import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Text, Html } from '@react-three/drei'
import { useState, useEffect } from 'react'
import { XR, createXRStore, useXR } from '@react-three/xr'
import './App.css'
import DemoSortVisualizer from './components/DemoSortVisualizer'
import { randomArray } from './components/helpers'
import AuthoringPanel3D from './components/AuthoringPanel3D'
import ExerciseSortVisualizer from './components/ExerciseSortVisualizer'
import RenderModeToggle from './components/renderModeToggle'
import AuthoringPanelHTML from './components/AuthoringPanelHTML';

const store = createXRStore({ frameRate: 90, foveation: 1 })

export function App() {
  const [mode, setMode] = useState('demo')
  // Insertion sort state and logic
  const [array, setArray] = useState(randomArray())
  const [step, setStep] = useState(1)
  const [i, setI] = useState(1)
  const [j, setJ] = useState(1)
  const [isSorting, setIsSorting] = useState(false)
  const [done, setDone] = useState(false)
  const [isPresenting, setIsPresenting] = useState(false)
  const [exerciseArray, setExerciseArray] = useState(randomArray())
  const [moveHistory, setMoveHistory] = useState([])
  const [exerciseFeedback, setExerciseFeedback] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  // Authoring state
  const [authoringMode, setAuthoringMode] = useState(false)
  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    exercises: []
  })
  const [selectedExercise, setSelectedExercise] = useState(null)

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

  // Load selected exercise into exercise mode
  useEffect(() => {
    if (mode === 'exercise' && lesson.exercises && selectedExercise !== null && lesson.exercises[selectedExercise]) {
      setExerciseArray([...lesson.exercises[selectedExercise].array])
      setExerciseFeedback(lesson.exercises[selectedExercise].instructions || '')
      setMoveHistory([])
    }
  }, [mode, lesson, selectedExercise])

  return (
    <div className="main-layout">
      <aside className="sidebar">
        {!isPresenting && (
          <AuthoringPanelHTML
            authoringMode={authoringMode}
            setAuthoringMode={setAuthoringMode}
            lesson={lesson}
            setLesson={setLesson}
            selectedExercise={selectedExercise}
            setSelectedExercise={setSelectedExercise}
          />
        )}
      </aside>
      <div className="scene-container">
        <Canvas
          shadows
          className="scene-canvas"
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 1, 1.2], fov: 60 }}
          style={{}}
        >
          <XR store={store}>
            <XRStatus />
            {/* Scale the main scene content by half and move up by one unit */}
            <group scale={[0.5, 0.5, 0.5]} position={[0, 0.5, 0]}>
              {!isPresenting && (
                <group position={[0, 0, -0.65]}>
                  <mesh
                    position={[0, 0, 0]}
                    onClick={handleEnterAR}
                  >
                    <boxGeometry args={[1.0, 0.3, 0.08]} />
                    <meshStandardMaterial color="#2196f3" />
                    <Text
                      position={[0, 0, 0.06]}
                      fontSize={0.18}
                      color="#fff"
                      anchorX="center"
                      anchorY="middle"
                    >
                      Enter AR
                    </Text>
                  </mesh>
                </group>
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
              {/* 3D Mode Toggle Button */}
              <RenderModeToggle SCENE_SCALE={0.7} mode={mode} setMode={setMode} />
              {isPresenting && (
                <AuthoringPanel3D
                  authoringMode={authoringMode}
                  setAuthoringMode={setAuthoringMode}
                  lesson={lesson}
                  setLesson={setLesson}
                  selectedExercise={selectedExercise}
                  setSelectedExercise={setSelectedExercise}
                />
              )}
              {/* Main Visualizer: Demo or Exercise Mode */}
              {mode === 'demo' ? (
                <DemoSortVisualizer
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
                  array={selectedExercise ? selectedExercise.array : exerciseArray}
                  setArray={arr => {
                    if (selectedExercise) {
                      setSelectedExercise({ ...selectedExercise, array: arr })
                    } else {
                      setExerciseArray(arr)
                    }
                  }}
                  moveHistory={moveHistory}
                  setMoveHistory={setMoveHistory}
                  feedback={exerciseFeedback}
                  setFeedback={setExerciseFeedback}
                  undo={undoExercise}
                  reset={reset}
                  setIsDragging={setIsDragging}
                />
              )}
            </group>
            <ambientLight intensity={0.7} />
            <directionalLight position={[2, 4, 2]} intensity={1.1} />
            <OrbitControls enabled={!isDragging} enablePan={false} enableZoom={true} enableRotate={true} minDistance={1.2} maxDistance={6} target={[0, 1.2, -1]} />
            <Environment preset="park" />
          </XR>
        </Canvas>
      </div>
      <section className="info-panel">
        <h2>Info Panel</h2>
        <p>Details, explanations, or controls here</p>
      </section>
    </div>
  )
}

export default App