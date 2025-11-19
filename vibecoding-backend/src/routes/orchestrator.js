/**
 * Orchestrator Routes
 * Handles the 3-step wizard: Analyze → Questions → Plan
 * Junior Dev Note: We use "mock" AI logic here so you can test without paying for API credits
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');

// Import the lazy scanner tool
// Note: We need to go up directories to reach the MCP server
const path = require('path');
const fetchRepoMetadata = require(path.join(__dirname, '../../../vibecoding-mcp-server/src/tools/fetchRepoMetadata'));

/**
 * STEP 1: ANALYZE
 * POST /api/orchestrator/analyze
 * 
 * Input: { repoUrls: string[], goal: string }
 * Output: { sessionId: string, questions: array, scans: array }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { repoUrls, goal, projectId } = req.body;

    // Validate input
    if (!repoUrls || !Array.isArray(repoUrls) || repoUrls.length === 0) {
      return res.status(400).json({ error: 'repoUrls array is required' });
    }
    if (!goal || goal.trim() === '') {
      return res.status(400).json({ error: 'goal is required' });
    }

    const sessionId = uuidv4();
    const db = getDatabase();

    logger.info('Starting repository analysis', { sessionId, repoCount: repoUrls.length });

    // 1. Run the scanner on ALL repos (in parallel for speed)
    const scans = await Promise.all(
      repoUrls.map(url => fetchRepoMetadata(url.trim()))
    );

    // Check if any scans failed
    const failedScans = scans.filter(s => !s.success);
    if (failedScans.length > 0) {
      logger.warn('Some repository scans failed', { failedScans });
      // Continue anyway, but log the failures
    }

    // 2. MOCK AI LOGIC (Replace this with real LLM later)
    // We look at the scan results and "pretend" to be smart
    const questions = [];

    // Combine all files from all repos
    const allFiles = scans
      .filter(s => s.success && s.files)
      .map(s => s.files)
      .flat();

    // Question 1: Framework detection
    if (allFiles.includes('package.json')) {
      questions.push({
        id: 'q_framework',
        text: 'I see a Node.js project. Which frontend framework should we stick with?',
        options: ['React', 'Vue', 'Angular', 'None (Backend Only)']
      });
    }

    if (allFiles.includes('requirements.txt') || allFiles.includes('pyproject.toml')) {
      questions.push({
        id: 'q_python',
        text: 'I see a Python project. What framework are you using?',
        options: ['Django', 'Flask', 'FastAPI', 'Other']
      });
    }

    // Question 2: Multi-repo integration
    if (scans.length > 1) {
      questions.push({
        id: 'q_integration',
        text: 'You provided multiple repos. How should they connect?',
        options: [
          'Repo A calls Repo B (API integration)',
          'Merge them into one monorepo',
          'Keep separate (independent services)'
        ]
      });
    }

    // Question 3: Always ask about the user's goal
    questions.push({
      id: 'q_scope',
      text: `For your goal: "${goal.substring(0, 50)}${goal.length > 50 ? '...' : ''}", what is the MVP priority?`,
      options: [
        'Speed (Quick Prototype)',
        'Scalability (Production Ready)',
        'Learning (Educational Project)'
      ]
    });

    // Question 4: Tech stack preferences
    questions.push({
      id: 'q_tech',
      text: 'What is your preferred approach?',
      options: [
        'Use existing tech stack from repos',
        'Modernize with latest versions',
        'Mix of both'
      ]
    });

    // Store session in database
    const repoMetadata = JSON.stringify(scans);
    db.run(
      `INSERT INTO orchestration_sessions 
       (id, project_id, status, github_url, repo_metadata) 
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, projectId || null, 'waiting_for_user', repoUrls[0], repoMetadata],
      (err) => {
        if (err) {
          logger.error('Error saving orchestration session', { error: err.message });
          // Continue anyway - don't fail the request
        }
      }
    );

    logger.info('Analysis complete', { sessionId, questionsGenerated: questions.length });

    res.json({
      success: true,
      sessionId,
      questions,
      scans: scans.map(s => ({
        name: s.name,
        success: s.success,
        fileCount: s.files?.length || 0,
        hasConfig: !!s.configFileName
      }))
    });

  } catch (error) {
    logger.error('Error in analyze endpoint', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

/**
 * STEP 2: GENERATE PLAN
 * POST /api/orchestrator/plan
 * 
 * Input: { sessionId: string, answers: object }
 * Output: { plan: object }
 */
router.post('/plan', async (req, res) => {
  try {
    const { sessionId, answers } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers object is required' });
    }

    const db = getDatabase();

    // Get session data
    db.get(
      `SELECT * FROM orchestration_sessions WHERE id = ?`,
      [sessionId],
      async (err, session) => {
        if (err) {
          logger.error('Error fetching session', { error: err.message });
          return res.status(500).json({ error: 'Failed to fetch session' });
        }

        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        // MOCK PLAN GENERATION
        // In real implementation, this would call AI service
        const plan = {
          phases: [
            {
              name: 'Phase 1: Setup & Infrastructure',
              week: 1,
              tasks: [
                {
                  id: 'pending-001',
                  title: 'Initialize Repository Structure',
                  description: 'Clone and setup base project structure with proper folder organization',
                  assigned_to: '@devops',
                  estimated_hours: 2
                },
                {
                  id: 'pending-002',
                  title: 'Configure Environment Variables',
                  description: 'Setup .env files and secrets management',
                  assigned_to: '@backend',
                  estimated_hours: 1
                },
                {
                  id: 'pending-003',
                  title: 'Install Dependencies',
                  description: 'Run npm install / pip install based on detected package manager',
                  assigned_to: '@backend',
                  estimated_hours: 1
                }
              ]
            },
            {
              name: 'Phase 2: Core Features',
              week: 2,
              tasks: [
                {
                  id: 'pending-004',
                  title: 'Migrate Core Logic',
                  description: 'Port existing logic from repos based on user answers',
                  assigned_to: '@backend',
                  estimated_hours: 8
                },
                {
                  id: 'pending-005',
                  title: 'Build UI Shell',
                  description: 'Setup basic layout and navigation structure',
                  assigned_to: '@frontend',
                  estimated_hours: 6
                },
                {
                  id: 'pending-006',
                  title: 'Implement API Endpoints',
                  description: 'Create REST API endpoints based on requirements',
                  assigned_to: '@backend',
                  estimated_hours: 6
                }
              ]
            },
            {
              name: 'Phase 3: Integration & Testing',
              week: 3,
              tasks: [
                {
                  id: 'pending-007',
                  title: 'Connect Frontend to Backend',
                  description: 'Integrate API calls and handle responses',
                  assigned_to: '@frontend',
                  estimated_hours: 4
                },
                {
                  id: 'pending-008',
                  title: 'Write Unit Tests',
                  description: 'Add test coverage for critical functions',
                  assigned_to: '@qa',
                  estimated_hours: 4
                },
                {
                  id: 'pending-009',
                  title: 'End-to-End Testing',
                  description: 'Test complete user flows',
                  assigned_to: '@qa',
                  estimated_hours: 3
                }
              ]
            }
          ],
          summary: {
            total_tasks: 9,
            by_agent: {
              '@backend': 4,
              '@frontend': 2,
              '@devops': 1,
              '@qa': 2
            },
            estimated_timeline: '3 weeks',
            estimated_hours: 35
          }
        };

        // Store plan in database
        const qaHistory = JSON.stringify({ answers, submittedAt: new Date().toISOString() });
        const finalPlan = JSON.stringify(plan);

        db.run(
          `UPDATE orchestration_sessions 
           SET status = 'planning_complete',
               qa_history = ?,
               final_plan = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [qaHistory, finalPlan, sessionId],
          (err) => {
            if (err) {
              logger.error('Error updating session with plan', { error: err.message });
              // Continue anyway
            }
          }
        );

        logger.info('Plan generated', { sessionId, taskCount: plan.summary.total_tasks });

        res.json({
          success: true,
          plan
        });
      }
    );

  } catch (error) {
    logger.error('Error in plan endpoint', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orchestrator/:sessionId/status
 * Get current status of orchestration session
 */
router.get('/:sessionId/status', (req, res) => {
  try {
    const { sessionId } = req.params;
    const db = getDatabase();

    db.get(
      `SELECT * FROM orchestration_sessions WHERE id = ?`,
      [sessionId],
      (err, session) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.json({
          sessionId: session.id,
          status: session.status,
          repoMetadata: session.repo_metadata ? JSON.parse(session.repo_metadata) : null,
          analysis: session.analysis_json ? JSON.parse(session.analysis_json) : null,
          questions: session.qa_history ? JSON.parse(session.qa_history).questions : null,
          plan: session.final_plan ? JSON.parse(session.final_plan) : null
        });
      }
    );
  } catch (error) {
    logger.error('Error getting session status', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

