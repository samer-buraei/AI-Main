# Diagnostic script to test if services can start
# Run with: .\test-services.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vibecoding Services Diagnostic" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   [OK] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "   Install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
Write-Host "2. Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   [OK] npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check directories
$scriptPath = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
Write-Host "3. Checking project directories..." -ForegroundColor Yellow
Write-Host "   Script path: $scriptPath" -ForegroundColor Gray

$projects = @(
    @{Name="Backend"; Path="vibecoding-backend"},
    @{Name="Frontend"; Path="vibecoding-dashboard"},
    @{Name="MCP Server"; Path="vibecoding-mcp-server"}
)

foreach ($project in $projects) {
    $fullPath = Join-Path $scriptPath $project.Path
    if (Test-Path $fullPath) {
        Write-Host "   [OK] $($project.Name): Found" -ForegroundColor Green
        
        # Check package.json
        $packageJson = Join-Path $fullPath "package.json"
        if (Test-Path $packageJson) {
            Write-Host "      [OK] package.json exists" -ForegroundColor Green
            
            # Check node_modules
            $nodeModules = Join-Path $fullPath "node_modules"
            if (Test-Path $nodeModules) {
                Write-Host "      [OK] node_modules exists" -ForegroundColor Green
            } else {
                Write-Host "      [WARN] node_modules missing - will install on start" -ForegroundColor Yellow
            }
        } else {
            Write-Host "      [ERROR] package.json missing!" -ForegroundColor Red
        }
    } else {
        Write-Host "   [ERROR] $($project.Name): Not found at $fullPath" -ForegroundColor Red
    }
}

Write-Host ""

# Test npm commands
Write-Host "4. Testing npm commands..." -ForegroundColor Yellow

foreach ($project in $projects) {
    $fullPath = Join-Path $scriptPath $project.Path
    if (Test-Path $fullPath) {
        Write-Host "   Testing $($project.Name)..." -ForegroundColor Gray
        Push-Location $fullPath
        try {
            # Test if npm can read package.json
            $packageInfo = npm list --depth=0 2>&1
            if ($LASTEXITCODE -eq 0 -or $packageInfo -match "package.json") {
                Write-Host "      [OK] npm commands work" -ForegroundColor Green
            } else {
                Write-Host "      [WARN] npm list returned: $packageInfo" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "      [ERROR] npm test failed: $_" -ForegroundColor Red
        } finally {
            Pop-Location
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Diagnostic Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks passed, try running:" -ForegroundColor Yellow
Write-Host "  .\start-vibecoding.bat" -ForegroundColor Cyan
Write-Host "  or" -ForegroundColor Yellow
Write-Host "  .\start-vibecoding-gui.ps1" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"



