// Helper to generate a random array
export function randomArray(length = 6, min = 1, max = 9) {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}
// Add other helpers here as needed 
export const getCompartmentPos = (idx, boxWidth, compartmentWidth, yBase, SCENE_SCALE, zBase) => ([
    -boxWidth / 2 + compartmentWidth / 2 + idx * compartmentWidth,
    yBase + 0.18 * SCENE_SCALE,
    zBase
  ])
  
  export const getNearestCompartment = (x, arrayLength, boxWidth, compartmentWidth) => {
    let minDist = Infinity
    let minIdx = 0
    for (let i = 0; i < arrayLength; i++) {
      const cx = -boxWidth / 2 + compartmentWidth / 2 + i * compartmentWidth
      const dist = Math.abs(x - cx)
      if (dist < minDist) {
        minDist = dist
        minIdx = i
      }
    }
    return minIdx
  }
  
  export const checkSorted = (arr) => {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < arr[i - 1]) return false
    }
    return true
  }

// --- Backend API helpers for exercises ---
const API_BASE = import.meta.env.VITE_API_BASE || '';
const EXERCISES_ENDPOINT = `${API_BASE}/api/exercises`;
const USE_MOCK_UP_DEBUG = true;

export async function getExercises() {
  if (USE_MOCK_UP_DEBUG) {
    // Mock a response
    const mockData = [
      {
        _id: "ex1",
        name: "Mockup1",
        description: "Mocked exercise",
        array: [1, 2, 3, 4, 5],
      },
      {
        _id: "ex2",
        name: "Mockup2",
        description: "Another mocked exercise",
        array: [10, 20, 30],
      },
    ];

    const res = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  else {
    const res = await fetch(EXERCISES_ENDPOINT);
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to fetch exercises: ${error}`);
    }
  }
  return res.json();
}

export async function getExercise(id) {
  const res = await fetch(`${EXERCISES_ENDPOINT}/${id}`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch exercise: ${error}`);
  }
  return res.json();
}

export async function saveExercise(exercise) {
  const res = await fetch(EXERCISES_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exercise)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to save exercise: ${error}`);
  }
  return res.json();
}

export async function updateExercise(id, update) {
  const res = await fetch(`${EXERCISES_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update exercise: ${error}`);
  }
  return res.json();
}

export async function deleteExercise(id) {
  const res = await fetch(`${EXERCISES_ENDPOINT}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete exercise: ${error}`);
  }
  return res.json();
}