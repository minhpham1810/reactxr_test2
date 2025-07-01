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