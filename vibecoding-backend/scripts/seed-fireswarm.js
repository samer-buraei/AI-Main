/**
 * Seed FireSwarm Project
 * 
 * Usage: node scripts/seed-fireswarm.js
 * 
 * This script bootstraps the "FireSwarm" project based on the Master Orchestration Pack.
 * It populates:
 * 1. The Project (FireSwarm Core)
 * 2. Custom Agents (@hardware, @data_scientist, @compliance)
 * 3. Knowledge Base (Golden Library, Technical Directives)
 * 4. Initial Tasks (YOLO Surgery, Thermal Driver, Sim Setup)
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// DB Path
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// ------------------------------------------------------------------
// 1. DESIGN CHOICE: AGENT DEFINITIONS
// Extracted strictly from the provided Technical Directive to ensure alignment.
// ------------------------------------------------------------------
const CUSTOM_AGENTS = [
  {
    role: "@hardware",
    description: "Embedded Systems & Pi Zero Optimization Specialist",
    instructions: "You are the edge compute expert. Your constraint is the Raspberry Pi Zero 2 W (Quad-core Cortex-A53). 1) Do not run heavy blocking code on the main thread; use `asyncio` or multiprocessing. 2) For video, strictly use V4L2 M2M hardware encoding (v4l2h264enc). 3) For the InfiRay P2 Pro, bypass standard UVC drivers; utilize `pyusb` or direct V4L2 raw access to get 16-bit radiometric data. 4) Manage thermal throttling; separate the UPS battery from the CPU."
  },
  {
    role: "@data_scientist",
    description: "Computer Vision & Thermal ML Specialist",
    instructions: "You are the neural network architect. 1) You MUST modify YOLOv8 to accept 4 channels (RGB+Thermal). 2) Perform 'Layer Surgery' on the first Conv2d layer: initialize the 4th channel weights by averaging the RGB weights. 3) Data Handling: RGB is 0-255; Thermal is 16-bit Kelvin. Normalize thermal data using Min-Max scaling (273K to 1273K). 4) DATA AUGMENTATION RULE: Do NOT apply photometric distortions (Hue/Sat) to the thermal channel; it destroys physical ground truth."
  },
  {
    role: "@compliance",
    description: "SORA & Regulatory Officer",
    instructions: "You verify operational legality under EASA/JARUS 'Specific' category. 1) Maintain the CONOPS document. 2) Ensure OSO #06 (C3 Link Performance) is validated via `netem` simulation. 3) Verify the 'Human on the loop' protocol: the pilot must have a functional Kill Switch. 4) Risk Assessment: Verify GRC is < 700 Joules (Tello is ~87g, safe)."
  }
];

// ------------------------------------------------------------------
// 2. DESIGN CHOICE: KNOWLEDGE BASE STRUCTURING
// Splitting the massive text into logical files for the AI to digest easily.
// ------------------------------------------------------------------
const KNOWLEDGE_FILES = {
  "ARCHITECTURE_BLUEPRINT": `
# Strategic Engineering Blueprint: Autonomous Swarm

## Core Philosophy: Edge-Cloud Hybrid
- **Fast Loops (Edge):** Flight stabilization, obstacle avoidance, raw thermal ingestion. (Pi Zero 2 W)
- **Slow Loops (Cloud/Mesh):** Swarm coordination, global path planning.

## Hardware Stack
- **Compute:** Raspberry Pi Zero 2 W
- **Thermal:** InfiRay P2 Pro (USB)
- **Power:** UPS HAT with Pogo Pins (preserving GPIO)
- **Flight Controller:** ArduPilot / Tello EDU SDK

## Communication
- **Video:** WiFi/4G with SRT wrapping or raw UDP (V4L2 M2M encoding).
- **Telemetry/C2:** LoRaWAN (Binary packed via \`struct.pack\`).
  `,

  "SIMULATION_STRATEGY": `
# Digital Twin & Simulation

## Thermal Physics (Gazebo Ignition)
- **Problem:** Visual fire particles are invisible to thermal sensors.
- **Solution:** "Thermal Proxy" - Spawn invisible geometric primitives (spheres) co-located with fire particles.
- **Plugin:** \`ignition-gazebo-thermal-system\`
- **Config:** 16-bit depth, 0.01 resolution, Range: 253K to 673K.

## Dynamic Environments
- Use \`ros_gz_sim\` to programmatically spawn thermal proxies during runtime.
- Use \`netem\` (Linux Traffic Control) to inject Jitter (variance) and Burst Loss to simulate degraded 4G.
  `,

  "GOLDEN_LIBRARY_RESOURCES": `
# The Golden Library

## AI & CV
- **YOLO 4-Channel:** Ultralytics GitHub Issue #16024.
- **Driver:** PyThermalCamera (GitHub) for raw radiometric data.

## Simulation
- **Fix:** Gazebo Answers Topic 48814 (Invisible Fire).
- **Alt Sim:** Microsoft AirSim-W (Africa Build) if Gazebo fails.

## Networking
- **Chaos Tool:** Linux \`tc-netem\`.
- **Protocol:** Meshtastic Python (Protobufs/Binary packing).
  `
};

// ------------------------------------------------------------------
// 3. INITIAL TASKS
// ------------------------------------------------------------------
const INITIAL_TASKS = [
  {
    title: "Hardware: Stick of Truth",
    description: "Build the 'Stick of Truth' data collection rig. Mount P2 Pro and RGB camera rigidly. Collect synchronized dataset of fire/smoke.",
    assigned_to: "@hardware",
    status: "READY"
  },
  {
    title: "ML: YOLOv8 Layer Surgery",
    description: "Implement Python script to modify YOLOv8n.pt. Replace first layer [64, 3, 3, 3] with [64, 4, 3, 3]. Initialize 4th channel via mean of RGB weights.",
    assigned_to: "@data_scientist",
    status: "READY"
  },
  {
    title: "Sim: Gazebo Thermal Proxy",
    description: "Create SDF for 'Thermal Proxy' object. Invisible visual mesh + Thermal plugin with temp=800K. Verify visibility in simulated P2 Pro sensor.",
    assigned_to: "@devops",
    status: "READY"
  },
  {
    title: "Net: Setup Chaos Bridge",
    description: "Configure `tc-netem` on Linux bridge. Rules: Delay 100ms, Jitter 20ms (25%), Loss 1% (burst). Validation requirement for SORA OSO #06.",
    assigned_to: "@compliance",
    status: "READY"
  }
];

// ------------------------------------------------------------------
// EXECUTION
// ------------------------------------------------------------------
db.serialize(() => {
  const projectId = uuidv4();
  
  console.log(`🔥 Seeding FireSwarm Project (ID: ${projectId})...`);

  // 1. Create Project
  db.run(`
    INSERT INTO projects (id, name, description, type, tech_stack)
    VALUES (?, ?, ?, ?, ?)
  `, [
    projectId,
    "FireSwarm Core",
    "Autonomous Swarm for Wildfire Detection. Hybrid Edge-Cloud, 4-Channel YOLO, LoRaWAN.",
    "robotics",
    JSON.stringify({ backend: "Python/C++", frontend: "React", hardware: "Pi Zero 2 W" })
  ]);

  // 2. Create Workflow State
  db.run(`INSERT INTO workflow_state (id, project_id, current_phase) VALUES (?, ?, ?)`, [uuidv4(), projectId, "CONSTRUCT"]);

  // 3. Inject Custom Agents (AGENTS_CONFIG)
  const agentsContent = CUSTOM_AGENTS.map(a => 
    `## ${a.role}\n**Description:** ${a.description}\n**Instructions:** ${a.instructions}`
  ).join('\n\n---\n\n');

  db.run(`
    INSERT INTO knowledge_files (id, project_id, file_type, content, version)
    VALUES (?, ?, 'AGENTS_CONFIG', ?, 1)
  `, [uuidv4(), projectId, agentsContent]);

  // 4. Inject Knowledge Files
  Object.entries(KNOWLEDGE_FILES).forEach(([type, content]) => {
    db.run(`
      INSERT INTO knowledge_files (id, project_id, file_type, content, version)
      VALUES (?, ?, ?, ?, 1)
    `, [uuidv4(), projectId, type, content.trim()]);
  });

  // 5. Create Tasks
  INITIAL_TASKS.forEach(task => {
    db.run(`
      INSERT INTO tasks (id, project_id, title, description, status, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [uuidv4(), projectId, task.title, task.description, task.status, task.assigned_to]);
  });

  console.log("✅ FireSwarm Seeded Successfully!");
});

db.close();

