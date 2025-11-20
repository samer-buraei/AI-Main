/**
 * KanbanBoard Component
 * The main Kanban board with drag-and-drop functionality
 */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTasks } from '../hooks/useProjects';
import TaskCard from './TaskCard';
import { TASK_STATUSES, STATUS_LABELS } from '../utils/constants';
import * as api from '../services/api';
import { Rocket } from 'lucide-react';

// Define our columns
const COLUMNS = {
  ready: { id: TASK_STATUSES.READY, title: STATUS_LABELS[TASK_STATUSES.READY] },
  inProgress: { id: TASK_STATUSES.IN_PROGRESS, title: STATUS_LABELS[TASK_STATUSES.IN_PROGRESS] },
  done: { id: TASK_STATUSES.DONE, title: STATUS_LABELS[TASK_STATUSES.DONE] },
  blocked: { id: TASK_STATUSES.BLOCKED, title: STATUS_LABELS[TASK_STATUSES.BLOCKED] },
};

export default function KanbanBoard({ project }) {
  const { tasks, isLoading, error, updateTask, loadTasks } = useTasks(project?.id);
  const [localTasks, setLocalTasks] = useState([]);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [showBootstrapModal, setShowBootstrapModal] = useState(false);

  // Sync local tasks with fetched tasks
  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Handle Bootstrap Sprint
  const handleBootstrapSprint = async () => {
    setBootstrapLoading(true);
    try {
      const result = await api.bootstrapSprint({
        projectId: project.id,
        sprintType: 'fireswarm_phase0'
      });

      if (result.error) {
        alert(`Bootstrap failed: ${result.error.error || 'Unknown error'}`);
        return;
      }

      // Reload tasks to show the new ones
      if (loadTasks) {
        await loadTasks();
      }
      
      setShowBootstrapModal(false);
      alert(`✅ Bootstrap Sprint created! ${result.data.tasks.length} tasks added.`);
    } catch (err) {
      alert(`Bootstrap failed: ${err.message}`);
    } finally {
      setBootstrapLoading(false);
    }
  };

  // Handle drag end
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Check if drop is valid
    if (!destination) return; // Dropped outside a valid column
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return; // Dropped in the same place
    }

    // Find the task that was moved
    const movedTask = localTasks.find((t) => t.id === draggableId);
    if (!movedTask) return;

    // Optimistic UI update
    const newStatus = destination.droppableId;
    const updatedTasks = localTasks.map((task) =>
      task.id === draggableId ? { ...task, status: newStatus } : task
    );
    setLocalTasks(updatedTasks);

    // Backend API call
    try {
      await updateTask(draggableId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Rollback on error
      setLocalTasks(localTasks);
      alert(`Error: Could not update task. ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400">
          <p className="font-semibold">Error loading tasks</p>
          <p className="text-sm">{error.error || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  // Show Bootstrap Sprint button if no tasks
  const hasTasks = localTasks.length > 0;

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">{project.name}</h2>
        {project.description && (
          <p className="text-gray-400">{project.description}</p>
        )}
      </div>

      {/* Bootstrap Sprint Hero Button (when no tasks) */}
      {!isLoading && !hasTasks && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl border border-purple-700">
          <div className="flex items-center gap-4">
            <Rocket className="text-purple-300" size={48} />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">🚀 Bootstrap Sprint</h3>
              <p className="text-gray-300 mb-4">
                This will create 3 agents and 3 tasks to validate the simulation:
              </p>
              <ul className="text-sm text-gray-300 space-y-1 mb-4">
                <li>✅ Sim_Setup: Dockerize ArduPilot SITL + Gazebo Garden</li>
                <li>✅ Data_Rig: "Stick of Truth" capture script</li>
                <li>✅ AI_Baseline: Train YOLOv11n on FLAME-3 dataset</li>
              </ul>
              <button
                onClick={handleBootstrapSprint}
                disabled={bootstrapLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Rocket size={18} />
                {bootstrapLoading ? 'Creating Sprint...' : 'Create Bootstrap Sprint'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(COLUMNS).map((column) => {
            const columnTasks = localTasks.filter((task) => task.status === column.id);
            return (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-gray-800 rounded-lg p-4 min-h-[500px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-750 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {/* Column Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        {column.title}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {columnTasks.length} task{columnTasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Column Body (Tasks) */}
                    <div className="space-y-4">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard task={task} isDragging={snapshot.isDragging} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

