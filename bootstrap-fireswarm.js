/**
 * FireSwarm Bootstrap Script
 * This script simulates the user flow through the Project Wizard to create the FireSwarm project.
 * 
 * Flow:
 * 1. Analyzer -> Detects tech stack from repos
 * 2. Create Project -> Saves project + custom agents (Skill Detective results)
 * 3. Bootstrap Sprint -> Creates initial tasks + knowledge docs
 */

const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

// 1. Configuration
const REPOS = [
  'https://github.com/damiafuentes/DJITelloPy',
  'https://github.com/leswright1977/PyThermalCamera',
  'https://github.com/bluenviron/mediamtx'
];

const GOAL = "Develop 'Villa Shield': An autonomous 3-drone swarm for wildfire protection of private EU estates. Hardware: Custom 7-inch frames with Raspberry Pi Zero 2 W + InfiRay P2 Pro (Radiometric). Core Tech: Hybrid Edge-Cloud architecture. Edge node performs radiometric gating (>150°C) and h.264 streaming (MediaMTX). Ground server runs 4-channel YOLOv11 (RGB+Thermal) fusion model. Comms: Primary 4G/LTE (ZeroTier VPN) with automatic failover to LoRa Mesh (Meshtastic) for 'Fire Alert' C2 packets. Validation: Phase 0 relies on 'Digital Twin' simulation in Gazebo Garden + ArduPilot SITL to prove swarm behavior and regulatory compliance (SORA/PDRA) before hardware deployment.";

const CUSTOM_AGENTS = [
  {
    role: "@hardware",
    description: "Specialist in MAVLink protocol, hardware interfaces, USB/I2C communication, and real-time constraints.",
    instructions: "Always check battery failsafes. Use 'dronekit' for Python control logic. For USB thermal cameras, handle NUC (Non-Uniformity Correction) freeze periods. Do not run heavy blocking code on the main thread."
  },
  {
    role: "@data_scientist",
    description: "Specialist in Python data analysis, ML models, and computer vision.",
    instructions: "Focus on vectorization and efficient data processing. For YOLO models, handle 4-channel input (RGB+Thermal) carefully. Use pandas/numpy conventions."
  },
  {
    role: "@sora_compliance",
    description: "Specialist in EASA regulations, SORA compliance, and BVLOS operations.",
    instructions: "Always check flight paths against EASA regulations. Ensure geofence buffers (150m from public roads for Open Category A3). Validate SORA requirements before deployment."
  }
];

const CUSTOM_MCPS = [
  {
    name: "Docker MCP",
    description: "Containerization detected. Allows the AI to spin up/down containers for testing.",
    package: "@modelcontextprotocol/server-docker"
  }
];

async function run() {
  console.log('🚀 Starting FireSwarm Bootstrap...\n');

  try {
    // Step 1: Create Project
    console.log('1. Creating Project "FireSwarm: Villa Shield"...');
    const projectRes = await axios.post(`${API_URL}/projects`, {
      name: "FireSwarm: Villa Shield",
      description: "Autonomous 3-drone swarm for wildfire protection using Pi Zero 2 W + Thermal AI.",
      type: "fire-drones",
      tech_stack: {
        frontend: "React",
        backend: "Python/Node",
        database: "SQLite"
      },
      custom_agents: CUSTOM_AGENTS,
      custom_mcps: CUSTOM_MCPS
    });

    const projectId = projectRes.data.id;
    console.log(`   ✅ Project created! ID: ${projectId}`);

    // Step 2: Run Bootstrap Sprint
    console.log('\n2. Executing Bootstrap Sprint (Creating Tasks & Docs)...');
    const bootstrapRes = await axios.post(`${API_URL}/orchestrator/bootstrap`, {
      projectId: projectId,
      sprintType: 'fireswarm_phase0'
    });

    console.log(`   ✅ Success! Created:`);
    console.log(`      - ${bootstrapRes.data.tasks.length} Tasks (Sim_Setup, Data_Rig, AI_Baseline)`);
    console.log(`      - ${bootstrapRes.data.knowledgeDocs.length} Knowledge Docs (Strategy, Technical Directives, etc.)`);
    console.log(`      - ${bootstrapRes.data.agents.length} Custom Agents Connected`);

    console.log('\n🎉 DONE! Refresh your dashboard to see the project.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

run();

