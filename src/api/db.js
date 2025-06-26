const API_URL = 'http://localhost:3000/api'

export async function saveExercise(exerciseData) {
  try {
    const response = await fetch(`${API_URL}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exerciseData)
    })
    return await response.json()
  } catch (error) {
    console.error('Error saving exercise:', error)
    throw error
  }
}

export async function loadExercise(id) {
  try {
    const response = await fetch(`${API_URL}/exercises/${id}`)
    return await response.json()
  } catch (error) {
    console.error('Error loading exercise:', error)
    throw error
  }
}

export async function listExercises() {
  try {
    const response = await fetch(`${API_URL}/exercises`)
    return await response.json()
  } catch (error) {
    console.error('Error listing exercises:', error)
    throw error
  }
}