import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Text, Html } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
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

  // Sidebar resizing state
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const [infoPanelWidth, setInfoPanelWidth] = useState(320)
  const resizingSidebar = useRef(false)
  const resizingInfoPanel = useRef(false)

  // Mouse event handlers for resizing
  useEffect(() => {
    function handleMouseMove(e) {
      if (resizingSidebar.current) {
        setSidebarWidth(Math.max(140, Math.min(e.clientX, 400)))
      } else if (resizingInfoPanel.current) {
        const vw = window.innerWidth
        setInfoPanelWidth(Math.max(180, Math.min(vw - e.clientX, 500)))
      }
    }
    function handleMouseUp() {
      resizingSidebar.current = false
      resizingInfoPanel.current = false
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

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
    <div
      className="main-layout"
      style={{
        display: 'grid',
        gridTemplateColumns: `${sidebarWidth}px 6px calc(100vw - ${sidebarWidth + infoPanelWidth + 12}px) 6px ${infoPanelWidth}px`,
        height: '100vh',
        width: '100vw',
        background: '#16181d',
      }}
    >
      <aside className="sidebar" style={{ width: sidebarWidth }}>
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
      {/* Sidebar divider */}
      <div
        style={{ cursor: 'col-resize', width: 6, background: '#23283a', zIndex: 10 }}
        onMouseDown={() => (resizingSidebar.current = true)}
      />
      <div className="scene-container">
        {/* Enter AR button (HTML) */}
        {!isPresenting && (
          <button className="enter-ar-btn" onClick={handleEnterAR}>
            Enter AR
          </button>
        )}
        <Canvas
          shadows
          className="scene-canvas"
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 1.4, 1.2], fov: 60 }}
          style={{}}
        >
          <XR store={store}>
            <XRStatus />
            {/* Move scene to simulate eye-to-laptop distance */}
            <group scale={[0.25, 0.25, 0.25]} position={[0, 0.7, 0]}>
              {/* Exit AR 3D button, only in AR */}
              {isPresenting && (
                <group position={[0, 1.6, -1]} scale={[0.7, 0.7, 0.7]}>
                  {/* 3D Exit AR Button */}
                  <group position={[0, 0.5, 0]}>
                    <mesh onClick={handleExitAR}>
                      <boxGeometry args={[0.7, 0.18, 0.08]} />
                      <meshStandardMaterial color={'#e53935'} />
                      <Text
                        position={[0, 0, 0.06]}
                        fontSize={0.11}
                        color="#fff"
                        anchorX="center"
                        anchorY="middle"
                      >
                        Exit AR
                      </Text>
                    </mesh>
                  </group>
                </group>
              )}
              {/* Authoring Panel 3D, only in AR */}
              {isPresenting && (
                <group position={[0, 1.2, -1]} scale={[0.4, 0.4, 0.4]}>
                  <AuthoringPanel3D
                    authoringMode={authoringMode}
                    setAuthoringMode={setAuthoringMode}
                    lesson={lesson}
                    setLesson={setLesson}
                    selectedExercise={selectedExercise}
                    setSelectedExercise={setSelectedExercise}
                  />
                </group>
              )}
              {/* 3D Mode Toggle Button */}
              <RenderModeToggle SCENE_SCALE={0.7} mode={mode} setMode={setMode} />
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
      {/* Info panel divider */}
      <div
        style={{ cursor: 'col-resize', width: 6, background: '#181a20', zIndex: 10 }}
        onMouseDown={() => (resizingInfoPanel.current = true)}
      />
      <section className="info-panel" style={{ width: infoPanelWidth }}>
        <h2>Info Panel</h2>
        <p>Details, explanations, or controls here</p>
      </section>
    </div>
  )
}

export default App