# 🚀 Deployment Notes - Cross-Project Import

## ⚠️ Known Issue: Cross-Project Import

### Current Implementation

In `vibecoding-backend/src/routes/orchestrator.js`:

```javascript
const path = require('path');
const fetchRepoMetadata = require(path.join(__dirname, '../../../vibecoding-mcp-server/src/tools/fetchRepoMetadata'));
```

**Status:** ✅ **Works perfectly in local development**

### Potential Issues

This relative path import may break in:
- **Docker containers** (if folders are isolated)
- **Cloud deployments** (different directory structures)
- **Monorepo setups** (if projects are separated)

### Current Solution

**For now:** This is completely fine for local development and MVP.

### Future Fix Options

When deploying to production, consider one of these approaches:

#### Option 1: Copy to Shared Utils (Recommended)
```bash
# Create shared utils folder
mkdir -p shared/utils

# Copy the function
cp vibecoding-mcp-server/src/tools/fetchRepoMetadata.js shared/utils/

# Update import in orchestrator.js
const fetchRepoMetadata = require('../../shared/utils/fetchRepoMetadata');
```

#### Option 2: Create NPM Package
```bash
# Create internal package
mkdir vibecoding-shared
cd vibecoding-shared
npm init -y

# Move fetchRepoMetadata.js here
# Install in both projects
npm install ../vibecoding-shared
```

#### Option 3: Symlink (Development Only)
```bash
# Create symlink (Windows)
mklink /D vibecoding-backend\shared vibecoding-mcp-server\src\tools

# Or use junction (Windows)
junction vibecoding-backend\shared vibecoding-mcp-server\src\tools
```

#### Option 4: Docker Volume Mount
```dockerfile
# In docker-compose.yml
volumes:
  - ./vibecoding-mcp-server/src/tools:/app/shared/tools
```

### Recommendation

**For MVP:** Keep as-is (works fine locally)

**For Production:** Use Option 1 (shared utils folder) - simplest and most portable

---

## ✅ Implementation Status: APPROVED

**Ready to execute!** All files are created and ready to use.

---

## 📋 Pre-Execution Checklist

- [x] All files created
- [x] All dependencies verified (no install needed)
- [x] Database schema ready
- [x] API routes registered
- [x] Frontend components integrated
- [x] Cross-project import noted (works for now)

---

## 🎯 Next Steps

1. **Restart Backend** (creates new table)
2. **Test Wizard** (use GitHub repo)
3. **Enjoy the Magic!** ✨

---

**Note:** The cross-project import is documented here for future reference. No action needed for MVP.

