# 🚀 Go Live Verification Checklist

**Date:** November 19, 2025  
**Status:** Pre-Launch Testing Guide

---

## ✅ Pre-Flight Checks

### 1. Database Migration Verification

**Action:**
```bash
cd vibecoding-backend
npm start
```

**Expected Console Output:**
```
✅ Connected to SQLite database
✅ Database schema initialized successfully
✅ Knowledge docs table ready
✅ Vibecoding Backend API is running on port 4000
```

**If you see errors:**
- Check that `database.js` has the `knowledge_docs` table definition
- Verify SQLite file exists: `vibecoding-backend/vibecoding.db`
- Check file permissions

**Manual Verification (Optional):**
```bash
# If you have sqlite3 CLI installed
sqlite3 vibecoding-backend/vibecoding.db
.tables
# Should show: knowledge_docs
.schema knowledge_docs
# Should show the CREATE TABLE statement
```

---

### 2. Frontend Component Verification

**Action:**
```bash
cd vibecoding-dashboard
npm start
```

**Expected:**
- Dashboard loads at `http://localhost:3000`
- No console errors in browser DevTools (F12)
- "New Project (Wizard)" button is visible

**Check Browser Console:**
- Open DevTools (F12) → Console tab
- Should see no red errors
- Warnings are OK (e.g., React dev warnings)

---

## 🧪 Testing Flow

### Test 1: Skill Detective (Regex Patterns)

**Step 1: Open Wizard**
1. Click **"New Project (Wizard)"** button
2. You should see Step 1: "🚀 Project Setup"

**Step 2: Enter Repo URLs**
Paste these 3 URLs (one per field):
```
https://github.com/damiafuentes/DJITelloPy
https://github.com/leswright1977/PyThermalCamera
https://github.com/bluenviron/mediamtx
```

**Step 3: Enter MVP Goal**
Paste your FireSwarm MVP text:
```
Develop 'Villa Shield': An autonomous 3-drone swarm for wildfire protection of private EU estates. Hardware: Custom 7-inch frames with Raspberry Pi Zero 2 W + InfiRay P2 Pro (Radiometric). Core Tech: Hybrid Edge-Cloud architecture. Edge node performs radiometric gating (>150°C) and h.264 streaming (MediaMTX). Ground server runs 4-channel YOLOv11 (RGB+Thermal) fusion model. Comms: Primary 4G/LTE (ZeroTier VPN) with automatic failover to LoRa Mesh (Meshtastic) for 'Fire Alert' C2 packets. Validation: Phase 0 relies on 'Digital Twin' simulation in Gazebo Garden + ArduPilot SITL to prove swarm behavior and regulatory compliance (SORA/PDRA) before hardware deployment.
```

**Step 4: Click "Analyze Repos"**
- Should see "Processing..." spinner
- Wait 5-10 seconds (GitHub API calls)
- Should advance to Step 2: "🤖 Architecture Interview"

**Step 5: Verify Skill Detective Results**

**Expected Recommendations:**

✅ **@hardware** (Should be recommended)
- **Why:** Should show: "Detected hardware interfaces (Found 'libusb', Found 'dronekit')" or similar
- **Description:** "Specialist in MAVLink protocol, hardware interfaces..."

✅ **@data_scientist** (Should be recommended)
- **Why:** Should show: "Detected ML/CV libraries (Found 'yolo')" or similar
- **Description:** "Specialist in Python data analysis, ML models..."

✅ **@sora_compliance** (Should be recommended)
- **Why:** Should show: "Detected BVLOS/Regulatory terms (Found 'bvlos', Found 'easa')" or similar
- **Description:** "Specialist in EASA regulations, SORA compliance..."

✅ **Docker MCP** (Should be recommended)
- **Why:** Should show: "Detected infrastructure tools (Found 'mediamtx')" or similar

**If recommendations are missing:**
- Check browser console for API errors
- Check backend console for errors
- Verify GitHub API is accessible (no rate limiting)

---

### Test 2: Complete Wizard & Create Project

**Step 1: Select All Recommended Agents**
- Check all boxes for recommended agents
- Check all boxes for recommended MCPs

**Step 2: Answer Questions**
- Answer any questions that appear
- Click "Generate Plan"

**Step 3: Review Plan**
- Should see a plan with phases and tasks
- Click "🚀 Execute Plan"

**Step 4: Verify Project Created**
- Should see project in the project list
- Project should be selected automatically
- Kanban board should be empty (no tasks yet)

---

### Test 3: Bootstrap Sprint "Explosion"

**Step 1: Find Bootstrap Button**
- On the empty Kanban board
- Should see a **purple gradient hero card** with:
  - 🚀 Bootstrap Sprint title
  - List of 3 tasks that will be created
  - "Create Bootstrap Sprint" button

**Step 2: Click "Create Bootstrap Sprint"**
- Button should show "Creating Sprint..." (disabled)
- Wait 2-3 seconds

**Step 3: Verify Tasks Created**
- Kanban board should refresh (or refresh manually)
- **"Ready" column** should show 3 tasks:
  1. Sim_Setup: Dockerize ArduPilot SITL + Gazebo Garden
  2. Data_Rig: "Stick of Truth" Capture Script
  3. AI_Baseline: Train YOLOv11n on FLAME-3 Dataset

**Step 4: Verify Knowledge Docs Created**
- Click **"Knowledge Base"** tab (top navigation)
- Click **"Technical Docs"** sub-tab
- Should see **5 documents**:
  1. Executive Technical Strategy
  2. Technical Directive: System Orchestration
  3. Golden Library: Research Resources
  4. Hardware Architecture: Edge Node
  5. Regulatory Compliance: SORA Framework

**Step 5: Test Knowledge Doc Viewer**
- Click on "Executive Technical Strategy"
- Right pane should show the markdown content
- Should see headings, text, and formatting

**Step 6: Test Knowledge Doc Editor**
- Click the **Edit** button (pencil icon)
- Make a small change to the content
- Click **"Save Changes"**
- Should see "✅ Saved successfully!" alert
- Content should persist after refresh

---

## 🐛 Troubleshooting

### Issue: "knowledge_docs table doesn't exist"

**Solution:**
1. Stop backend server (Ctrl+C)
2. Delete `vibecoding-backend/vibecoding.db` (optional - forces recreation)
3. Restart backend: `npm start`
4. Check console for "Knowledge docs table ready"

---

### Issue: "Skill Detective not recommending agents"

**Check:**
1. Browser console → Network tab → Check `/api/orchestrator/analyze` request
2. Look at response JSON → Should have `recommendations.agents` array
3. Backend console → Check for regex matching logs

**Debug:**
- Open `orchestrator.js` → Check PATTERNS object exists
- Verify regex patterns are correct
- Check that `allFileContents` includes goal text

---

### Issue: "Bootstrap Sprint creates tasks but not knowledge docs"

**Check:**
1. Backend console → Look for "Error creating knowledge doc" messages
2. Database → Check `knowledge_docs` table:
   ```sql
   SELECT * FROM knowledge_docs WHERE project_id = '<your-project-id>';
   ```

**Solution:**
- Verify `knowledge_docs` table exists
- Check foreign key constraint (project must exist)
- Verify INSERT statement in bootstrap endpoint

---

### Issue: "Knowledge Base tab shows empty"

**Check:**
1. Browser console → Check `/api/knowledge-docs/byProject/:id` request
2. Verify response has array of docs
3. Check that `activeTab` state is set to 'docs'

**Solution:**
- Verify API route is registered in `server.js`
- Check CORS settings (should allow localhost:3000)
- Verify project ID is correct

---

## ✅ Success Criteria

**All tests pass if:**

1. ✅ Backend starts without errors
2. ✅ `knowledge_docs` table exists
3. ✅ Skill Detective recommends at least 3 agents
4. ✅ "Why?" explanations show matched patterns
5. ✅ Bootstrap Sprint creates 3 tasks
6. ✅ Bootstrap Sprint creates 5 knowledge docs
7. ✅ Knowledge Base tab shows both Config Files and Technical Docs
8. ✅ Can view and edit knowledge docs

---

## 🎉 Post-Launch

**Once all tests pass:**

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: FireSwarm integration - Skill Detective, Bootstrap Sprint, Knowledge Base"
   git push
   ```

2. **Document any issues found:**
   - Update this checklist with solutions
   - Note any edge cases discovered

3. **Celebrate!** 🎊
   - You've built a complete AI-powered project management system
   - The Skill Detective automatically recommends the right agents
   - Bootstrap Sprint creates a complete project structure in one click

---

## 📞 Support

**If something doesn't work:**

1. Check browser console (F12) for errors
2. Check backend console for errors
3. Verify database file exists and is writable
4. Check network tab for failed API calls
5. Review this checklist step-by-step

**Common Issues:**
- Port conflicts (4000 or 3000 already in use)
- CORS errors (backend not allowing frontend origin)
- Database locked (multiple processes accessing SQLite)
- GitHub API rate limiting (too many requests)

---

**Ready to test?** Follow the checklist above and report any issues! 🚀

