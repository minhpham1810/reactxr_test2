import { Canvas } from '@react-three/fiber'
import { Environment, Grid, OrbitControls, Text } from '@react-three/drei'
import { useState, useCallback } from 'react'
import { XR, createXRStore, useXR } from '@react-three/xr'
import './App.css'
import { LinkedListNode } from './components/LinkedListNode'
import { NodeConnection } from './components/NodeConnection'
import { ARToolbar } from './components/ARToolbar'
import { Toolbar } from './components/Toolbar'
import { loadExercise } from './api/db'

const store = createXRStore({
  frameRate: 90,
  foveation: 1
})

// Scene component handles all XR-specific rendering
function Scene({
  nodes,
  onAddNode,
  onReset,
  onNodeSelect,
  onNodeDragEnd,
  selectedNode,
  exerciseMode,
  insertPosition,
  targetValue,
  onStartInsert,
  isComplete,
  isDraggingAnyNode,
  onDragStateChange
}) {
  const { isPresenting } = useXR()
  
  // Debug logging for AR state - handle undefined case
  const isInAR = isPresenting === true
  console.log('Scene - isPresenting:', isPresenting, 'isInAR:', isInAR)

  return (
    <>
      {/* Add OrbitControls for web mode only */}
      {!isInAR && (
        <OrbitControls
          enabled={!isDraggingAnyNode}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
          target={[0, 0.5, 0]}
        />
      )}
      
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      <ARToolbar
        onAddNode={onAddNode}
        onReset={onReset}
        onExit={() => store.exitAR()}
        position={[0, 1.0, -0.8]}
        isPresenting={isInAR}
        onStartInsert={onStartInsert}
        exerciseMode={exerciseMode}
        isComplete={isComplete}
      />
      
      {/* Exercise Instructions */}
      {isInAR && exerciseMode && (
        <Text
          position={[0, 2, -1.5]}
          fontSize={0.08}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
        >
          {exerciseMode === 'insert' 
            ? `Insert node with value ${targetValue} at position ${insertPosition}`
            : 'Select exercise mode to begin'
          }
        </Text>
      )}
      
      {/* Exercise completion message for AR */}
      {isInAR && isComplete && (
        <Text
          position={[0, 1.8, -1]}
          fontSize={0.08}
          color="#4CAF50"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
        >
          Exercise Complete!
        </Text>
      )}

      {/* Web mode instructions */}
      {!isInAR && exerciseMode && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.12}
          color="#333333"
          anchorX="center"
          anchorY="middle"
          maxWidth={6}
        >
          {exerciseMode === 'insert' 
            ? `Exercise: Insert node with value ${targetValue} at position ${insertPosition}`
            : 'Welcome to Linked List Learning Tool'
          }
        </Text>
      )}        {nodes.map((node, globalIndex) => {
          // Calculate the correct index for non-staging nodes
          const listNodes = nodes.filter(n => !n.isStaging)
          const nodeIndex = node.isStaging ? undefined : listNodes.findIndex(n => n.id === node.id)
          
          return (
            <LinkedListNode
              key={node.id}
              position={[node.position.x, node.position.y, node.position.z]}
              data={node.data}
              isSelected={selectedNode === node.id}
              onSelect={() => onNodeSelect(node.id)}
              onDragEnd={(pos) => onNodeDragEnd(node.id, pos)}
              onDragStateChange={(isDragging) => onDragStateChange(node.id, isDragging)}
              isPresenting={isInAR}
              nodeIndex={nodeIndex}
              showIndex={exerciseMode === 'insert'}
              isStaging={node.isStaging}
            />
          )
        })}        {/* Generate connections based on linked list structure */}
        {nodes.filter(n => !n.isStaging).reduce((conns, node) => {
          if (node.next) {
            const targetNode = nodes.find(n => n.id === node.next)
            if (targetNode) {
              conns.push(
                <NodeConnection
                  key={`${node.id}-${node.next}`}
                  startPos={node.position}
                  endPos={targetNode.position}
                />
              )
            }
          }
          return conns
        }, [])}

        {/* Insertion guide zones for exercise mode */}
        {exerciseMode === 'insert' && (
          <>
            {/* Drop zone at the beginning */}
            <mesh key="guide-start" position={[-1.2, 0.05, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
              <meshStandardMaterial 
                color={insertPosition === 0 ? "#4CAF50" : "#FFC107"} 
                transparent 
                opacity={0.4}
                emissive={insertPosition === 0 ? "#4CAF50" : "#FFC107"}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Drop zones between nodes */}
            {nodes.filter(n => !n.isStaging).map((node, index) => {
              const nextNode = nodes.filter(n => !n.isStaging)[index + 1]
              if (nextNode) {
                const midX = (node.position.x + nextNode.position.x) / 2
                const isTargetPosition = insertPosition === index + 1
                
                return (
                  <mesh key={`guide-${index + 1}`} position={[midX, 0.1, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
                    <meshStandardMaterial 
                      color={isTargetPosition ? "#4CAF50" : "#FFC107"} 
                      transparent 
                      opacity={0.4}
                      emissive={isTargetPosition ? "#4CAF50" : "#FFC107"}
                      emissiveIntensity={0.3}
                    />
                  </mesh>
                )
              }
              return null
            })}
            
            {/* Drop zone at the end */}
            {nodes.filter(n => !n.isStaging).length > 0 && (
              <mesh key="guide-end" position={[
                nodes.filter(n => !n.isStaging)[nodes.filter(n => !n.isStaging).length - 1].position.x + 2, 
                0.1, 
                0
              ]}>
                <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
                <meshStandardMaterial 
                  color={insertPosition >= nodes.filter(n => !n.isStaging).length ? "#4CAF50" : "#FFC107"} 
                  transparent 
                  opacity={0.4}
                  emissive={insertPosition >= nodes.filter(n => !n.isStaging).length ? "#4CAF50" : "#FFC107"}
                  emissiveIntensity={0.3}
                />
              </mesh>
            )}
          </>
        )}

      {/* Scene Elements */}
      <Grid
        position={[0, -0.001, 0]}
        args={[10, 10]}
        cellSize={0.2}
        sectionSize={1}
        fadeDistance={15}
      />
      
      {/* Ground plane - invisible but still receives shadows */}
      {!isInAR && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.002, 0]}
          //receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial
            color="#f0f0f0"
            opacity={0}
            transparent
            visible={false}
          />
        </mesh>
      )}

      <Environment preset="park" />
    </>
  )
}

export function App() {
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeCounter, setNodeCounter] = useState(1)
  const [isDraggingAnyNode, setIsDraggingAnyNode] = useState(false)
  
  // Exercise state
  const [exerciseMode, setExerciseMode] = useState(null) // 'insert', 'delete', 'search'
  const [targetValue, setTargetValue] = useState(5)
  const [insertPosition, setInsertPosition] = useState(2)
  const [draggedNode, setDraggedNode] = useState(null)
  const [isComplete, setIsComplete] = useState(false)

  // Initialize with a basic linked list for demonstration
  const initializeBasicList = useCallback(() => {
    const basicNodes = [
      { id: 'node-1', data: 1, next: 'node-2', position: { x: -0.8, y: 0.2, z: 0 }},
      { id: 'node-2', data: 3, next: 'node-3', position: { x: 0, y: 0.2, z: 0 }},
      { id: 'node-3', data: 7, next: null, position: { x: 0.8, y: 0.2, z: 0 }}
    ]
    setNodes(basicNodes)
    setNodeCounter(4)
  }, [])

  // Create a new node in the "staging area"
  const handleAddNode = useCallback((value = null) => {
    const nodeValue = value !== null ? value : targetValue
    const newNode = {
      id: `node-${nodeCounter}`,
      data: nodeValue,
      next: null,
      position: { x: 0, y: 0.4, z: -0.6 }, // Staging area above the list
      isStaging: true
    }
    setNodes(prev => [...prev, newNode])
    setNodeCounter(prev => prev + 1)
    return newNode.id
  }, [nodeCounter, targetValue])

  // Start insert exercise
  const startInsertExercise = () => {
    setExerciseMode('insert')
    setIsComplete(false)
    initializeBasicList()
  }

  const handleNodeSelect = (nodeId) => {
    if (selectedNode === nodeId) {
      setSelectedNode(null)
    } else if (selectedNode && exerciseMode !== 'insert') {
      // Regular connection mode (not during insert exercise)
      setNodes(prev => prev.map(node =>
        node.id === selectedNode ? { ...node, next: nodeId } : node
      ))
      setSelectedNode(null)
    } else {
      setSelectedNode(nodeId)
    }
  }

  const handleNodeDragEnd = (nodeId, newPosition) => {
    setNodes(prev => {
      const updatedNodes = prev.map(node => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, position: newPosition }
          
          // If this was a staging node and it's been moved into the main area
          if (node.isStaging && newPosition.y < 1.0) {
            delete updatedNode.isStaging
          }
          
          return updatedNode
        }
        return node
      })
      
      // Check completion after state update with current nodes
      if (exerciseMode === 'insert') {
        const draggedNode = prev.find(n => n.id === nodeId)
        if (draggedNode && draggedNode.isStaging && newPosition.y < 1.0) {
          setTimeout(() => checkInsertCompletion(nodeId, newPosition, updatedNodes), 100)
        }
      }
      
      return updatedNodes
    })
  }

  // Check if the insert operation is completed correctly
  const checkInsertCompletion = (nodeId, position, currentNodes) => {
    // Get the list nodes (excluding staging nodes and the dragged node)
    const listNodes = currentNodes.filter(n => !n.isStaging && n.id !== nodeId)
    
    // Sort by x position to determine the intended insertion point
    listNodes.sort((a, b) => a.position.x - b.position.x)
    
    console.log('Checking completion:', { nodeId, position, listNodes, insertPosition })
    
    // Check if the node was inserted at the correct position
    const targetIndex = insertPosition
    if (targetIndex <= listNodes.length) {
      let expectedX
      
      if (targetIndex === 0) {
        // Insert at beginning
        expectedX = listNodes.length > 0 ? listNodes[0].position.x - 2 : -2
      } else if (targetIndex >= listNodes.length) {
        // Insert at end
        expectedX = listNodes.length > 0 ? listNodes[listNodes.length - 1].position.x + 2 : 2
      } else {
        // Insert in middle
        expectedX = (listNodes[targetIndex - 1].position.x + listNodes[targetIndex].position.x) / 2
      }
      
      console.log('Expected X:', expectedX, 'Actual X:', position.x, 'Difference:', Math.abs(position.x - expectedX))
      
      if (Math.abs(position.x - expectedX) < 1.5) {
        setIsComplete(true)
        // Always show console log, but different user feedback for AR vs Web
        console.log('Exercise completed successfully!')
        
        // For web mode, show alert (AR will show 3D message via isComplete state)
        setTimeout(() => {
          alert('Excellent! You successfully inserted the node at the correct position!')
        }, 500)
      }
    }
  }

  const handleReset = () => {
    setNodes([])
    setSelectedNode(null)
    setNodeCounter(1)
    setExerciseMode(null)
    setIsComplete(false)
    setIsDraggingAnyNode(false) // Reset drag state
  }

  // Handle drag state changes from individual nodes
  const handleDragStateChange = useCallback((nodeId, isDragging) => {
    setIsDraggingAnyNode(isDragging)
  }, [])

  const handleLoad = (exerciseId) => {
    // Load exercise from database
    console.log('Loading exercise:', exerciseId)
  }

  const getCurrentState = () => ({
    nodes,
    selectedNode,
    nodeCounter,
    exerciseMode,
    targetValue,
    insertPosition
  })

  return <>
    {/* Web-only toolbar */}
    {!store.isPresenting && (
      <Toolbar
        onAddNode={() => handleAddNode()}
        onReset={handleReset}
        onLoad={handleLoad}
        currentState={getCurrentState()}
        onStartInsert={startInsertExercise}
        exerciseMode={exerciseMode}
        isComplete={isComplete}
        onEnterAR={() => {
          console.log('Entering AR mode...')
          store.enterAR()
        }}
      />
    )}
    
    <Canvas
      shadows
      className="scene-canvas"
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1, 2], fov: 60 }}
    >
      <XR store={store}>
        <Scene
          nodes={nodes}
          onAddNode={handleAddNode}
          onReset={handleReset}
          onNodeSelect={handleNodeSelect}
          onNodeDragEnd={handleNodeDragEnd}
          selectedNode={selectedNode}
          exerciseMode={exerciseMode}
          insertPosition={insertPosition}
          targetValue={targetValue}
          onStartInsert={startInsertExercise}
          isComplete={isComplete}
          isDraggingAnyNode={isDraggingAnyNode}
          onDragStateChange={handleDragStateChange}
        />
      </XR>
    </Canvas>
  </>
}
export default App