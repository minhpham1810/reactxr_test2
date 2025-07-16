import React, { useState, useEffect } from 'react';
import { getExercises, saveExercise, updateExercise, deleteExercise } from './helpers';
import './AuthoringPanelHTML.css';

export default function AuthoringPanelHTML({
  authoringMode, setAuthoringMode,
  lesson, setLesson,
  selectedExercise, setSelectedExercise
}) {
  // Local state mirrors AuthoringPanel3D
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [exerciseScrollOffset, setExerciseScrollOffset] = useState(0);
  const VISIBLE_EXERCISES = 5;
  const canScrollUp = exerciseScrollOffset > 0;
  const canScrollDown = exercises.length > VISIBLE_EXERCISES && (exerciseScrollOffset + VISIBLE_EXERCISES) < exercises.length;
  const [editingField, setEditingField] = useState(null); // 'name' | 'description' | 'array-idx' | null

  // Load exercises from backend
  useEffect(() => {
    refreshExercises();
    // eslint-disable-next-line
  }, []);
  async function refreshExercises() {
    setLoading(true);
    try {
      const data = await getExercises();
      setExercises(data);
      if (selectedExerciseId) {
        const found = data.find(e => e._id === selectedExerciseId);
        setSelectedExercise(found ? { ...found } : null);
      }
    } catch (e) {
      setFeedback('Error loading exercises');
    }
    setLoading(false);
  }
  // Save exercise (create or update)
  async function handleSave() {
    setLoading(true);
    try {
      if (selectedExercise && selectedExercise._id) {
        const { _id, ...exerciseData } = selectedExercise;
        await updateExercise(selectedExercise._id, exerciseData);
        setFeedback('Exercise updated!');
      } else if (selectedExercise) {
        const saved = await saveExercise(selectedExercise);
        setSelectedExerciseId(saved._id);
        setSelectedExercise(saved);
        setFeedback('Exercise saved!');
      }
      refreshExercises();
    } catch (e) {
      setFeedback('Save failed');
    }
    setLoading(false);
  }
  // Load exercise
  function handleLoad(id) {
    const ex = exercises.find(e => e._id === id);
    setSelectedExercise(ex ? { ...ex } : null);
    setSelectedExerciseId(id);
    setFeedback('Exercise loaded!');
  }
  // Delete exercise
  async function handleDelete(id) {
    if (!window.confirm('Delete this exercise?')) return;
    setLoading(true);
    try {
      await deleteExercise(id);
      setFeedback('Exercise deleted!');
      setSelectedExerciseId(null);
      setSelectedExercise(null);
      refreshExercises();
    } catch (e) {
      setFeedback('Delete failed');
    }
    setLoading(false);
  }
  // Add new exercise
  function handleAddNew() {
    setSelectedExerciseId(null);
    setSelectedExercise({ name: '', description: '', array: [1,2,3,4] });
    setFeedback('New exercise');
  }

  // Render
  return (
    <div className="authoring-panel-html">
      <div className="authoring-header">
        <h3>Exercises</h3>
        <button className="add-btn" onClick={handleAddNew}>+ New</button>
      </div>
      <div className="exercise-list">
        <button className="scroll-btn" disabled={!canScrollUp} onClick={() => setExerciseScrollOffset(o => Math.max(0, o - 1))}>▲</button>
        {exercises.slice(exerciseScrollOffset, exerciseScrollOffset + VISIBLE_EXERCISES).map((ex, idx) => {
          const realIdx = exerciseScrollOffset + idx;
          const isSelected = selectedExercise && ex._id === selectedExercise._id;
          return (
            <div key={ex._id} className={`exercise-item${isSelected ? ' selected' : ''}`}>
              <span className="exercise-label" onClick={() => handleLoad(ex._id)}>{`#${realIdx+1} ${ex.name ? ' - ' + ex.name : ''}`}</span>
              <button className="edit-btn" onClick={() => handleLoad(ex._id)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(ex._id)}>Delete</button>
            </div>
          );
        })}
        <button className="scroll-btn" disabled={!canScrollDown} onClick={() => setExerciseScrollOffset(o => Math.min(exercises.length - VISIBLE_EXERCISES, o + 1))}>▼</button>
      </div>
      {selectedExercise && (
        <div className="exercise-editor">
          <div className="field-group">
            <label>Name:</label>
            <input
              type="text"
              value={selectedExercise.name || ''}
              onChange={e => setSelectedExercise({ ...selectedExercise, name: e.target.value })}
              placeholder="Exercise Name"
            />
          </div>
          <div className="field-group">
            <label>Description:</label>
            <input
              type="text"
              value={selectedExercise.description || ''}
              onChange={e => setSelectedExercise({ ...selectedExercise, description: e.target.value })}
              placeholder="Description"
            />
          </div>
          <div className="field-group array-length-group">
            <label>Array Length: {selectedExercise.array.length}</label>
            <button
              className="array-btn"
              onClick={() => {
                if (selectedExercise.array.length < 15) {
                  setSelectedExercise({ ...selectedExercise, array: [...selectedExercise.array, 1] });
                }
              }}
            >+</button>
            <button
              className="array-btn"
              onClick={() => {
                if (selectedExercise.array.length > 2) {
                  setSelectedExercise({ ...selectedExercise, array: selectedExercise.array.slice(0, selectedExercise.array.length - 1) });
                }
              }}
            >-</button>
          </div>
          <div className="field-group array-values-group">
            <label>Array Values:</label>
            <div className="array-values">
              {selectedExercise.array.map((val, arrIdx) => (
                <input
                  key={arrIdx}
                  type="number"
                  value={val}
                  onChange={e => {
                    const num = Number(e.target.value);
                    if (!isNaN(num)) {
                      const newArr = selectedExercise.array.map((v, i) => i === arrIdx ? num : v);
                      setSelectedExercise({ ...selectedExercise, array: newArr });
                    }
                  }}
                  className="array-value-input"
                  min={-999}
                  max={999}
                />
              ))}
            </div>
          </div>
          <button className="save-btn" onClick={handleSave} disabled={loading}>
            {selectedExercise._id ? 'Update' : 'Save'}
          </button>
        </div>
      )}
      {feedback && (
        <div className="feedback-msg">{loading ? 'Loading...' : feedback}</div>
      )}
    </div>
  );
} 