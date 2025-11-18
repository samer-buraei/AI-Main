/**
 * TaskCard Component
 * A draggable card representing a single task
 */

import React from 'react';
import { User, Layers } from 'lucide-react';
import { AGENT_COLORS } from '../utils/constants';

export default function TaskCard({ task, isDragging }) {
  const getAgentColor = (agent) => {
    if (!agent) return 'bg-gray-500 text-gray-100';
    return AGENT_COLORS[agent] || 'bg-gray-500 text-gray-100';
  };

  const shortId = task.id.length > 8 ? `${task.id.substring(0, 8)}...` : task.id;

  return (
    <div
      className={`bg-gray-700 rounded-md shadow-lg p-4 transition-all ${
        isDragging ? 'opacity-90 ring-2 ring-blue-500 scale-105' : 'hover:shadow-xl'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
    >
      <h4 className="font-bold text-white mb-2 text-sm">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-gray-300 mb-4 line-clamp-3">{task.description}</p>
      )}

      <div className="flex justify-between items-center mt-4">
        {/* Assigned Agent */}
        {task.assigned_to && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${getAgentColor(
              task.assigned_to
            )}`}
            aria-label={`Assigned to ${task.assigned_to}`}
          >
            <User size={12} />
            {task.assigned_to}
          </span>
        )}

        {/* Task ID */}
        <span
          className="text-xs text-gray-400 font-mono flex items-center gap-1"
          title={`Task ID: ${task.id}`}
        >
          <Layers size={12} />
          {shortId}
        </span>
      </div>

      {/* Status indicator */}
      <div className="mt-2 pt-2 border-t border-gray-600">
        <span className="text-xs text-gray-400 capitalize">{task.status.toLowerCase().replace('_', ' ')}</span>
      </div>
    </div>
  );
}

