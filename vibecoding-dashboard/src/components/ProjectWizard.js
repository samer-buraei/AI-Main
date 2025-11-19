/**
 * ProjectWizard Component
 * 3-Step Wizard: Input → Questions → Plan
 * Junior Dev Note: This uses a "state machine" approach - step 1, 2, or 3
 */

import React, { useState } from 'react';
import { X, Plus, ArrowRight, Check } from 'lucide-react';
import * as api from '../services/api';

export default function ProjectWizard({ onClose, onProjectCreated }) {
  const [step, setStep] = useState(1); // 1: Input, 2: Questions, 3: Plan
  const [loading, setLoading] = useState(false);

  // Data State
  const [repoUrls, setRepoUrls] = useState(['']);
  const [goals, setGoals] = useState({ mvp: '', future: '' });
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [plan, setPlan] = useState(null);
  const [scans, setScans] = useState([]);
  const [error, setError] = useState(null);
  
  // Agent and MCP Selection State
  const [selectedRecommendations, setSelectedRecommendations] = useState({ 
    agents: [], 
    mcps: [] 
  });

  // STEP 1: HANDLING INPUTS
  const handleAddRepo = () => setRepoUrls([...repoUrls, '']);

  const handleRepoChange = (index, value) => {
    const newUrls = [...repoUrls];
    newUrls[index] = value;
    setRepoUrls(newUrls);
  };

  const handleRemoveRepo = (index) => {
    const newUrls = repoUrls.filter((_, i) => i !== index);
    setRepoUrls(newUrls.length > 0 ? newUrls : ['']);
  };

  const startAnalysis = async () => {
    // Validate inputs
    const validUrls = repoUrls.filter(u => u.trim());
    if (validUrls.length === 0) {
      setError('Please add at least one GitHub repository URL');
      return;
    }
    if (!goals.mvp.trim()) {
      setError('Please provide an MVP goal');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call our new backend route
      const result = await api.analyzeProject({
        repoUrls: validUrls,
        goal: goals.mvp,
      });

      if (result.error) {
        setError(result.error.error || 'Analysis failed');
        return;
      }

      setSessionId(result.data.sessionId);
      setQuestions(result.data.questions || []);
      setScans(result.data.scans || []);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Agent Selection Handlers
  const toggleAgent = (agent) => {
    const exists = selectedRecommendations.agents.find(a => a.role === agent.role);
    if (exists) {
      setSelectedRecommendations(prev => ({
        ...prev,
        agents: prev.agents.filter(a => a.role !== agent.role)
      }));
    } else {
      setSelectedRecommendations(prev => ({
        ...prev,
        agents: [...prev.agents, agent]
      }));
    }
  };

  const toggleMCP = (mcp) => {
    const exists = selectedRecommendations.mcps.find(m => m.name === mcp.name);
    if (exists) {
      setSelectedRecommendations(prev => ({
        ...prev,
        mcps: prev.mcps.filter(m => m.name !== mcp.name)
      }));
    } else {
      setSelectedRecommendations(prev => ({
        ...prev,
        mcps: [...prev.mcps, mcp]
      }));
    }
  };

  // STEP 2: HANDLING ANSWERS
  const submitAnswers = async () => {
    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.generatePlan({
        sessionId,
        answers,
      });

      if (result.error) {
        setError(result.error.error || 'Plan generation failed');
        return;
      }

      setPlan(result.data.plan);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Plan generation failed');
      console.error('Plan generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: EXECUTE (Create Tasks)
  const executePlan = async () => {
    if (!plan) {
      setError('No plan available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, create the project with custom agents and MCPs
      const projectResult = await api.createProject({
        name: goals.mvp.substring(0, 50) || 'New Project',
        description: `MVP: ${goals.mvp}\nFuture: ${goals.future}`,
        type: 'other',
        tech_stack: {
          frontend: 'TBD',
          backend: 'TBD',
          database: 'TBD',
        },
        custom_agents: selectedRecommendations.agents, // Pass selected agents
        custom_mcps: selectedRecommendations.mcps,     // Pass selected MCPs
      });

      if (projectResult.error) {
        setError(projectResult.error.error || 'Failed to create project');
        return;
      }

      const projectId = projectResult.data.id;

      // Create all tasks from the plan
      const taskPromises = [];
      for (const phase of plan.phases) {
        for (const task of phase.tasks) {
          taskPromises.push(
            api.createTask({
              project_id: projectId,
              title: task.title,
              description: task.description,
              status: 'READY',
              assigned_to: task.assigned_to || '@backend',
            })
          );
        }
      }

      await Promise.all(taskPromises);

      // Call the callback to refresh the project list
      if (onProjectCreated) {
        onProjectCreated(projectResult.data);
      }

      // Close the wizard
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project and tasks');
      console.error('Execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  // RENDERERS
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {step === 1 && '🚀 Project Setup'}
            {step === 2 && '🤖 Architecture Interview'}
            {step === 3 && '📋 The Master Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* --- STEP 1: INPUTS --- */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Source Repositories
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Paste GitHub URLs of existing repos you want to enhance or use as a starting point
                </p>
                {repoUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      value={url}
                      onChange={(e) => handleRepoChange(idx, e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {repoUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRepo(idx)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddRepo}
                  className="text-blue-400 text-sm flex items-center gap-1 mt-2 hover:text-blue-300"
                >
                  <Plus size={14} /> Add another repo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    MVP Goal (Must Have)
                  </label>
                  <textarea
                    value={goals.mvp}
                    onChange={(e) => setGoals({ ...goals, mvp: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 h-24 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="e.g. A working clone of the UI with fake data."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Future Vision (Nice to Have)
                  </label>
                  <textarea
                    value={goals.future}
                    onChange={(e) => setGoals({ ...goals, future: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 h-24 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="e.g. Real-time auth, payments, and AI integration."
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 2: QUESTIONS + AGENT SELECTION --- */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-gray-300 mb-4">
                Based on your code, I have a few questions to structure the project correctly.
              </p>

              {scans.length > 0 && (
                <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded text-sm">
                  <p className="text-blue-300 font-medium mb-2">Repositories Scanned:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {scans.map((scan, idx) => (
                      <li key={idx}>
                        {scan.name} {scan.success ? '✓' : '✗'} ({scan.fileCount || 0} files)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {questions.map((q) => (
                <div key={q.id} className="bg-gray-800 p-4 rounded-lg">
                  <p className="font-medium mb-3 text-blue-300">{q.text}</p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer transition-colors ${
                          answers[q.id] === opt ? 'bg-gray-700' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Agent & MCP Selection Section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-purple-300">👥 Custom Team & Tools (Optional)</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Select custom agents and MCP servers to enhance your project's capabilities.
                </p>

                {/* Standard Agents */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Standard Agents (Always Available)</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {['@orchestrator', '@frontend', '@backend', '@qa', '@devops'].map(role => (
                      <div key={role} className="bg-gray-800 p-2 rounded text-gray-400">
                        {role}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Custom Agents (from plan) */}
                {plan?.recommended_agents && plan.recommended_agents.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">🌟 Recommended Custom Agents</h4>
                    <div className="space-y-2">
                      {plan.recommended_agents.map((agent, idx) => {
                        const isSelected = selectedRecommendations.agents.find(a => a.role === agent.role);
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-3 p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
                              isSelected ? 'ring-2 ring-purple-500' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => toggleAgent(agent)}
                              className="mt-1 text-purple-500 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-white">{agent.role}</div>
                              <div className="text-xs text-gray-400 mt-1">{agent.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recommended MCP Servers */}
                {plan?.recommended_mcps && plan.recommended_mcps.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">🔌 Recommended MCP Servers</h4>
                    <div className="space-y-2">
                      {plan.recommended_mcps.map((mcp, idx) => {
                        const isSelected = selectedRecommendations.mcps.find(m => m.name === mcp.name);
                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-3 p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
                              isSelected ? 'ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => toggleMCP(mcp)}
                              className="mt-1 text-blue-500 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-white">{mcp.name}</div>
                              <div className="text-xs text-gray-400 mt-1">{mcp.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Manual Agent Input (Optional) */}
                <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
                  <strong>Note:</strong> You can also add custom agents later by editing the project's knowledge files.
                </div>
              </div>
            </div>
          )}

          {/* --- STEP 3: PLAN --- */}
          {step === 3 && plan && (
            <div className="space-y-6">
              {plan.summary && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-lg mb-2">Plan Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Tasks:</span>
                      <span className="ml-2 font-bold text-white">{plan.summary.total_tasks}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Timeline:</span>
                      <span className="ml-2 font-bold text-white">{plan.summary.estimated_timeline}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Hours:</span>
                      <span className="ml-2 font-bold text-white">{plan.summary.estimated_hours}</span>
                    </div>
                  </div>
                </div>
              )}

              {plan.phases.map((phase, idx) => (
                <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 p-3 font-bold text-gray-200">
                    {phase.name} {phase.week && `(Week ${phase.week})`}
                  </div>
                  <div className="divide-y divide-gray-700">
                    {phase.tasks.map((t, tIdx) => (
                      <div key={tIdx} className="p-3 flex justify-between items-center bg-gray-900">
                        <div className="flex-1">
                          <div className="font-medium text-white">{t.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                          {t.estimated_hours && (
                            <div className="text-xs text-gray-400 mt-1">
                              ⏱️ {t.estimated_hours} hours
                            </div>
                          )}
                        </div>
                        <span className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded ml-3">
                          {t.assigned_to}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-end gap-3">
          {loading ? (
            <span className="text-gray-400 animate-pulse">Processing...</span>
          ) : (
            <>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded text-white transition-colors"
                >
                  Back
                </button>
              )}
              {step === 1 && (
                <button
                  onClick={startAnalysis}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded text-white transition-colors flex items-center gap-2"
                >
                  Analyze Repos <ArrowRight size={16} />
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={submitAnswers}
                  className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded text-white transition-colors"
                >
                  Generate Plan
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={executePlan}
                  className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded text-white font-bold transition-colors flex items-center gap-2"
                >
                  <Check size={16} /> Execute Plan
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

