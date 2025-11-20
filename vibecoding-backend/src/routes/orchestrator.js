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

    // 4. SKILL DETECTIVE: Regex-Based Pattern Matching 🕵️‍♂️
    const recommendations = {
      agents: [],
      mcps: []
    };

    // Combine all file contents and config for pattern matching
    const combinedConfig = scans
      .filter(s => s.success && s.config)
      .map(s => s.config)
      .join('\n');
    
    const allFileContents = combinedConfig + ' ' + allFiles.join(' ') + ' ' + goal;

    // Regex Patterns (as provided by user)
    const PATTERNS = {
      hardware: [
        /libusb/i,
        /pythermalcamera/i,
        /dronekit/i,
        /mavlink/i,
        /ardupilot/i,
        /rpi\.gpio/i
      ],
      data_scientist: [
        /yolo/i,
        /ultralytics/i,
        /pytorch/i,
        /tensorrt/i,
        /numpy/i,
        /pandas/i
      ],
      devops: [
        /mediamtx/i,
        /gstreamer/i,
        /docker-compose/i,
        /prometheus/i,
        /grafana/i
      ],
      sora_compliance: [
        /bvlos/i,
        /easa/i,
        /sora/i,
        /jarus/i,
        /risk assessment/i
      ]
    };

    // Detect Hardware
    if (PATTERNS.hardware.some(regex => regex.test(allFileContents))) {
      const matchedPatterns = PATTERNS.hardware.filter(regex => regex.test(allFileContents));
      const reasons = matchedPatterns.map(regex => {
        const match = allFileContents.match(regex);
        return match ? `Found '${match[0]}'` : '';
      }).filter(r => r).join(', ');
      
      recommendations.agents.push({
        role: "@hardware",
        description: "Specialist in MAVLink protocol, hardware interfaces, USB/I2C communication, and real-time constraints.",
        instructions: "Always check battery failsafes. Use 'dronekit' for Python control logic. For USB thermal cameras, handle NUC (Non-Uniformity Correction) freeze periods. Do not run heavy blocking code on the main thread.",
        why: reasons ? `Detected hardware interfaces (${reasons}). Essential for drone control.` : "Detected hardware interfaces (MAVLink/GPIO/USB). Essential for drone control."
      });
    }

    // Detect Data Scientist
    if (PATTERNS.data_scientist.some(regex => regex.test(allFileContents))) {
      const matchedPatterns = PATTERNS.data_scientist.filter(regex => regex.test(allFileContents));
      const reasons = matchedPatterns.map(regex => {
        const match = allFileContents.match(regex);
        return match ? `Found '${match[0]}'` : '';
      }).filter(r => r).join(', ');
      
      recommendations.agents.push({
        role: "@data_scientist",
        description: "Specialist in Python data analysis, ML models, and computer vision.",
        instructions: "Focus on vectorization and efficient data processing. For YOLO models, handle 4-channel input (RGB+Thermal) carefully. Use pandas/numpy conventions.",
        why: reasons ? `Detected ML/CV libraries (${reasons}). Needs PyTorch/CUDA expertise.` : "Detected YOLO → Needs PyTorch/CUDA expertise"
      });
    }

    // Detect DevOps
    if (PATTERNS.devops.some(regex => regex.test(allFileContents))) {
      const matchedPatterns = PATTERNS.devops.filter(regex => regex.test(allFileContents));
      const reasons = matchedPatterns.map(regex => {
        const match = allFileContents.match(regex);
        return match ? `Found '${match[0]}'` : '';
      }).filter(r => r).join(', ');
      
      recommendations.mcps.push({
        name: "Docker MCP",
        reason: reasons ? `Detected infrastructure tools (${reasons}). Needs Docker/Network expertise.` : "Detected mediamtx → Needs Docker/Network expertise",
        installCommand: "npx -y @modelcontextprotocol/server-docker"
      });
    }

    // Detect SORA Compliance (Special Logic for FireSwarm)
    if (PATTERNS.sora_compliance.some(regex => regex.test(allFileContents))) {
      const matchedPatterns = PATTERNS.sora_compliance.filter(regex => regex.test(allFileContents));
      const reasons = matchedPatterns.map(regex => {
        const match = allFileContents.match(regex);
        return match ? `Found '${match[0]}'` : '';
      }).filter(r => r).join(', ');
      
      recommendations.agents.push({
        role: "@sora_compliance",
        description: "Specialist in EASA regulations, SORA compliance, and BVLOS operations.",
        instructions: "Always check flight paths against EASA regulations. Ensure geofence buffers (150m from public roads for Open Category A3). Validate SORA requirements before deployment.",
        why: reasons ? `Detected BVLOS/Regulatory terms (${reasons}). Required for EU flight authorization.` : "Detected BVLOS/Regulatory terms. Required for EU flight authorization."
      });
    }

    // Detect Database (keep existing logic)
    if (allFiles.includes('schema.prisma') || combinedConfig.includes('postgres') || combinedConfig.includes('sqlalchemy')) {
      recommendations.mcps.push({
        name: "PostgreSQL MCP",
        reason: "Database detected. This tool allows the AI to query your live DB to write better SQL.",
        installCommand: "npx -y @modelcontextprotocol/server-postgres"
      });
    }

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
      recommendations, // <--- SEND THIS TO FRONTEND
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

/**
 * BOOTSTRAP SPRINT: Create initial tasks for a project
 * POST /api/orchestrator/bootstrap
 * 
 * Input: { projectId: string, sprintType?: string }
 * Output: { tasks: array, agents: array }
 */
router.post('/bootstrap', async (req, res) => {
  try {
    const { projectId, sprintType = 'fireswarm_phase0' } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const db = getDatabase();

    // Verify project exists
    db.get('SELECT * FROM projects WHERE id = ?', [projectId], async (err, project) => {
      if (err) {
        logger.error('Error fetching project for bootstrap', { error: err.message });
        return res.status(500).json({ error: 'Failed to fetch project' });
      }

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Define bootstrap tasks based on sprint type
      let bootstrapTasks = [];
      
      if (sprintType === 'fireswarm_phase0') {
        bootstrapTasks = [
          {
            title: 'Sim_Setup: Dockerize ArduPilot SITL + Gazebo Garden',
            description: 'Create Docker container for ArduPilot SITL and Gazebo Garden simulation environment. Must support multi-drone instances with unique SYSID_THISMAV. Include thermal sensor plugin configuration.',
            assigned_to: '@devops',
            status: 'READY',
            priority: 'HIGH'
          },
          {
            title: 'Data_Rig: "Stick of Truth" Capture Script',
            description: 'Build RGB+Thermal synchronized capture script for Raspberry Pi Zero 2 W. Must handle InfiRay P2 Pro NUC freeze periods (~1s every 30s). Output: Paired image files (RGB JPG + Thermal NPY) with timestamps.',
            assigned_to: '@hardware',
            status: 'READY',
            priority: 'HIGH'
          },
          {
            title: 'AI_Baseline: Train YOLOv11n on FLAME-3 Dataset',
            description: 'Implement 4-channel YOLOv11n (RGB+Thermal) layer surgery. Train on FLAME-3 wildfire dataset. Target: >85% mAP@0.5 for fire detection. Must handle thermal normalization (273K-1273K range).',
            assigned_to: '@data_scientist',
            status: 'READY',
            priority: 'HIGH'
          }
        ];
      } else {
        // Generic bootstrap (fallback)
        bootstrapTasks = [
          {
            title: 'Initialize Project Structure',
            description: 'Set up basic project structure and configuration files.',
            assigned_to: '@devops',
            status: 'READY',
            priority: 'MEDIUM'
          },
          {
            title: 'Create Initial Documentation',
            description: 'Write README and basic project documentation.',
            assigned_to: '@backend',
            status: 'READY',
            priority: 'LOW'
          }
        ];
      }

      // Create tasks in database
      const createdTasks = [];
      const { v4: uuidv4 } = require('uuid');

      for (const task of bootstrapTasks) {
        const taskId = uuidv4();
        db.run(
          `INSERT INTO tasks (id, project_id, title, description, status, assigned_to, priority, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [taskId, projectId, task.title, task.description, task.status, task.assigned_to, task.priority],
          function(err) {
            if (err) {
              logger.error('Error creating bootstrap task', { error: err.message, task: task.title });
            } else {
              createdTasks.push({ id: taskId, ...task });
            }
          }
        );
      }

      // Insert 5 pre-written knowledge docs into knowledge_docs table
      const knowledgeDocs = [
        {
          title: 'Executive Technical Strategy',
          content_md: `# Strategic Engineering Blueprint: Autonomous Swarm Architecture for Wildfire Detection & Mitigation

## 1. Executive Technical Strategy

The deployment of autonomous Unmanned Aerial Systems (UAS) for wildfire detection represents a convergence of edge computing, distributed sensor networks, and advanced simulation environments.

**Key Technical Pillars:**
- High-fidelity "Digital Twin" simulation environment
- Resource-constrained edge perception node
- Low-latency data transport pipeline
- Decentralized command and control (C2) logic

**Architectural Philosophy:** Edge-Cloud Hybrid
- Fast loops (flight stabilization, obstacle avoidance) → Edge
- Slow loops (swarm coordination, path planning) → Cloud/Mesh`,
          tags: 'strategy,architecture,overview'
        },
        {
          title: 'Technical Directive: System Orchestration',
          content_md: `# Technical Directive: Orchestration of Autonomous Multi-Modal Drone Swarm Systems

## Deep Learning Architecture: 4-Channel YOLOv8 Adaptation

The core perception engine requires YOLOv8 adapted for 4-channel input (RGB + Thermal).

**Key Requirements:**
- Layer surgery to modify input stem from 3 to 4 channels
- Weight transplantation from COCO pre-trained weights
- Custom dataloader for radiometric thermal data
- Training protocol with warm-up epochs

## Simulation Environment

**Gazebo Ignition Configuration:**
- Thermal sensor plugin with 16-bit resolution
- Thermal Proxy technique for fire simulation
- Dynamic environment with programmatic object spawning
- MAVLink integration for SITL`,
          tags: 'technical,ai,simulation,yolo'
        },
        {
          title: 'Golden Library: Research Resources',
          content_md: `# Golden Library: Essential Research Resources

## A. AI & Computer Vision Stack

**YOLO 4-Channel Modification:**
- Resource: Ultralytics GitHub Issue #16024
- Contains exact Python snippet for layer surgery

**InfiRay P2 Pro Linux Driver:**
- Resource: PyThermalCamera (GitHub)
- Reverse-engineered USB protocol for raw radiometric data

## B. Simulation & Synthetic Data

**Gazebo "Invisible Fire" Fix:**
- Use geometric shapes with thermal plugin
- Set temperature attribute in physics engine

## C. Swarm & Communications

**Network Emulation:**
- Linux tc-netem for jitter/latency simulation
- Meshtastic Python API for LoRa binary packets

## D. Regulatory (SORA Path)

**JARUS SORA Template:**
- EASA/JARUS Guidelines
- ConOps (Concept of Operations) document
- Open Category A3 (150m geofence buffer)`,
          tags: 'research,resources,references'
        },
        {
          title: 'Hardware Architecture: Edge Node',
          content_md: `# Onboard Hardware Architecture: The Edge Node

## Core Processing Unit
- **Raspberry Pi Zero 2 W**: Quad-core 64-bit ARM Cortex-A53
- Enables multi-threaded operations (video encoding + flight control)

## Thermal Imaging Integration
- **InfiRay P2 Pro**: USB UVC device
- Requires custom driver to bypass standard webcam drivers
- Extract raw 16-bit YUV data for radiometric analysis
- Handle NUC (Non-Uniformity Correction) freeze periods (~1s every 30s)

## Power Management
- **UPS HAT**: Pogo pin architecture (preserves GPIO header)
- I2C telemetry for battery monitoring
- Real-Time Clock (RTC) for accurate timestamps

## Mechanical Engineering
- PETG/ABS casing (not PLA - low glass transition temp)
- "Saddle" mount design
- Active cooling via prop wash alignment`,
          tags: 'hardware,raspberry-pi,thermal,power'
        },
        {
          title: 'Regulatory Compliance: SORA Framework',
          content_md: `# Regulatory Compliance: SORA Framework

## EASA Open Category A3

**Strategy:** Operate under "Open" Category A3 (Far from people) by enforcing a geofence buffer of 150m from public roads.

**Benefits:**
- Avoids complex "Specific" category SORA process for MVP
- Faster approval timeline
- Suitable for private villa security use case

## Ground Risk Class (GRC)
- DJI Tello EDU: ~87g
- Terminal kinetic energy well below 700 Joule threshold
- Intrinsic Ground Risk: GRC 1 or 2

## Air Risk Class (ARC)
- Wildfire operations: Restricted/uncontrolled airspace (Class G)
- Low altitude (<400ft AGL)
- Classification: ARC-b (Low risk of encounter)

## Operational Safety Objectives (OSOs)
- **OSO #05**: Safe Design (YOLOv8 modifications)
- **OSO #06**: C3 Link Performance (Network emulation testing)
- **OSO #07**: Inspection (Pre-flight checks)`,
          tags: 'regulatory,sora,easa,compliance'
        }
      ];

      // Insert knowledge docs
      const createdDocs = [];
      for (const doc of knowledgeDocs) {
        const docId = uuidv4();
        db.run(
          `INSERT INTO knowledge_docs (id, project_id, title, content_md, tags, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [docId, projectId, doc.title, doc.content_md, doc.tags],
          function(err) {
            if (err) {
              logger.error('Error creating knowledge doc', { error: err.message, title: doc.title });
            } else {
              createdDocs.push({ id: docId, ...doc });
            }
          }
        );
      }

      // Get recommended agents from knowledge files
      const recommendedAgents = [];
      db.all(
        `SELECT content FROM knowledge_files WHERE project_id = ? AND file_type = 'AGENTS_CONFIG'`,
        [projectId],
        (err, rows) => {
          if (!err && rows.length > 0) {
            // Parse agents from AGENTS_CONFIG
            const content = rows[0].content;
            const agentMatches = content.match(/## (@\w+)/g);
            if (agentMatches) {
              recommendedAgents.push(...agentMatches.map(m => m.replace('## ', '')));
            }
          }

          logger.info('Bootstrap sprint created', { 
            projectId, 
            taskCount: bootstrapTasks.length,
            docCount: knowledgeDocs.length,
            agents: recommendedAgents 
          });

          res.json({
            success: true,
            message: `Bootstrap sprint created: ${bootstrapTasks.length} tasks and ${knowledgeDocs.length} knowledge docs`,
            tasks: createdTasks,
            knowledgeDocs: createdDocs,
            agents: recommendedAgents
          });
        }
      );
    });

  } catch (error) {
    logger.error('Error in bootstrap endpoint', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

