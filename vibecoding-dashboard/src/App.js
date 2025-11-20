/**
 * App Component
 * Main application component
 */

import React, { useState } from 'react';
import { useProjects } from './hooks/useProjects';
import KanbanBoard from './components/KanbanBoard';
import KnowledgeBase from './components/KnowledgeBase';
import ProjectList from './components/ProjectList';
import CreateProjectModal from './components/CreateProjectModal';
import ProjectWizard from './components/ProjectWizard';
import { Plus, Sparkles, Kanban, Book } from 'lucide-react';
import './App.css';

function App() {
  const { projects, isLoading, createProject, loadProjects } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'knowledge'

  // Auto-select first project when projects load
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  const handleProjectCreated = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setSelectedProject(newProject);
      setIsModalOpen(false);
      return newProject;
    } catch (error) {
      throw error;
    }
  };

  const handleWizardCompleted = async (project) => {
    // Reload projects to get the new one with tasks
    await loadProjects();
    if (project) {
      setSelectedProject(project);
    }
    setIsWizardOpen(false);
  };

  return (
    <div className="App flex h-screen overflow-hidden bg-gray-900">
      {/* Left Sidebar (Project List) */}
      <aside className="w-1/4 h-screen bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Vibecoding PM</h1>
          <p className="text-sm text-gray-400">Project Manager</p>
        </div>

        {isLoading ? (
          <div className="text-gray-400 text-sm">Loading projects...</div>
        ) : (
          <>
            <ProjectList
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
            />
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setIsWizardOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                aria-label="Create project with wizard"
              >
                <Sparkles size={18} />
                New Project (Wizard)
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                aria-label="Create project (quick)"
              >
                <Plus size={16} />
                Quick Create
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Main Content (Kanban Board or Knowledge Base) */}
      <main className="w-3/4 h-screen flex flex-col">
        {!isLoading && selectedProject && (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-700 px-8 pt-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'tasks'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Kanban size={18} />
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('knowledge')}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                    activeTab === 'knowledge'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Book size={18} />
                  Knowledge Base
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden p-8">
              {activeTab === 'tasks' ? (
                <KanbanBoard key={selectedProject.id} project={selectedProject} />
              ) : (
                <KnowledgeBase key={selectedProject.id} project={selectedProject} />
              )}
            </div>
          </>
        )}

        {!isLoading && !selectedProject && projects.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-2xl text-gray-500 mb-4">
                No projects found.
              </p>
              <p className="text-gray-400 mb-6">
                Click "New Project" to get started.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Project
              </button>
            </div>
          </div>
        )}

        {!isLoading && !selectedProject && projects.length > 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-400">Select a project to view tasks</p>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {/* Project Wizard */}
      {isWizardOpen && (
        <ProjectWizard
          onClose={() => setIsWizardOpen(false)}
          onProjectCreated={handleWizardCompleted}
        />
      )}
    </div>
  );
}

export default App;

