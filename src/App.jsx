import { Canvas } from '@react-three/fiber'
import { Environment, Grid } from '@react-three/drei'
import { useState, useCallback } from 'react'
import { XR, createXRStore, useXR } from '@react-three/xr'
import './App.css'
import { LinkedListNode } from './components/LinkedListNode'
import { NodeConnection } from './components/NodeConnection'
import { ARToolbar } from './components/ARToolbar'
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
  selectedNode
}) {
  const { isPresenting } = useXR()

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      <ARToolbar
        onAddNode={onAddNode}
        onReset={onReset}
        onExit={() => store.exitAR()}
        position={[0, 1.5, -0.5]}
        isPresenting={isPresenting}
      />
      
      {nodes.map(node => (
        <LinkedListNode
          key={node.id}
          position={[node.position.x, node.position.y, node.position.z]}
          data={node.data}
          isSelected={selectedNode === node.id}
          onSelect={() => onNodeSelect(node.id)}
          onDragEnd={(pos) => onNodeDragEnd(node.id, pos)}
          isPresenting={isPresenting}
        />
      ))}

      {/* Generate connections based on linked list structure */}
      {nodes.reduce((conns, node) => {
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

      {/* Scene Elements */}
      <Grid
        infiniteGrid
        fadeStrength={1}
        fadeDistance={50}
        cellSize={0.5}
        sectionSize={2}
        position={[0, -0.001, 0]}
      />
      
      {/* Ground plane for web mode */}
      {!isPresenting && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.002, 0]}
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial
            color="#f0f0f0"
            opacity={0.6}
            transparent
          />
        </mesh>
      )}

      {/* Debug sphere to check scene rendering */}
      <mesh position={[0, 0.5, -2]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      <Environment preset="sunset" />
    </>
  )
}

export function App() {
  const [nodes, setNodes] = useState([])
  const [head, setHead] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeCounter, setNodeCounter] = useState(1)

  console.log('Rendering App')

  const handleAddNode = useCallback(() => {
    const newNode = {
      id: `node-${nodeCounter}`,
      data: nodeCounter,
      next: null,
      position: { x: Math.random() * 4 - 2, y: 0.5, z: Math.random() * 4 - 2 }
    }
    
    setNodes(prev => [...prev, newNode])
    if (!head) {
      setHead(newNode.id)
    }
    setNodeCounter(prev => prev + 1)
  }, [nodeCounter, head])

  const handleNodeSelect = (nodeId) => {
    // When a node is selected, we're either starting a connection or completing one
    if (selectedNode === nodeId) {
      setSelectedNode(null)
    } else if (selectedNode) {
      // Connect nodes in the linked list
      setNodes(prev => prev.map(node =>
        node.id === selectedNode ? { ...node, next: nodeId } : node
      ))
      setSelectedNode(null)
    } else {
      setSelectedNode(nodeId)
    }
  }

  const handleNodeDragEnd = (nodeId, newPosition) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId
        ? { ...node, position: newPosition }
        : node
    ))
  }

  // Generate connections based on linked list structure
  const connections = nodes.reduce((conns, node) => {
    if (node.next) {
      conns.push({
        id: `${node.id}-${node.next}`,
        source: node.id,
        target: node.next
      })
    }
    return conns
  }, [])

  const handleReset = () => {
    setNodes([])
    setHead(null)
    setSelectedNode(null)
    setNodeCounter(1)
  }

  return <>
    <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
      <button
        onClick={() => store.enterAR()}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Enter AR
      </button>
      <button
        onClick={handleAddNode}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginLeft: '10px'
        }}
      >
        Add Node
      </button>
    </div>
    <Canvas 
      shadows 
      style={{ height: '100vh' }}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1.6, 3], fov: 75 }}
    >
      <XR store={store}>
        <Scene
          nodes={nodes}
          onAddNode={handleAddNode}
          onReset={handleReset}
          onNodeSelect={handleNodeSelect}
          onNodeDragEnd={handleNodeDragEnd}
          selectedNode={selectedNode}
        />
      </XR>
    </Canvas>
  </>
}
export default App