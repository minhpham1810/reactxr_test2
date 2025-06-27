import { useState } from 'react'
import { saveExercise } from '../api/db'
import { ExerciseModal } from './ExerciseModal'
import { ModalBackdrop } from './ModalBackdrop'

const buttonStyle = {
  padding: '6px 12px',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '14px',
  margin: '4px 0'
}

export function Toolbar({ 
  onAddNode, 
  onReset, 
  onLoad, 
  currentState, 
  onStartInsert, 
  exerciseMode, 
  isComplete,
  onEnterAR
}) {
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
        gap: '4px',
        background: 'white',
        padding: '12px',
        borderRadius: '4px',
        zIndex: 1000,
      }}>
        <div style={{
          marginBottom: '10px',
          padding: '8px',
          background: exerciseMode ? '#e3f2fd' : '#f5f5f5',
          borderRadius: '4px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
            {exerciseMode ? `Exercise: ${exerciseMode.toUpperCase()}` : 'Linked List Authoring Tool'}
          </div>
          {exerciseMode === 'insert' && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Insert node with value 5 at position 2
              {isComplete && (
                <div style={{ color: '#4CAF50', fontWeight: 'bold', marginTop: '4px' }}>
                  ✅ Exercise Complete!
                </div>
              )}
            </div>
          )}
        </div>

        {!exerciseMode ? (
          <>
            <button
              onClick={onEnterAR}
              style={{ ...buttonStyle, background: '#E91E63' }}
            >
              🥽 Enter AR
            </button>
            
            <button
              onClick={onStartInsert}
              style={{ ...buttonStyle, background: '#4CAF50' }}
            >
              🎯 Start Insert Exercise
            </button>
            
            <button
              onClick={onAddNode}
              style={{ ...buttonStyle, background: '#2196F3' }}
            >
              ➕ Add Node
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEnterAR}
              style={{ ...buttonStyle, background: '#E91E63' }}
            >
              🥽 Continue in AR
            </button>
            
            <button
              onClick={onAddNode}
              style={{ ...buttonStyle, background: '#FF9800' }}
            >
              ➕ Add Target Node
            </button>
          </>
        )}
        
        <button
          onClick={handleSave}
          style={{ ...buttonStyle, background: '#9C27B0' }}
        >
          💾 Save Exercise
        </button>

        <button
          onClick={() => setShowLoadModal(true)}
          style={{ ...buttonStyle, background: '#607D8B' }}
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