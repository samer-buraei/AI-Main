/**
 * Lazy Scanner Tool
 * Fetches file lists from GitHub without downloading the entire repository
 * Junior Dev Note: This is "lazy" because we only peek at the file structure,
 * not clone/download everything. Much faster!
 */

const axios = require('axios');

async function fetchRepoMetadata(repoUrl) {
  try {
    // Clean URL to get "owner/repo"
    // Example: "https://github.com/facebook/react" → ["facebook", "react"]
    const cleanUrl = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');
    const [owner, repo] = cleanUrl.split('/');

    if (!owner || !repo) {
      return { name: repoUrl, error: 'Invalid GitHub URL format' };
    }

    console.log(`🔍 Scanning ${owner}/${repo}...`);

    // 1. Get File List (API Call)
    // This gives us the top-level files and folders
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const treeRes = await axios.get(treeUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Optional: Add token for higher rate limits
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    });
    
    const files = treeRes.data.map(f => f.name);

    // 2. Find Config File
    // These files tell us what the project uses (dependencies, frameworks, etc.)
    const configFiles = ['package.json', 'requirements.txt', 'pom.xml', 'README.md'];
    const foundConfig = files.find(f => configFiles.includes(f));

    let configContent = '';
    if (foundConfig) {
      const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${foundConfig}`;
      const contentRes = await axios.get(contentUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      // GitHub sends content as Base64 encoded string
      // We need to decode it to read the actual text
      configContent = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
    }

    // Return metadata (limit config size to prevent huge responses)
    return {
      success: true,
      name: repo,
      owner: owner,
      files: files,
      config: configContent.substring(0, 500), // Limit size!
      configFileName: foundConfig || null
    };

  } catch (error) {
    console.error(`❌ Failed to scan ${repoUrl}:`, error.message);
    
    // Handle specific GitHub API errors
    if (error.response?.status === 404) {
      return { success: false, name: repoUrl, error: 'Repository not found' };
    }
    if (error.response?.status === 403) {
      return { success: false, name: repoUrl, error: 'Rate limit exceeded or private repository' };
    }
    
    return { success: false, name: repoUrl, error: error.message || 'Could not access repo' };
  }
}

module.exports = fetchRepoMetadata;

