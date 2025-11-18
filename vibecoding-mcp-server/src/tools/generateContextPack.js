/**
 * Generate Context Pack Tool
 * Generates a focused context pack for an agent to work on a specific task
 */

const backendClient = require('../services/backendClient');
const logger = require('../utils/logger');

/**
 * Generate a context pack for an agent
 * @param {Object} input - Tool input
 * @param {string} input.projectId - The project ID
 * @param {string} input.taskId - The task ID
 * @param {string} [input.agentType] - The agent type (optional, defaults to task's assigned_to)
 * @returns {Promise<Object>} Result with context pack
 */
async function generateContextPack(input) {
  const { projectId, taskId, agentType } = input;

  if (!projectId || !taskId) {
    throw new Error('projectId and taskId are required');
  }

  logger.info('Generating context pack', { projectId, taskId, agentType });

  try {
    // Fetch all project knowledge
    const knowledgeBase = await backendClient.getKnowledgeFiles(projectId);

    // Fetch the specific task
    const task = await backendClient.getTask(projectId, taskId);
    const finalAgentType = agentType || task.assigned_to || '@backend';

    // Parse allowed paths
    const allowedPaths = Array.isArray(task.allowed_paths)
      ? task.allowed_paths
      : JSON.parse(task.allowed_paths || '[]');

    // Assemble the Context Pack
    const contextPack = `# 🚀 CONTEXT PACK FOR AGENT: ${finalAgentType}

# 🎯 YOUR TASK: ${task.title} (ID: ${task.id})

## 📖 Task Description

${task.description || 'No description provided.'}

## 🚦 Status

Current Status: **${task.status}**

## 🗂️ Allowed Files (STRICT)

You should *only* work within these file paths. Do not modify files outside these paths:

${allowedPaths.length > 0 ? allowedPaths.map((p) => `- \`${p}\``).join('\n') : '- No restrictions (all files allowed)'}

---

## 🧠 PROJECT KNOWLEDGE (Your External Memory)

Here is the high-level information you need. DO NOT guess. Use this knowledge to make informed decisions.

### 1. Change Patterns (How-To Guide)

${knowledgeBase.CHANGE_PATTERNS || 'No change patterns defined for this project. Use standard best practices.'}

### 2. Component Summaries (Relevant Code)

${knowledgeBase.COMPONENT_SUMMARIES || 'No component summaries defined. Explore the codebase to understand existing components.'}

### 3. File Dependencies (Safety Check)

${knowledgeBase.FILE_DEPENDENCIES || 'No file dependencies defined. Be cautious when modifying shared files.'}

### 4. Full Project Map (Reference)

${knowledgeBase.PROJECT_MAP || 'No project map defined. Explore the codebase structure to understand the project layout.'}

---

## ⚡ YOUR ACTION PLAN

1. **Review** the Task and Knowledge above carefully.
2. **Understand** the allowed file paths and dependencies.
3. **Perform** the work, staying *strictly* within your Allowed Files.
4. **Test** your changes if applicable.
5. **When complete**, call the \`update-task-status\` tool to set your task to 'DONE'.

---

## 📝 Notes

- If you encounter blockers, update the task status to 'BLOCKED' and document the blocker.
- If you need to modify files outside your allowed paths, create a new task for the appropriate agent.
- Always follow the change patterns and respect file dependencies.

`;

    logger.debug('Context pack generated', { projectId, taskId, size: contextPack.length });

    return {
      message: `Context pack for task ${taskId} generated successfully.`,
      contextPack: contextPack,
      task: {
        id: task.id,
        title: task.title,
        assigned_to: task.assigned_to,
        status: task.status,
      },
    };
  } catch (error) {
    logger.error('Error generating context pack', { error: error.message, projectId, taskId });
    throw error;
  }
}

module.exports = generateContextPack;

