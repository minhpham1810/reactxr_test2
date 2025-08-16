import React, { useState, useRef } from "react";
import { Matrix4, Vector3 } from "three";
import {
  getCompartmentPos,
  getNearestCompartment,
  checkSorted,
} from "./helpers";
import GeminiAPI from "./gemini.js";
import { XRHitTest, Interactive } from "@react-three/xr";
import { Text } from "@react-three/drei";

// --- DEBUG HELPERS ---
const DEBUG = true; // flip to false to silence the printout
const t = () => (performance.now()/1000).toFixed(3);
const log = (label, data = {}) => { if (DEBUG) console.log(`[${t()}] ${label}`, data); };

function ExerciseSortVisualizer({
  array,
  setArray,
  moveHistory,
  setMoveHistory,
  feedback,
  setFeedback,
  undo,
  reset,
  setIsDragging,
}) {
  // Use the same SCENE_SCALE as the demo
  const SCENE_SCALE = 0.7;
  const compartmentCount = array.length;
  const boxWidth = 2.4 * SCENE_SCALE;
  const boxHeight = 0.18 * SCENE_SCALE;
  const boxDepth = 0.3 * SCENE_SCALE;
  const compartmentWidth = boxWidth / compartmentCount;
  const yBase = 1.2 * SCENE_SCALE;
  const zBase = -1 * SCENE_SCALE;

  // Drag state
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  //const dragging = draggedIdx !== null;
  // use effect to update the status instead
  React.useEffect(() => {
    setIsDragging(draggedIdx !== null);
  }, [draggedIdx, setIsDragging]);
  
  const meshRefs = useRef([]);

  // AR drag state
  const [arDraggingIdx, setArDraggingIdx] = useState(null);
  const [arIsDragging, setArIsDragging] = useState(false);
  const [hitPos, setHitPos] = useState(null);
  const matrixHelper = useRef(new Matrix4());

  // log the dragging info
  React.useEffect(() => {
    log('dragging Info', { dragging: draggedIdx !== null, draggedIdx, dragPos });
  }, [draggedIdx, dragPos]);

  // Web drag handlers
  const handlePointerDown = (idx, e) => {
    e.stopPropagation();
    // Set pointer capture for smooth dragging
    const mesh = meshRefs.current[idx];
    if (mesh) {
      mesh.setPointerCapture(e.pointerId);
    }
    setDraggedIdx(idx);
    setDragPos(
      getCompartmentPos(
        idx,
        boxWidth,
        compartmentWidth,
        yBase,
        SCENE_SCALE,
        zBase
      )
    );
    //setIsDragging(true);
    
    log('pointerDown', { idx, pointerId: e.pointerId });
  };

  const handlePointerMove = (e) => {
    if (draggedIdx === null) { log('pointerMove: ignored (not dragging)'); return; }
    // Use e.point for accurate 3D cursor tracking
    const { x, y, z } = e.point;
    // Allow some vertical movement within constraints
    const constrainedY = Math.max(
      yBase,
      Math.min(yBase + 0.5 * SCENE_SCALE, y)
    );
    // Allow some depth movement for better feel
    const constrainedZ = Math.max(
      zBase - 0.2 * SCENE_SCALE,
      Math.min(zBase + 0.2 * SCENE_SCALE, z)
    );
    
    log('pointerMove', { x: e.point.x, y: e.point.y, z: e.point.z, draggedIdx, rx: x, ry: constrainedY, rz: constrainedZ });
    setDragPos([x, constrainedY, constrainedZ]);
  };

  // use effect to handle out of canvas pointer up
  React.useEffect(() => {
    const onWinUp = (e) => {
      if (draggedIdx !== null) handlePointerUp(e);
    };
    window.addEventListener('pointerup', onWinUp);
    return () => window.removeEventListener('pointerup', onWinUp);
  }, [draggedIdx]);

  const handlePointerUp = (e) => {
    if (draggedIdx === null) { log('pointerUp: ignored (not dragging)'); return; }
    
    // try to release the pointer whenever there is a dragging index
    try {
      meshRefs.current[draggedIdx]?.releasePointerCapture(e.pointerId);
    } catch {}
    
    // Release pointer capture
    const mesh = meshRefs.current[draggedIdx];
    if (mesh) {
      mesh.releasePointerCapture(e.pointerId);
    }
    handleDrop(draggedIdx, dragPos);
    //setIsDragging(false);
    
    log('pointerUp', { pointerId: e.pointerId, draggedIdx, dragPos });
  };

  // AR drag handlers using Interactive and XRHitTest
  const handleARSelectStart = (idx) => {
    setArDraggingIdx(idx);
    setArIsDragging(true);
    setIsDragging(true);

    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };
  const handleARSelectEnd = () => {
    if (arDraggingIdx !== null && hitPos) {
      handleDrop(arDraggingIdx, hitPos);
    }
    setArDraggingIdx(null);
    setArIsDragging(false);
    setHitPos(null);
    setIsDragging(false);
  };

  const handleDrop = (idx, pos) => {
    const nearestIdx = getNearestCompartment(
      pos[0],
      array.length,
      boxWidth,
      compartmentWidth
    );
    log('handleDrop', { idx: idx, nidx: nearestIdx });
    if (nearestIdx === idx) {
      setDraggedIdx(null);
      setDragPos(null);
      return;
    }
    // Move sphere from idx to nearestIdx
    const newArr = [...array];
    const [moved] = newArr.splice(idx, 1);
    newArr.splice(nearestIdx, 0, moved);
    setMoveHistory([...moveHistory, { array }]);
    setArray(newArr);
    setDraggedIdx(null);
    setDragPos(null);
    // Check correctness
    const sorted = checkSorted(newArr);
    if (sorted) {
      setFeedback("Correct! The array is sorted.");
    } else {
      setFeedback("Keep sorting!");
    }
  };

  // Gemini suggestion loading state
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Async function to call Google Gemini API using imported GeminiAPI
  async function getGeminiSuggestion(array) {
    try {
      const suggestion = await GeminiAPI.generateSortSuggestion(array);
      return suggestion || "No suggestion available.";
    } catch (err) {
      return "Error fetching suggestion.";
    }
  }

  // Padding values
  const FEEDBACK_BOX_WIDTH = 2.0 * SCENE_SCALE;
  const FEEDBACK_BOX_HEIGHT = 0.7 * SCENE_SCALE;
  const FEEDBACK_BOX_DEPTH = 0.04 * SCENE_SCALE;
  const FEEDBACK_TEXT_PADDING = 0.12 * SCENE_SCALE;

  return (
    <>
      {/* XRHitTest for AR drag-and-drop */}
      {arIsDragging && (
        <XRHitTest
          onResults={(results, getWorldMatrix) => {
            if (results.length === 0) return;
            getWorldMatrix(matrixHelper.current, results[0]);
            const pos = new Vector3().setFromMatrixPosition(
              matrixHelper.current
            );

            // Apply similar constraints as web dragging
            const constrainedY = Math.max(
              yBase,
              Math.min(yBase + 0.5 * SCENE_SCALE, pos.y)
            );
            const constrainedZ = Math.max(
              zBase - 0.2 * SCENE_SCALE,
              Math.min(zBase + 0.2 * SCENE_SCALE, pos.z)
            );

            setHitPos([pos.x, constrainedY, constrainedZ]);
          }}
        />
      )}
      {/* Virtual window for feedback */}
      <group
        position={[
          boxWidth / 2 + FEEDBACK_BOX_WIDTH / 2 + 0.2 * SCENE_SCALE,
          yBase + 0.18 * SCENE_SCALE,
          zBase,
        ]}
      >
        <mesh>
          <boxGeometry
            args={[FEEDBACK_BOX_WIDTH, FEEDBACK_BOX_HEIGHT, FEEDBACK_BOX_DEPTH]}
          />
          <meshStandardMaterial color="#23283a" opacity={0.92} transparent />
        </mesh>
        <Text
          position={[
            -FEEDBACK_BOX_WIDTH / 2 + FEEDBACK_TEXT_PADDING,
            0,
            FEEDBACK_BOX_DEPTH / 2 + 0.001,
          ]}
          fontSize={0.13 * SCENE_SCALE}
          color="#fff"
          anchorX="left"
          anchorY="middle"
          maxWidth={FEEDBACK_BOX_WIDTH - 2 * FEEDBACK_TEXT_PADDING}
        >
          {feedback || "Drag and drop the spheres to sort the array!"}
        </Text>
      </group>
      {/* Array box with compartments */}
      <mesh position={[0, yBase, zBase]}>
        <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
        <meshStandardMaterial color="#222a38" />
      </mesh>
      {/* Compartments */}
      {array.map((_, idx) => (
        <mesh
          key={idx}
          position={[
            -boxWidth / 2 + compartmentWidth / 2 + idx * compartmentWidth,
            yBase,
            zBase + 0.001 * SCENE_SCALE,
          ]}
        >
          <boxGeometry
            args={[compartmentWidth * 0.98, boxHeight * 0.96, boxDepth * 1.01]}
          />
          <meshStandardMaterial color="#2e3a4d" />
        </mesh>
      ))}
      {/* 0-indexed indices under the array */}
      {array.map((_, idx) => (
        <Text
          key={"idx-label-" + idx}
          position={[
            -boxWidth / 2 + compartmentWidth / 2 + idx * compartmentWidth,
            yBase - 0.16 * SCENE_SCALE,
            zBase + 0.03 * SCENE_SCALE,
          ]}
          fontSize={0.11 * SCENE_SCALE}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {idx}
        </Text>
      ))}
      {/* Spheres as elements (draggable) */}
      {array.map((value, idx) => {
        const isDragged = draggedIdx === idx || arDraggingIdx === idx;
        // AR: use hitPos if this sphere is being dragged in AR
        // Add smooth transitions between positions
        const targetPos =
          arIsDragging && arDraggingIdx === idx && hitPos
            ? hitPos
            : draggedIdx === idx && dragPos
            ? dragPos
            : getCompartmentPos(
                idx,
                boxWidth,
                compartmentWidth,
                yBase,
                SCENE_SCALE,
                zBase
              );

        const pos = targetPos;
        if (meshRefs.current[idx]) {
          const mesh = meshRefs.current[idx];
          if (isDragged) {
            // no smoothing when it is dragging
            mesh.position.set(targetPos[0], targetPos[1], targetPos[2]);
          }
          else {
            // Smoothly interpolate current position to target
            // why do we need this?
            mesh.position.lerp(new Vector3(...targetPos), 0.3);
          }
        }
        return (
          <Interactive
            key={idx + "-sphere"}
            onSelectStart={() => handleARSelectStart(idx)}
            onSelectEnd={handleARSelectEnd}
          >
            <mesh
              ref={(el) => (meshRefs.current[idx] = el)}
              position={pos}
              scale={isDragged ? 1.1 * SCENE_SCALE : 1 * SCENE_SCALE}
              onPointerDown={(e) => handlePointerDown(idx, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerOver={(e) =>
                e.object.scale.setScalar(1.05 * SCENE_SCALE)
              }
              onPointerOut={(e) =>
                !isDragged && e.object.scale.setScalar(1 * SCENE_SCALE)
              }
              onPointerLeave={(e) =>
                !isDragged && e.object.scale.setScalar(1 * SCENE_SCALE)
              }
              castShadow
              pointerEvents="auto"
            >
              <sphereGeometry args={[0.11 * SCENE_SCALE, 32, 32]} />
              <meshStandardMaterial
                color={isDragged ? "#FFC107" : "#2196f3"}
                emissive={isDragged ? "#FFC107" : "#000"}
                emissiveIntensity={isDragged ? 0.2 : 0}
                roughness={isDragged ? 0.4 : 0.6}
                metalness={isDragged ? 0.6 : 0.4}
              />
              <Text
                position={[0, 0, 0.13 * SCENE_SCALE]}
                fontSize={0.13 * SCENE_SCALE}
                color="#000"
                anchorX="center"
                anchorY="middle"
              >
                {value}
              </Text>
            </mesh>
          </Interactive>
        );
      })}
      {/* 3D Undo, Reset, and Suggestion Buttons */}
      <group position={[0, yBase - 0.5 * SCENE_SCALE, zBase]}>
        {/* Undo Button */}
        <mesh position={[-1.0 * SCENE_SCALE, 0, 0]} onClick={undo}>
          <boxGeometry
            args={[0.7 * SCENE_SCALE, 0.18 * SCENE_SCALE, 0.08 * SCENE_SCALE]}
          />
          <meshStandardMaterial color={"#FFC107"} />
          <Text
            position={[0, 0, 0.06 * SCENE_SCALE]}
            fontSize={0.11 * SCENE_SCALE}
            color="#23283a"
            anchorX="center"
            anchorY="middle"
          >
            Undo
          </Text>
        </mesh>
        {/* Reset Button */}
        <mesh position={[0, 0, 0]} onClick={reset}>
          <boxGeometry
            args={[0.7 * SCENE_SCALE, 0.18 * SCENE_SCALE, 0.08 * SCENE_SCALE]}
          />
          <meshStandardMaterial color={"#2e3a4d"} />
          <Text
            position={[0, 0, 0.06 * SCENE_SCALE]}
            fontSize={0.11 * SCENE_SCALE}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            Reset
          </Text>
        </mesh>
        {/* Suggestion Button */}
        <mesh
          position={[1.0 * SCENE_SCALE, 0, 0]}
          onClick={async () => {
            if (loadingSuggestion) return;
            setLoadingSuggestion(true);
            setFeedback("Loading suggestion...");
            const suggestion = await getGeminiSuggestion(array);
            setFeedback(suggestion);
            setLoadingSuggestion(false);
          }}
        >
          <boxGeometry
            args={[0.9 * SCENE_SCALE, 0.18 * SCENE_SCALE, 0.08 * SCENE_SCALE]}
          />
          <meshStandardMaterial
            color={loadingSuggestion ? "#888" : "#4caf50"}
          />
          <Text
            position={[0, 0, 0.06 * SCENE_SCALE]}
            fontSize={0.11 * SCENE_SCALE}
            color="#fff"
            anchorX="center"
            anchorY="middle"
          >
            {loadingSuggestion ? "Loading..." : "AI Suggestion"}
          </Text>
        </mesh>
      </group>
    </>
  );
}

export default ExerciseSortVisualizer;
