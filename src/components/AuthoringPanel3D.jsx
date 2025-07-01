import { Text } from '@react-three/drei'
import React from 'react'


export function AuthoringPanel3D({
    authoringMode, setAuthoringMode,
    lesson, setLesson,
    selectedExerciseIdx, setSelectedExerciseIdx
  }) {
    // Panel position
    const panelPos = [-1.5, 2.2, -1]
    const panelWidth = 2.8
    const panelHeight = 1.7
    const panelDepth = 0.05
  
    // 3D Input Field (simulated with mesh and Text, triggers browser prompt for input)
    function Input3D({ position, value, onChange, width = 1.2, height = 0.13, label = '', fontSize = 0.09, color = '#23283a', textColor = '#fff' }) {
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
    function Button3D({ position, label, onClick, width = 0.32, height = 0.13, color = '#2196f3', textColor = '#fff', fontSize = 0.09 }) {
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
        {/* Authoring Mode Toggle */}
        <Button3D
          position={[-panelWidth/2 + 0.22, panelHeight/2 - 0.18, panelDepth/2 + 0.01]}
          label={authoringMode ? 'Authoring: ON' : 'Authoring: OFF'}
          onClick={() => setAuthoringMode(!authoringMode)}
          color={authoringMode ? '#4caf50' : '#888'}
          width={0.44}
        />
        {/* Lesson Title Input */}
        <Text
          position={[-panelWidth/2 + 0.18, panelHeight/2 - 0.38, panelDepth/2 + 0.01]}
          fontSize={0.11}
          color="#fff"
          anchorX="left"
          anchorY="middle"
          maxWidth={1.2}
        >
          Title:
        </Text>
        <Input3D
          position={[-panelWidth/2 + 0.7, panelHeight/2 - 0.38, panelDepth/2 + 0.01]}
          value={lesson.title}
          onChange={val => setLesson({ ...lesson, title: val })}
          width={1.6}
          label="Lesson Title"
          fontSize={0.10}
        />
        {/* Lesson Description Input */}
        <Text
          position={[-panelWidth/2 + 0.18, panelHeight/2 - 0.58, panelDepth/2 + 0.01]}
          fontSize={0.10}
          color="#fff"
          anchorX="left"
          anchorY="middle"
          maxWidth={1.2}
        >
          Description:
        </Text>
        <Input3D
          position={[-panelWidth/2 + 0.7, panelHeight/2 - 0.58, panelDepth/2 + 0.01]}
          value={lesson.description}
          onChange={val => setLesson({ ...lesson, description: val })}
          width={1.6}
          label="Lesson Description"
          fontSize={0.10}
        />
        {/* Exercises List */}
        <Text
          position={[-panelWidth/2 + 0.18, panelHeight/2 - 0.80, panelDepth/2 + 0.01]}
          fontSize={0.10}
          color="#fff"
          anchorX="left"
          anchorY="middle"
        >
          Exercises:
        </Text>
        {lesson.exercises.map((ex, idx) => (
          <group key={idx} position={[-panelWidth/2 + 0.18, panelHeight/2 - 1.00 - idx*0.18, panelDepth/2 + 0.01]}>
            <Text fontSize={0.09} color="#fff" anchorX="left" anchorY="middle">{`#${idx+1}`}</Text>
            <Button3D
              position={[0.38, 0, 0]}
              label="Edit"
              onClick={() => setSelectedExerciseIdx(idx)}
              color="#2196f3"
              width={0.22}
              fontSize={0.07}
            />
            <Button3D
              position={[0.65, 0, 0]}
              label="Remove"
              onClick={() => {
                const newExercises = lesson.exercises.filter((_, i) => i !== idx)
                setLesson({ ...lesson, exercises: newExercises })
                if (selectedExerciseIdx === idx) setSelectedExerciseIdx(null)
                else if (selectedExerciseIdx > idx) setSelectedExerciseIdx(selectedExerciseIdx - 1)
              }}
              color="#e53935"
              width={0.28}
              fontSize={0.07}
            />
          </group>
        ))}
        {/* Add New Exercise Button */}
        <Button3D
          position={[-panelWidth/2 + 0.7, panelHeight/2 - 1.00 - lesson.exercises.length*0.18, panelDepth/2 + 0.01]}
          label="Add New Exercise"
          onClick={() => {
            const newExercise = { array: [1,2,3,4], instructions: '' }
            setLesson({ ...lesson, exercises: [...lesson.exercises, newExercise] })
            setSelectedExerciseIdx(lesson.exercises.length)
          }}
          color="#FFC107"
          width={0.56}
          fontSize={0.08}
          textColor="#23283a"
        />
        {/* Exercise Editor */}
        {selectedExerciseIdx !== null && lesson.exercises[selectedExerciseIdx] && (
          <group position={[-panelWidth/2 + 0.18, panelHeight/2 - 1.38 - lesson.exercises.length*0.18, panelDepth/2 + 0.01]}>
            {/* Array Length */}
            <Text fontSize={0.09} color="#fff" anchorX="left" anchorY="middle" position={[0, 0, 0]}>
              {`Array Length: ${lesson.exercises[selectedExerciseIdx].array.length}`}
            </Text>
            <Button3D
              position={[1.0, 0, 0]}
              label="+"
              onClick={() => {
                const arr = lesson.exercises[selectedExerciseIdx].array
                if (arr.length < 12) {
                  const newArr = [...arr, 1]
                  const newExercises = lesson.exercises.map((ex, i) => i === selectedExerciseIdx ? { ...ex, array: newArr } : ex)
                  setLesson({ ...lesson, exercises: newExercises })
                }
              }}
              color="#4caf50"
              width={0.16}
              fontSize={0.09}
            />
            <Button3D
              position={[1.18, 0, 0]}
              label="-"
              onClick={() => {
                const arr = lesson.exercises[selectedExerciseIdx].array
                if (arr.length > 2) {
                  const newArr = arr.slice(0, arr.length - 1)
                  const newExercises = lesson.exercises.map((ex, i) => i === selectedExerciseIdx ? { ...ex, array: newArr } : ex)
                  setLesson({ ...lesson, exercises: newExercises })
                }
              }}
              color="#e53935"
              width={0.16}
              fontSize={0.09}
            />
            {/* Array Values (vertical stack) */}
            <group position={[0, -0.18, 0]}>
              <Text fontSize={0.09} color="#fff" anchorX="left" anchorY="middle" position={[0, 0, 0]}>
                Array Values:
              </Text>
              {lesson.exercises[selectedExerciseIdx].array.map((val, arrIdx) => (
                <group key={arrIdx} position={[0.38 + arrIdx*0.32, 0, 0]}>
                  <Text fontSize={0.09} color="#fff" anchorX="center" anchorY="middle" position={[0, 0.08, 0]}>{val}</Text>
                  <Button3D
                    position={[0, -0.04, 0]}
                    label="+"
                    onClick={() => {
                      const arr = lesson.exercises[selectedExerciseIdx].array
                      const newArr = arr.map((v, i) => i === arrIdx ? v + 1 : v)
                      const newExercises = lesson.exercises.map((ex, i) => i === selectedExerciseIdx ? { ...ex, array: newArr } : ex)
                      setLesson({ ...lesson, exercises: newExercises })
                    }}
                    color="#4caf50"
                    width={0.16}
                    fontSize={0.08}
                  />
                  <Button3D
                    position={[0, -0.13, 0]}
                    label="-"
                    onClick={() => {
                      const arr = lesson.exercises[selectedExerciseIdx].array
                      const newArr = arr.map((v, i) => i === arrIdx ? Math.max(1, v - 1) : v)
                      const newExercises = lesson.exercises.map((ex, i) => i === selectedExerciseIdx ? { ...ex, array: newArr } : ex)
                      setLesson({ ...lesson, exercises: newExercises })
                    }}
                    color="#e53935"
                    width={0.16}
                    fontSize={0.08}
                  />
                </group>
              ))}
            </group>
            {/* Instructions Input */}
            <group position={[0, -0.38, 0]}>
              <Text fontSize={0.09} color="#fff" anchorX="left" anchorY="middle" position={[0, 0, 0]}>
                Instructions:
              </Text>
              <Input3D
                position={[0.9, 0, 0]}
                value={lesson.exercises[selectedExerciseIdx].instructions}
                onChange={val => {
                  const newExercises = lesson.exercises.map((ex, i) => i === selectedExerciseIdx ? { ...ex, instructions: val } : ex)
                  setLesson({ ...lesson, exercises: newExercises })
                }}
                width={1.2}
                label="Instructions"
                fontSize={0.09}
              />
            </group>
          </group>
        )}
      </group>
    )
  }
  
export default AuthoringPanel3D 