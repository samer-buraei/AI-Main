/**
 * ProjectList Component
 * Displays a list of projects in the sidebar
 */

import React from 'react';

export default function ProjectList({ projects, selectedProject, onSelectProject }) {
  if (projects.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-8">
        No projects yet. Create one to get started!
      </div>
    );
  }

  return (
    <nav aria-label="Project list">
      <ul className="space-y-2">
        {projects.map((project) => {
          const isSelected = selectedProject?.id === project.id;
          return (
            <li key={project.id}>
              <button
                onClick={() => onSelectProject(project)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-pressed={isSelected}
                aria-label={`Select project ${project.name}`}
              >
                <h3 className="text-lg font-medium">{project.name}</h3>
                {project.type && (
                  <p className="text-sm opacity-75 mt-1">{project.type}</p>
                )}
                {project.description && (
                  <p className="text-xs opacity-60 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

