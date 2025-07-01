import React from 'react'
import { Text } from '@react-three/drei'

function RenderModeToggle({ SCENE_SCALE, mode, setMode }) {
  return (
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
          color={mode === 'demo' ? '#fff' : '#000'}
          anchorX="center"
          anchorY="middle"
        >
          {mode === 'demo' ? 'Switch to Exercise' : 'Switch to Demo'}
        </Text>
      </mesh>
    </group>
  )
}

export default RenderModeToggle 