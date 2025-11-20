# 🔥 FireSwarm Project Setup - Clarifying Questions

## 1. GitHub Repository Status
**Question:** Do you already have a GitHub repository for FireSwarm, or should I help you create one?

**Options:**
- [ ] **A)** You have a repo URL ready → I'll use it in the wizard
- [ ] **B)** You want me to create a "bait" repo structure → I'll create the files (requirements.txt, docker-compose.yml) locally first
- [ ] **C)** You'll create it manually → Just give me the URL when ready

---

## 2. MVP Goal Text
**Question:** What should I use as the "MVP Goal" in the wizard? 

**My Suggestion:**
> "Autonomous Swarm for Wildfire Detection using Raspberry Pi Zero 2 W and InfiRay P2 Pro. Hybrid Edge-Cloud architecture with 4-channel YOLOv8 (RGB+Thermal). Needs SITL simulation in Gazebo with radiometric thermal physics."

**Or do you prefer:**
- [ ] **A)** Use my suggestion above
- [ ] **B)** Shorter version (you provide)
- [ ] **C)** More detailed technical version

---

## 3. Technical Directives Ingestion
**Question:** How should we handle the massive technical document you provided?

**Options:**
- [ ] **A)** Create a new UI component: "Upload Technical Docs" button in the project view
- [ ] **B)** Add a "Paste Context" textarea in the Wizard (Step 1 or Step 3)
- [ ] **C)** Manual database injection (I'll provide SQL commands)
- [ ] **D)** Create a file in the GitHub repo → System auto-reads it

**My Recommendation:** **Option A** - A dedicated "Knowledge Base" tab in the project view. This is cleaner and reusable.

---

## 4. Task Creation Strategy
**Question:** After the wizard creates the project, how should we create the initial tasks?

**Options:**
- [ ] **A)** Add a "Quick Start Tasks" button that auto-creates the 3 tasks I outlined (YOLO Surgery, Thermal Driver, Simulation Setup)
- [ ] **B)** Manual creation via existing "Create Task" button
- [ ] **C)** Parse the technical document and auto-generate tasks (advanced)

**My Recommendation:** **Option A** - A "Bootstrap Sprint" feature that creates the first 3 tasks based on the blueprint.

---

## 5. Agent Recommendations Display
**Question:** The Skill Detective will recommend `@hardware` and `@data_scientist`. Should we:

- [ ] **A)** Keep current UI (checkboxes in Step 2)
- [ ] **B)** Make recommendations more prominent (highlighted section with "Why?" tooltips)
- [ ] **C)** Auto-select recommended agents (user can deselect)

**My Recommendation:** **Option B** - Show WHY each agent was recommended (e.g., "Detected `dronekit` in requirements.txt").

---

## 6. Project View Enhancements
**Question:** What should the project detail view show beyond the Kanban board?

**Options:**
- [ ] **A)** Add a "Knowledge Base" tab (shows AGENTS_CONFIG, TECHNICAL_DIRECTIVES, etc.)
- [ ] **B)** Add a "Project Context" sidebar (quick reference to key docs)
- [ ] **C)** Keep it simple (just Kanban for now)

**My Recommendation:** **Option A** - A tabbed interface: "Tasks" | "Knowledge Base" | "Settings"

---

## 🎨 Frontend Design Choices I'm Proposing

### Choice 1: Knowledge Base Viewer Component
**Location:** New tab in project view (next to Kanban)

**Design:**
```
┌─────────────────────────────────────────┐
│ [Tasks] [Knowledge Base] [Settings]     │
├─────────────────────────────────────────┤
│ 📚 Knowledge Files                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ AGENTS_CONFIG                       │ │
│ │ ─────────────────────────────────── │ │
│ │ ## @hardware                        │ │
│ │ **Description:** Specialist in...   │ │
│ │ [Edit] [View Raw]                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ TECHNICAL_DIRECTIVES                │ │
│ │ ─────────────────────────────────── │ │
│ │ [Upload New] [Paste Text]          │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Choice 2: Enhanced Agent Recommendations
**Location:** ProjectWizard Step 2

**Design:**
```
┌─────────────────────────────────────────┐
│ 🌟 Recommended Custom Agents            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ☑ @hardware                         │ │
│ │   Detected: dronekit in repo        │ │
│ │   Why: MAVLink protocol specialist  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ☑ @data_scientist                   │ │
│ │   Detected: torch, pandas           │ │
│ │   Why: ML model training expert     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Choice 3: Bootstrap Sprint Button
**Location:** Project view (after wizard completes)

**Design:**
```
┌─────────────────────────────────────────┐
│ 🚀 FireSwarm                            │
│                                         │
│ [Bootstrap Sprint] ← Creates 3 tasks    │
│                                         │
│ This will create:                       │
│ • YOLO 4-Channel Surgery (@data_scientist)│
│ • Thermal Driver (@hardware)            │
│ • Gazebo Setup (@devops)                │
└─────────────────────────────────────────┘
```

---

## 📋 My Implementation Plan (Pending Your Answers)

1. **Enhance ProjectWizard** → Show "Why?" for recommendations
2. **Create KnowledgeBaseViewer** → New component for viewing/editing knowledge files
3. **Add BootstrapSprint** → Quick task creation from blueprint
4. **Update Project View** → Tabbed interface (Tasks | Knowledge | Settings)

**Estimated Time:** ~2-3 hours of coding

---

## ⚡ Quick Start Option

If you want to **skip the UI enhancements for now** and just get the project created:

1. I'll create a simple script that:
   - Creates the project via API
   - Injects the technical directives into the database
   - Creates the 3 initial tasks

**This takes 5 minutes vs. 2-3 hours for full UI.**

---

## 🎯 What I Need From You

Please answer:
1. **GitHub Repo:** A, B, or C?
2. **MVP Goal:** A, B, or C?
3. **Technical Docs:** A, B, C, or D?
4. **Task Creation:** A, B, or C?
5. **Agent Display:** A, B, or C?
6. **Project View:** A, B, or C?
7. **Timeline:** Full UI (2-3 hours) or Quick Script (5 min)?

---

**Once you answer, I'll implement exactly what you need!** 🚀

