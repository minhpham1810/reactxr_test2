import { useState } from 'react'
import { saveExercise } from '../api/db'
import { ExerciseModal } from './ExerciseModal'
import { ModalBackdrop } from './ModalBackdrop'

const buttonStyle = {
  padding: '8px 16px',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

export function Toolbar({ onAddNode, onConnectNodes, onReset, onLoad, currentState }) {
  const [showLoadModal, setShowLoadModal] = useState(false)

  const handleSave = async () => {
    try {
      const exerciseName = prompt('Enter a name for this exercise:')
      if (!exerciseName) return

      await saveExercise({
        name: exerciseName,
        state: currentState,
        createdAt: new Date().toISOString()
      })
      alert('Exercise saved successfully!')
    } catch (error) {
      console.error('Error saving exercise:', error)
      alert('Failed to save exercise')
    }
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}>
        <button
          onClick={onAddNode}
          style={{ ...buttonStyle, background: '#2196F3' }}
        >
          ➕ Add Node
        </button>
        
        <button
          onClick={onConnectNodes}
          style={{ ...buttonStyle, background: '#4CAF50' }}
        >
          🔗 Connect Nodes
        </button>

        <button
          onClick={handleSave}
          style={{ ...buttonStyle, background: '#FF9800' }}
        >
          💾 Save Exercise
        </button>

        <button
          onClick={() => setShowLoadModal(true)}
          style={{ ...buttonStyle, background: '#9C27B0' }}
        >
          📂 Load Exercise
        </button>

        <button
          onClick={onReset}
          style={{ ...buttonStyle, background: '#f44336' }}
        >
          🔄 Reset
        </button>
      </div>

      {showLoadModal && (
        <>
          <ModalBackdrop onClose={() => setShowLoadModal(false)} />
          <ExerciseModal
            onClose={() => setShowLoadModal(false)}
            onLoad={(exerciseId) => {
              onLoad(exerciseId)
              setShowLoadModal(false)
            }}
          />
        </>
      )}
    </>
  )
}