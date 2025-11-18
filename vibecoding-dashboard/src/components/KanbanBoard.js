/**
 * KanbanBoard Component
 * The main Kanban board with drag-and-drop functionality
 */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useTasks } from '../hooks/useProjects';
import TaskCard from './TaskCard';
import { TASK_STATUSES, STATUS_LABELS } from '../utils/constants';

// Define our columns
const COLUMNS = {
  ready: { id: TASK_STATUSES.READY, title: STATUS_LABELS[TASK_STATUSES.READY] },
  inProgress: { id: TASK_STATUSES.IN_PROGRESS, title: STATUS_LABELS[TASK_STATUSES.IN_PROGRESS] },
  done: { id: TASK_STATUSES.DONE, title: STATUS_LABELS[TASK_STATUSES.DONE] },
  blocked: { id: TASK_STATUSES.BLOCKED, title: STATUS_LABELS[TASK_STATUSES.BLOCKED] },
};

export default function KanbanBoard({ project }) {
  const { tasks, isLoading, error, updateTask } = useTasks(project?.id);
  const [localTasks, setLocalTasks] = useState([]);

  // Sync local tasks with fetched tasks
  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

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

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">{project.name}</h2>
        {project.description && (
          <p className="text-gray-400">{project.description}</p>
        )}
      </div>

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

