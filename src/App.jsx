import { Canvas } from '@react-three/fiber'
import { Environment, Grid } from '@react-three/drei'
import { useState, useCallback } from 'react'
import { XR, createXRStore } from '@react-three/xr'
import './App.css'
import { LinkedListNode } from './components/LinkedListNode'
import { NodeConnection } from './components/NodeConnection'
import { ARToolbar } from './components/ARToolbar'
import { loadExercise } from './api/db'

const store = createXRStore({
  frameRate: 90,
  foveation: 1
})

export function App() {
  const [nodes, setNodes] = useState([])
  const [head, setHead] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeCounter, setNodeCounter] = useState(1)

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
    setConnections([])
    setSelectedNode(null)
    setNodeCounter(1)
  }

  return <>
    <button id="arbutton" onClick={() => store.enterAR()}>Enter AR</button>
    <Canvas 
      shadows 
      style={{ height: '100vh' }}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 1.6, 3], fov: 75 }}
    >
      <XR store={store}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        <ARToolbar
          onAddNode={handleAddNode}
          onReset={handleReset}
          onExit={() => store.exitAR()}
          position={[0, 1.5, -0.5]}
        />
        
        {nodes.map(node => (
          <LinkedListNode
            key={node.id}
            position={[node.position.x, node.position.y, node.position.z]}
            data={node.data}
            isSelected={selectedNode === node.id}
            onSelect={() => handleNodeSelect(node.id)}
            onDragEnd={(pos) => handleNodeDragEnd(node.id, pos)}
          />
        ))}

        {connections.map(conn => {
          const sourceNode = nodes.find(n => n.id === conn.source)
          const targetNode = nodes.find(n => n.id === conn.target)
          if (!sourceNode || !targetNode) return null

          return (
            <NodeConnection
              key={conn.id}
              startPos={sourceNode.position}
              endPos={targetNode.position}
            />
          )
        })}

        <Grid
          infiniteGrid
          fadeStrength={1}
          fadeDistance={50}
          cellSize={0.5}
          sectionSize={2}
          position={[0, -0.001, 0]}
        />
        <Environment preset="city" />
      </XR>
    </Canvas>
  </>
}
export default App