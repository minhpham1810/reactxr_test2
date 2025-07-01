import { useXR } from '@react-three/xr'
import React from 'react'

const XRStatus = ({ setIsPresenting, isPresenting }) => {
  const xr = useXR()
  if (xr.isPresenting && !isPresenting) setIsPresenting(true)
  if (!xr.isPresenting && isPresenting) setIsPresenting(false)
  return null
}

export default XRStatus 