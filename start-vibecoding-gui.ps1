# Vibecoding Project Manager - GUI Launcher
# Run with: .\start-vibecoding-gui.ps1

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create main form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Vibecoding Project Manager"
$form.Size = New-Object System.Drawing.Size(500, 400)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false

# Title label
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "Vibecoding Project Manager"
$titleLabel.Font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$titleLabel.AutoSize = $true
$titleLabel.Location = New-Object System.Drawing.Point(120, 20)
$form.Controls.Add($titleLabel)

# Status label
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Ready to start services"
$statusLabel.AutoSize = $true
$statusLabel.Location = New-Object System.Drawing.Point(20, 60)
$statusLabel.ForeColor = [System.Drawing.Color]::Gray
$form.Controls.Add($statusLabel)

# Service checkboxes
$backendCheck = New-Object System.Windows.Forms.CheckBox
$backendCheck.Text = "Backend API (Port 4000)"
$backendCheck.Checked = $true
$backendCheck.Location = New-Object System.Drawing.Point(20, 100)
$backendCheck.AutoSize = $true
$form.Controls.Add($backendCheck)

$frontendCheck = New-Object System.Windows.Forms.CheckBox
$frontendCheck.Text = "Frontend Dashboard (Port 3000)"
$frontendCheck.Checked = $true
$frontendCheck.Location = New-Object System.Drawing.Point(20, 130)
$frontendCheck.AutoSize = $true
$form.Controls.Add($frontendCheck)

$mcpCheck = New-Object System.Windows.Forms.CheckBox
$mcpCheck.Text = "MCP Server (Port 4001)"
$mcpCheck.Checked = $true
$mcpCheck.Location = New-Object System.Drawing.Point(20, 160)
$mcpCheck.AutoSize = $true
$form.Controls.Add($mcpCheck)

# Start button
$startButton = New-Object System.Windows.Forms.Button
$startButton.Text = "Start Services"
$startButton.Size = New-Object System.Drawing.Size(150, 40)
$startButton.Location = New-Object System.Drawing.Point(20, 200)
$startButton.BackColor = [System.Drawing.Color]::Green
$startButton.ForeColor = [System.Drawing.Color]::White
$startButton.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($startButton)

# Stop button
$stopButton = New-Object System.Windows.Forms.Button
$stopButton.Text = "Stop All Services"
$stopButton.Size = New-Object System.Drawing.Size(150, 40)
$stopButton.Location = New-Object System.Drawing.Point(180, 200)
$stopButton.BackColor = [System.Drawing.Color]::Red
$stopButton.ForeColor = [System.Drawing.Color]::White
$stopButton.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($stopButton)

# Open Dashboard button
$openDashboardButton = New-Object System.Windows.Forms.Button
$openDashboardButton.Text = "Open Dashboard"
$openDashboardButton.Size = New-Object System.Drawing.Size(150, 40)
$openDashboardButton.Location = New-Object System.Drawing.Point(340, 200)
$openDashboardButton.BackColor = [System.Drawing.Color]::Blue
$openDashboardButton.ForeColor = [System.Drawing.Color]::White
$openDashboardButton.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($openDashboardButton)

# Info textbox
$infoBox = New-Object System.Windows.Forms.TextBox
$infoBox.Multiline = $true
$infoBox.ReadOnly = $true
$infoBox.ScrollBars = "Vertical"
$infoBox.Size = New-Object System.Drawing.Size(450, 100)
$infoBox.Location = New-Object System.Drawing.Point(20, 260)
$infoBox.Text = "Select services to start and click 'Start Services'`n`nBackend API: http://localhost:4000`nFrontend: http://localhost:3000`nMCP Server: http://localhost:4001"
$form.Controls.Add($infoBox)

# Function to check Node.js
function Test-NodeJS {
    try {
        $null = node --version
        return $true
    } catch {
        return $false
    }
}

# Function to check and install dependencies
function Install-DependenciesIfNeeded {
    param([string]$ProjectPath, [string]$ProjectName)
    
    $nodeModulesPath = Join-Path $ProjectPath "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "[INFO] Installing $ProjectName dependencies..." -ForegroundColor Yellow
        Push-Location $ProjectPath
        try {
            $output = npm install 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed"
            }
            return $true
        } catch {
            Write-Host "[ERROR] Failed to install dependencies: $_" -ForegroundColor Red
            return $false
        } finally {
            Pop-Location
        }
    }
    return $true
}

# Function to start services
$startButton.Add_Click({
    if (-not (Test-NodeJS)) {
        [System.Windows.Forms.MessageBox]::Show(
            "Node.js is not installed or not in PATH.`nPlease install Node.js from https://nodejs.org/",
            "Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        return
    }

    $statusLabel.Text = "Checking dependencies..."
    $statusLabel.ForeColor = [System.Drawing.Color]::Orange
    $startButton.Enabled = $false
    $form.Refresh()

    $scriptPath = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    if (-not $scriptPath) {
        $scriptPath = Get-Location
    }
    
    $started = @()
    $errors = @()

    # Start Backend
    if ($backendCheck.Checked) {
        $backendPath = Join-Path $scriptPath "vibecoding-backend"
        if (Test-Path $backendPath) {
            $statusLabel.Text = "Checking backend dependencies..."
            $form.Refresh()
            
            if (Install-DependenciesIfNeeded -ProjectPath $backendPath -ProjectName "Backend") {
                $packageJson = Join-Path $backendPath "package.json"
                if (Test-Path $packageJson) {
                    try {
                        $backendPathEscaped = $backendPath -replace "'", "''"
                        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPathEscaped'; Write-Host '[Backend] Starting on port 4000...' -ForegroundColor Green; npm run dev; if (`$LASTEXITCODE -ne 0) { Write-Host '[ERROR] Backend failed to start. Press any key to close.' -ForegroundColor Red; Read-Host }"
                        $started += "Backend"
                        Start-Sleep -Seconds 2
                    } catch {
                        $errors += "Backend: $($_.Exception.Message)"
                    }
                } else {
                    $errors += "Backend: package.json not found"
                }
            } else {
                $errors += "Backend: Failed to install dependencies"
            }
        } else {
            $errors += "Backend: Directory not found at $backendPath"
        }
    }

    # Start Frontend
    if ($frontendCheck.Checked) {
        $frontendPath = Join-Path $scriptPath "vibecoding-dashboard"
        if (Test-Path $frontendPath) {
            $statusLabel.Text = "Checking frontend dependencies..."
            $form.Refresh()
            
            if (Install-DependenciesIfNeeded -ProjectPath $frontendPath -ProjectName "Frontend") {
                $packageJson = Join-Path $frontendPath "package.json"
                if (Test-Path $packageJson) {
                    try {
                        $frontendPathEscaped = $frontendPath -replace "'", "''"
                        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPathEscaped'; Write-Host '[Frontend] Starting on port 3000...' -ForegroundColor Green; npm start; if (`$LASTEXITCODE -ne 0) { Write-Host '[ERROR] Frontend failed to start. Press any key to close.' -ForegroundColor Red; Read-Host }"
                        $started += "Frontend"
                        Start-Sleep -Seconds 2
                    } catch {
                        $errors += "Frontend: $($_.Exception.Message)"
                    }
                } else {
                    $errors += "Frontend: package.json not found"
                }
            } else {
                $errors += "Frontend: Failed to install dependencies"
            }
        } else {
            $errors += "Frontend: Directory not found at $frontendPath"
        }
    }

    # Start MCP Server
    if ($mcpCheck.Checked) {
        $mcpPath = Join-Path $scriptPath "vibecoding-mcp-server"
        if (Test-Path $mcpPath) {
            $statusLabel.Text = "Checking MCP server dependencies..."
            $form.Refresh()
            
            if (Install-DependenciesIfNeeded -ProjectPath $mcpPath -ProjectName "MCP Server") {
                $packageJson = Join-Path $mcpPath "package.json"
                if (Test-Path $packageJson) {
                    try {
                        $mcpPathEscaped = $mcpPath -replace "'", "''"
                        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$mcpPathEscaped'; Write-Host '[MCP Server] Starting on port 4001...' -ForegroundColor Green; npm run dev; if (`$LASTEXITCODE -ne 0) { Write-Host '[ERROR] MCP Server failed to start. Press any key to close.' -ForegroundColor Red; Read-Host }"
                        $started += "MCP Server"
                    } catch {
                        $errors += "MCP Server: $($_.Exception.Message)"
                    }
                } else {
                    $errors += "MCP Server: package.json not found"
                }
            } else {
                $errors += "MCP Server: Failed to install dependencies"
            }
        } else {
            $errors += "MCP Server: Directory not found at $mcpPath"
        }
    }

    # Update status
    if ($started.Count -gt 0) {
        $statusLabel.Text = "Services started: $($started -join ', ')"
        $statusLabel.ForeColor = [System.Drawing.Color]::Green
        $infoText = "Services are running in separate windows.`n`nStarted:`n- $($started -join "`n- ")"
        if ($errors.Count -gt 0) {
            $infoText += "`n`nErrors:`n- $($errors -join "`n- ")"
        }
        $infoBox.Text = $infoText
    } else {
        $statusLabel.Text = "Failed to start services"
        $statusLabel.ForeColor = [System.Drawing.Color]::Red
        $infoBox.Text = "Failed to start services.`n`nErrors:`n- $($errors -join "`n- ")"
        
        if ($errors.Count -gt 0) {
            [System.Windows.Forms.MessageBox]::Show(
                "Failed to start services:`n`n$($errors -join "`n")",
                "Error",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Error
            )
        }
    }

    $startButton.Enabled = $true
})

# Function to stop services
$stopButton.Add_Click({
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        $statusLabel.Text = "All services stopped"
        $statusLabel.ForeColor = [System.Drawing.Color]::Red
        $infoBox.Text = "All Node.js processes have been stopped.`n`nYou can now start services again."
    } else {
        $statusLabel.Text = "No services running"
        $statusLabel.ForeColor = [System.Drawing.Color]::Gray
    }
})

# Function to open dashboard
$openDashboardButton.Add_Click({
    Start-Process "http://localhost:3000"
})

# Show form
$form.Add_Shown({$form.Activate()})
[System.Windows.Forms.Application]::Run($form)

