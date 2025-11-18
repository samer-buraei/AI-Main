/**
 * CreateProjectModal Component
 * Modal form for creating a new project
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreateProjectModal({ onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'tinder-clone',
    tech_stack: {
      frontend: 'React',
      backend: 'Express',
      database: 'SQLite',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newProject = await onProjectCreated(formData);
      // Modal will be closed by parent component
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTechStackChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      tech_stack: {
        ...prev.tech_stack,
        [name]: value,
      },
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-white">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Tinder Clone"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief description of the project..."
            />
          </div>

          {/* Project Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
              Project Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tinder-clone">Tinder Clone</option>
              <option value="classifieds-base">Classifieds (Base)</option>
              <option value="classifieds-cars">Classifieds (Cars)</option>
              <option value="fire-drones">Fire Drones</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tech Stack
            </label>
            <div className="space-y-2">
              <div>
                <label htmlFor="frontend" className="block text-xs text-gray-400 mb-1">
                  Frontend
                </label>
                <input
                  type="text"
                  id="frontend"
                  name="frontend"
                  value={formData.tech_stack.frontend}
                  onChange={handleTechStackChange}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="backend" className="block text-xs text-gray-400 mb-1">
                  Backend
                </label>
                <input
                  type="text"
                  id="backend"
                  name="backend"
                  value={formData.tech_stack.backend}
                  onChange={handleTechStackChange}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="database" className="block text-xs text-gray-400 mb-1">
                  Database
                </label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  value={formData.tech_stack.database}
                  onChange={handleTechStackChange}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

