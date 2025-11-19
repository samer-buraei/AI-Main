# PowerShell script for Git upload (using system credential manager)

# ========================================
# CONFIGURATION
# ========================================
$RepoUrl = "https://github.com/samer-buraei/AI-Main.git"
$CommitMessage = "Auto-update from Vibecoding: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# ========================================
# HELPER FUNCTIONS
# ========================================
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   $Text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Error-Exit {
    param([string]$Text)
    Write-Host ""
    Write-Host "[ERROR] $Text" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# ========================================
# MAIN SCRIPT
# ========================================
Clear-Host
Write-Header "Vibecoding Git Uploader"

# 1. Check for Git
try {
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"
} catch {
    Write-Error-Exit "Git is not installed or not in your PATH."
}

# 2. Initialize Repository if needed
if (-not (Test-Path ".git")) {
    Write-Host "Initializing new repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -eq 0) { Write-Success "Repository initialized" }
} else {
    Write-Success "Git repository already initialized"
}

# 3. Check Remote Origin
$currentRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Setting remote origin to: $RepoUrl" -ForegroundColor Yellow
    git remote add origin $RepoUrl
} elseif ($currentRemote -ne $RepoUrl) {
    Write-Host "Updating remote origin to: $RepoUrl" -ForegroundColor Yellow
    git remote set-url origin $RepoUrl
} else {
    Write-Success "Remote origin is correct"
}

# 4. Stage Changes
Write-Host "Staging files..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) { Write-Success "Files staged" }

# 5. Commit Changes
# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "$CommitMessage"
    if ($LASTEXITCODE -eq 0) { Write-Success "Changes committed" }
} else {
    Write-Success "No new changes to commit"
}

# 6. Determine Branch
$branch = git branch --show-current
if (-not $branch) {
    $branch = "main"
    git branch -M main
}
Write-Host "Current branch: $branch" -ForegroundColor Gray

# 7. Push to GitHub
Write-Header "Pushing to GitHub..."
Write-Host "If a login window appears, please sign in with your browser." -ForegroundColor Yellow
Write-Host "Target: $RepoUrl" -ForegroundColor Gray
Write-Host ""

git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Header "SUCCESS!"
    Write-Host "Your project has been synced." -ForegroundColor Green
    Write-Host "View at: $RepoUrl" -ForegroundColor White
} else {
    Write-Header "PUSH FAILED"
    Write-Host "Git returned exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Check the error message above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
