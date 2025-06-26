import { useEffect, useState } from 'react'
import { listExercises } from '../api/db'

export function ExerciseModal({ onClose, onLoad }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listExercises()
      .then(data => setExercises(data))
      .catch(err => console.error('Error loading exercises:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 1001,
      minWidth: '300px'
    }}>
      <h2 style={{ marginTop: 0 }}>Load Exercise</h2>
      
      {loading ? (
        <p>Loading exercises...</p>
      ) : exercises.length === 0 ? (
        <p>No saved exercises found</p>
      ) : (
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {exercises.map(exercise => (
            <li 
              key={exercise._id}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                ':hover': {
                  background: '#f5f5f5'
                }
              }}
              onClick={() => onLoad(exercise._id)}
            >
              {exercise.name || 'Unnamed Exercise'}
              <span style={{ color: '#666', fontSize: '0.8em', marginLeft: '10px' }}>
                {new Date(exercise.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={{
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}