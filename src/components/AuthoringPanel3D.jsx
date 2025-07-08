import { Text, Html } from '@react-three/drei'
import React, { useState, useEffect } from 'react'
import { getExercises, saveExercise, updateExercise, deleteExercise } from './helpers'

export function AuthoringPanel3D({
    selectedExercise, setSelectedExercise
}) {
    // Panel position
    const panelPos = [-1.5, 2.2, -1]
    const panelWidth = 2.0
    const panelHeight = 1.5
    const panelDepth = 0.05
  
    // Flat exercises state
    const [exercises, setExercises] = useState([])
    const [selectedExerciseId, setSelectedExerciseId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [exerciseScrollOffset, setExerciseScrollOffset] = useState(0)
    const VISIBLE_EXERCISES = 5
    const canScrollUp = exerciseScrollOffset > 0
    const canScrollDown = exercises.length > VISIBLE_EXERCISES && (exerciseScrollOffset + VISIBLE_EXERCISES) < exercises.length
    const [editingField, setEditingField] = useState(null); // 'name' | 'description' | null
  
    // Load exercises from backend
    useEffect(() => {
      refreshExercises()
    }, [])
    async function refreshExercises() {
      setLoading(true)
      try {
        const data = await getExercises()
        setExercises(data)
        // If selectedExerciseId is set, update selectedExercise
        if (selectedExerciseId) {
          const found = data.find(e => e._id === selectedExerciseId)
          setSelectedExercise(found ? { ...found } : null)
        }
      } catch (e) {
        setFeedback('Error loading exercises')
      }
      setLoading(false)
    }
    // Save exercise (create or update)
    async function handleSave() {
      setLoading(true)
      try {
        if (selectedExercise && selectedExercise._id) {
          const { _id, ...exerciseData } = selectedExercise
          console.log('Updating exercise with:', exerciseData)
          await updateExercise(selectedExercise._id, exerciseData)
          setFeedback('Exercise updated!')
        } else if (selectedExercise) {
          const saved = await saveExercise(selectedExercise)
          setSelectedExerciseId(saved._id)
          setSelectedExercise(saved)
          setFeedback('Exercise saved!')
        }
        refreshExercises()
      } catch (e) {
        setFeedback('Save failed')
      }
      setLoading(false)
    }
    // Load exercise
    function handleLoad(id) {
      const ex = exercises.find(e => e._id === id)
      setSelectedExercise(ex ? { ...ex } : null)
      setFeedback('Exercise loaded!')
    }
    // Delete exercise
    async function handleDelete(id) {
      if (!window.confirm('Delete this exercise?')) return
      setLoading(true)
      try {
        await deleteExercise(id)
        setFeedback('Exercise deleted!')
        setSelectedExerciseId(null)
        setSelectedExercise(null)
        refreshExercises()
      } catch (e) {
        setFeedback('Delete failed')
      }
      setLoading(false)
    }
    // Add new exercise
    function handleAddNew() {
      setSelectedExerciseId(null)
      setSelectedExercise({ name: '', description: '', array: [1,2,3,4] })
      setFeedback('New exercise')
    }
    // 3D Input Field (simulated with mesh and Text, triggers browser prompt for input)
    function Input3D({ position, value, onChange, width = 1.2, height = 0.13, label = '', fontSize = 0.02, color = '#23283a', textColor = '#fff' }) {
      return (
        <group position={position}>
          <mesh
            onClick={() => {
              const input = window.prompt(`Enter ${label}`, value)
              if (input !== null) onChange(input)
            }}
          >
            <boxGeometry args={[width, height, 0.06]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <Text
            position={[-width/2 + 0.06, 0, 0.04]}
            fontSize={fontSize}
            color={textColor}
            anchorX="left"
            anchorY="middle"
            maxWidth={width-0.12}
          >
            {value || `Click to enter ${label}`}
          </Text>
        </group>
      )
    }
  
    // Button helper
    function Button3D({ position, label, onClick, width = 0.32, height = 0.13, color = '#2196f3', textColor = '#fff', fontSize = 0.05 }) {
      return (
        <group position={position}>
          <mesh onClick={onClick}>
            <boxGeometry args={[width, height, 0.06]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <Text
            position={[0, 0, 0.04]}
            fontSize={fontSize}
            color={textColor}
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        </group>
      )
    }
  
    // Panel
    return (
      <group position={panelPos}>
        {/* Panel background */}
        <mesh>
          <boxGeometry args={[panelWidth, panelHeight, panelDepth]} />
          <meshStandardMaterial color="#23283a" opacity={0.97} transparent />
        </mesh>
        {/* Exercises List with Scroll */}
        <Text
          position={[-panelWidth/2 + 0.18, panelHeight/2 - 0.25, panelDepth/2 + 0.01]}
          fontSize={0.08}
          color="#fff"
          anchorX="left"
          anchorY="middle"
        >
          Exercises:
        </Text>
        {/* Up Arrow Button */}
        <Button3D
          position={[-panelWidth/2 + 1.90, panelHeight/2 - 0.30, panelDepth/2 + 0.01]}
          label="▲"
          onClick={() => setExerciseScrollOffset(o => Math.max(0, o - 1))}
          color={canScrollUp ? '#2196f3' : '#888'}
          width={0.13}
          fontSize={0.08}
        />
        {/* Down Arrow Button */}
        <Button3D
          position={[-panelWidth/2 + 1.90, panelHeight/2 - 0.40 - (VISIBLE_EXERCISES-1)*0.15, panelDepth/2 + 0.01]}
          label="▼"
          onClick={() => setExerciseScrollOffset(o => Math.min(exercises.length - VISIBLE_EXERCISES, o + 1))}
          color={canScrollDown ? '#2196f3' : '#888'}
          width={0.13}
          fontSize={0.08}
        />
        {/* Visible Exercises */}
        {exercises.slice(exerciseScrollOffset, exerciseScrollOffset + VISIBLE_EXERCISES).map((ex, idx) => {
          const realIdx = exerciseScrollOffset + idx
          const isSelected = selectedExercise && ex._id === selectedExercise._id
          return (
            <group key={ex._id} position={[-panelWidth/2 + 0.4, panelHeight/2 - 0.40 - idx*0.15, panelDepth/2 + 0.01]}>
              <mesh>
                <boxGeometry args={[0.75, 0.13, 0.01]} />
                <meshStandardMaterial color={isSelected ? '#FFC107' : '#23283a'} opacity={isSelected ? 0.8 : 0.5} transparent />
              </mesh>
              <Text fontSize={0.07} color={isSelected ? '#23283a' : '#fff'} anchorX="left" anchorY="middle" position={[-0.35, 0, 0.02]}>{`#${realIdx+1} ${ex.name ? ' - ' + ex.name : ''}`}</Text>
              <Button3D
                position={[1.1, 0, 0]}
                label="Edit"
                onClick={() => handleLoad(ex._id)}
                color="#2196f3"
                width={0.18}
                fontSize={0.04}
              />
              <Button3D
                position={[1.30, 0, 0]}
                label="Delete"
                onClick={() => handleDelete(ex._id)}
                color="#e53935"
                width={0.20}
                fontSize={0.05}
              />
            </group>
          )
        })}
        {/* Add New Exercise Button */}
        <Button3D
          position={[-panelWidth/2 + 0.7, panelHeight/2 - 0.40 - Math.min(exercises.length, VISIBLE_EXERCISES)*0.15 - 0.08, panelDepth/2 + 0.01]}
          label="Add New Exercise"
          onClick={handleAddNew}
          color="#FFC107"
          width={0.44}
          fontSize={0.04}
          textColor="#23283a"
        />
        {/* Exercise Editor in its own panel */}
        {selectedExercise && (
          <group position={[panelWidth/2 + 1.0, panelHeight/2 - 0.60, panelDepth/2 + 0.01]}>
            {/* Editor Panel Background - wider */}
            <mesh position={[0.8, -0.25, -0.03]}>
              <boxGeometry args={[1.8, 1.25, 0.06]} />
              <meshStandardMaterial color="#23283a" opacity={0.98} transparent />
            </mesh>
            {/* Exercise Name Input (3D Text or Input) */}
            <group position={[0.4, 0.3, 0]}>
              <mesh>
                <boxGeometry args={[1.0, 0.13, 0.06]} />
                <meshStandardMaterial color="#23283a" />
              </mesh>
              {editingField === 'name' ? (
                <Html center>
                  <input
                    type="text"
                    value={selectedExercise.name || ''}
                    onChange={e => setSelectedExercise({ ...selectedExercise, name: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
                    autoFocus
                    style={{
                      width: '220px',
                      height: '36px',
                      fontSize: '22px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: '#fff',
                      outline: 'none',
                      textAlign: 'left',
                      boxShadow: 'none',
                    }}
                  />
                </Html>
              ) : (
                <Text
                  position={[-0.44, 0, 0.04]}
                  fontSize={0.08}
                  color="#fff"
                  anchorX="left"
                  anchorY="middle"
                  maxWidth={0.9}
                  onClick={() => setEditingField('name')}
                  style={{ cursor: 'pointer' }}
                >
                  {selectedExercise.name || 'Exercise Name'}
                </Text>
              )}
            </group>

            {/* Description Input (3D Text or Input) */}
            <group position={[0.4, 0.15, 0]}>
              <mesh>
                <boxGeometry args={[1.0, 0.13, 0.06]} />
                <meshStandardMaterial color="#23283a" />
              </mesh>
              {editingField === 'description' ? (
                <Html center>
                  <input
                    type="text"
                    value={selectedExercise.description || ''}
                    onChange={e => setSelectedExercise({ ...selectedExercise, description: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
                    autoFocus
                    style={{
                      width: '220px',
                      height: '36px',
                      fontSize: '22px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: '#fff',
                      outline: 'none',
                      textAlign: 'left',
                      boxShadow: 'none',
                    }}
                  />
                </Html>
              ) : (
                <Text
                  position={[-0.44, 0, 0.04]}
                  fontSize={0.08}
                  color="#fff"
                  anchorX="left"
                  anchorY="middle"
                  maxWidth={0.9}
                  onClick={() => setEditingField('description')}
                  style={{ cursor: 'pointer' }}
                >
                  {selectedExercise.description || 'Description'}
                </Text>
              )}
            </group>
            {/* Array Length */}
            <group position={[0, 0, 0.03]}>
              <Text fontSize={0.055} color="#fff" anchorX="left" anchorY="middle" position={[0, 0, 0]}>
                {`Array Length: ${selectedExercise.array.length}`}
              </Text>
              <Button3D
                position={[0.75, 0, 0]}
                label="+"
                onClick={() => {
                  if (selectedExercise.array.length < 15) {
                    setSelectedExercise({ ...selectedExercise, array: [...selectedExercise.array, 1] })
                  }
                }}
                color="#4caf50"
                width={0.12}
                fontSize={0.045}
              />
              <Button3D
                position={[0.9, 0, 0]}
                label="-"
                onClick={() => {
                  if (selectedExercise.array.length > 2) {
                    setSelectedExercise({ ...selectedExercise, array: selectedExercise.array.slice(0, selectedExercise.array.length - 1) })
                  }
                }}
                color="#e53935"
                width={0.12}
                fontSize={0.055}
              />
            </group>
            <group position={[0, -0.15, 0.03]}>
              <Text fontSize={0.055} color="#fff" anchorX="left" anchorY="middle" position={[0, 0, 0]}>
                Array Values:
              </Text>
              {selectedExercise.array.map((val, arrIdx) => {
                const valueWidth = 0.15;
                const gap = 0.025; // reduced spacing
                const sideMargin = 0.15;
                const valuesPerRow = 7;
                const row = Math.floor(arrIdx / valuesPerRow);
                const col = arrIdx % valuesPerRow;
                const x = -panelWidth/2 + sideMargin + col * (valueWidth + gap) + valueWidth/2 +1.25;
                const y = 0.06 - row * 0.16-0.1; // increased vertical spacing
                return (
                  <group key={arrIdx} position={[x, y, 0]}>
                    <mesh>
                      <boxGeometry args={[valueWidth, 0.15, 0.06]} />
                      <meshStandardMaterial color="#A9A9A9" />
                    </mesh>
                    {editingField === `array-${arrIdx}` ? (
                      <Html center>
                        <input
                          type="number"
                          value={val}
                          onChange={e => {
                            const num = Number(e.target.value)
                            if (!isNaN(num)) {
                              const newArr = selectedExercise.array.map((v, i) => i === arrIdx ? num : v)
                              setSelectedExercise({ ...selectedExercise, array: newArr })
                            }
                          }}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={e => { if (e.key === 'Enter') setEditingField(null); }}
                          autoFocus
                          style={{
                            width: '40px',
                            height: '30px',
                            fontSize: '18px',
                            textAlign: 'center',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: '#000',
                            outline: 'none',
                            boxShadow: 'none',
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                      </Html>
                    ) : (
                      <Text
                        position={[-valueWidth/2 + 0.02, 0, 0.04]}
                        fontSize={0.045}
                        color="#000"
                        anchorX="left"
                        anchorY="middle"
                        maxWidth={valueWidth-0.04}
                        onClick={() => setEditingField(`array-${arrIdx}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {val}
                      </Text>
                    )}
                  </group>
                );
              })}
            </group>
            {/* Save Button - further down */}
            <Button3D
              position={[0.10, -0.75, 0]}
              label={selectedExercise._id ? 'Update' : 'Save'}
              onClick={handleSave}
              color="#4caf50"
              width={0.36}
              fontSize={0.045}
            />
          </group>
        )}
        {/* Feedback message */}
        {feedback && (
          <Text
            position={[0, -panelHeight/2 + 0.08, panelDepth/2 + 0.02]}
            fontSize={0.07}
            color="#FFC107"
            anchorX="center"
            anchorY="middle"
            maxWidth={panelWidth-0.2}
          >
            {loading ? 'Loading...' : feedback}
          </Text>
        )}
      </group>
    )
  }
  
export default AuthoringPanel3D 