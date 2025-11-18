# PowerShell script with GUI for Git login and upload
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ========================================
# FIND GIT INSTALLATION
# ========================================
function Find-GitInstallation {
    Write-Host "Searching for Git installation..." -ForegroundColor Cyan
    
    # Try git from PATH first
    try {
        $gitVersion = & git --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $gitPath = (Get-Command git -ErrorAction SilentlyContinue).Source
            Write-Host "[OK] Git found in PATH: $gitPath" -ForegroundColor Green
            Write-Host "[OK] $gitVersion" -ForegroundColor Green
            return @{Found = $true; Path = $gitPath; Version = $gitVersion}
        }
    } catch {}
    
    # Search common locations
    $searchPaths = @(
        "$env:ProgramFiles\Git\cmd\git.exe",
        "$env:ProgramFiles\Git\bin\git.exe",
        "${env:ProgramFiles(x86)}\Git\cmd\git.exe",
        "${env:ProgramFiles(x86)}\Git\bin\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
    )
    
    foreach ($path in $searchPaths) {
        if (Test-Path $path) {
            Write-Host "[OK] Found Git at: $path" -ForegroundColor Green
            $gitDir = Split-Path (Split-Path $path)
            $env:PATH = "$gitDir\cmd;$gitDir\bin;$env:PATH"
            
            try {
                $gitVersion = & $path --version 2>$null
                Write-Host "[OK] $gitVersion" -ForegroundColor Green
                return @{Found = $true; Path = $path; Version = $gitVersion}
            } catch {
                Write-Host "[WARNING] Git found but not working: $path" -ForegroundColor Yellow
            }
        }
    }
    
    # Recursive search in Program Files
    Write-Host "Performing deep search..." -ForegroundColor Yellow
    $programFiles = @($env:ProgramFiles, ${env:ProgramFiles(x86)}) | Where-Object { $_ }
    
    foreach ($pf in $programFiles) {
        try {
            $gitExes = Get-ChildItem -Path $pf -Filter "git.exe" -Recurse -ErrorAction SilentlyContinue | 
                       Where-Object { $_.Directory.Name -eq "cmd" -or $_.Directory.Name -eq "bin" }
            
            if ($gitExes) {
                $gitPath = $gitExes[0].FullName
                Write-Host "[OK] Found Git at: $gitPath" -ForegroundColor Green
                $gitDir = Split-Path (Split-Path $gitPath)
                $env:PATH = "$gitDir\cmd;$gitDir\bin;$env:PATH"
                
                try {
                    $gitVersion = & $gitPath --version 2>$null
                    Write-Host "[OK] $gitVersion" -ForegroundColor Green
                    return @{Found = $true; Path = $gitPath; Version = $gitVersion}
                } catch {}
            }
        } catch {}
    }
    
    return @{Found = $false; Path = $null; Version = $null}
}

# ========================================
# GIT COMMAND WRAPPER
# ========================================
function Invoke-GitCommand {
    param(
        [string]$Arguments,
        [switch]$IgnoreErrors
    )
    
    Write-Host "`n> git $Arguments" -ForegroundColor DarkGray
    
    $output = & git $Arguments.Split(' ') 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($output) {
        $output | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
    }
    
    if ($exitCode -ne 0 -and -not $IgnoreErrors) {
        return @{Success = $false; Output = $output; ExitCode = $exitCode}
    }
    
    return @{Success = $true; Output = $output; ExitCode = $exitCode}
}

# ========================================
# CREATE GUI FORM
# ========================================
$form = New-Object System.Windows.Forms.Form
$form.Text = "Git Upload - Login"
$form.Size = New-Object System.Drawing.Size(500, 400)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(240, 240, 240)

# Title Label
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Location = New-Object System.Drawing.Point(20, 20)
$titleLabel.Size = New-Object System.Drawing.Size(450, 40)
$titleLabel.Text = "Upload to Git Repository"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$form.Controls.Add($titleLabel)

# Subtitle Label
$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Location = New-Object System.Drawing.Point(20, 60)
$subtitleLabel.Size = New-Object System.Drawing.Size(450, 20)
$subtitleLabel.Text = "Enter your Git repository credentials"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
$form.Controls.Add($subtitleLabel)

# Repository URL
$urlLabel = New-Object System.Windows.Forms.Label
$urlLabel.Location = New-Object System.Drawing.Point(20, 100)
$urlLabel.Size = New-Object System.Drawing.Size(450, 20)
$urlLabel.Text = "Repository URL *"
$urlLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($urlLabel)

$urlTextBox = New-Object System.Windows.Forms.TextBox
$urlTextBox.Location = New-Object System.Drawing.Point(20, 125)
$urlTextBox.Size = New-Object System.Drawing.Size(450, 25)
$urlTextBox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$urlTextBox.Text = "https://github.com/username/repository.git"
$form.Controls.Add($urlTextBox)

# Username
$usernameLabel = New-Object System.Windows.Forms.Label
$usernameLabel.Location = New-Object System.Drawing.Point(20, 165)
$usernameLabel.Size = New-Object System.Drawing.Size(450, 20)
$usernameLabel.Text = "Username *"
$usernameLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($usernameLabel)

$usernameTextBox = New-Object System.Windows.Forms.TextBox
$usernameTextBox.Location = New-Object System.Drawing.Point(20, 190)
$usernameTextBox.Size = New-Object System.Drawing.Size(450, 25)
$usernameTextBox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$form.Controls.Add($usernameTextBox)

# Token/Password
$tokenLabel = New-Object System.Windows.Forms.Label
$tokenLabel.Location = New-Object System.Drawing.Point(20, 230)
$tokenLabel.Size = New-Object System.Drawing.Size(450, 20)
$tokenLabel.Text = "Personal Access Token / Password *"
$tokenLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($tokenLabel)

$tokenTextBox = New-Object System.Windows.Forms.TextBox
$tokenTextBox.Location = New-Object System.Drawing.Point(20, 255)
$tokenTextBox.Size = New-Object System.Drawing.Size(450, 25)
$tokenTextBox.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$tokenTextBox.UseSystemPasswordChar = $true
$form.Controls.Add($tokenTextBox)

# Info Label
$infoLabel = New-Object System.Windows.Forms.Label
$infoLabel.Location = New-Object System.Drawing.Point(20, 290)
$infoLabel.Size = New-Object System.Drawing.Size(450, 30)
$infoLabel.Text = "For GitHub: Create token at github.com/settings/tokens`nFor GitLab: Create token at gitlab.com/-/profile/personal_access_tokens"
$infoLabel.Font = New-Object System.Drawing.Font("Segoe UI", 8)
$infoLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
$form.Controls.Add($infoLabel)

# Upload Button
$uploadButton = New-Object System.Windows.Forms.Button
$uploadButton.Location = New-Object System.Drawing.Point(300, 330)
$uploadButton.Size = New-Object System.Drawing.Size(170, 35)
$uploadButton.Text = "Login && Upload"
$uploadButton.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$uploadButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$uploadButton.ForeColor = [System.Drawing.Color]::White
$uploadButton.FlatStyle = "Flat"
$uploadButton.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($uploadButton)

# Cancel Button
$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.Location = New-Object System.Drawing.Point(120, 330)
$cancelButton.Size = New-Object System.Drawing.Size(170, 35)
$cancelButton.Text = "Cancel"
$cancelButton.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$cancelButton.BackColor = [System.Drawing.Color]::FromArgb(200, 200, 200)
$cancelButton.ForeColor = [System.Drawing.Color]::Black
$cancelButton.FlatStyle = "Flat"
$cancelButton.Cursor = [System.Windows.Forms.Cursors]::Hand
$cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
$form.Controls.Add($cancelButton)

# ========================================
# UPLOAD BUTTON CLICK HANDLER
# ========================================
$uploadButton.Add_Click({
    # Validate inputs
    if ([string]::IsNullOrWhiteSpace($urlTextBox.Text) -or
        [string]::IsNullOrWhiteSpace($usernameTextBox.Text) -or
        [string]::IsNullOrWhiteSpace($tokenTextBox.Text)) {
        [System.Windows.Forms.MessageBox]::Show(
            "Please fill in all required fields.`n`nAll fields marked with * are required.",
            "Validation Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Warning
        )
        return
    }
    
    # Validate URL format
    $repoUrl = $urlTextBox.Text.Trim()
    if ($repoUrl -notmatch '^https?://') {
        [System.Windows.Forms.MessageBox]::Show(
            "Repository URL must start with http:// or https://`n`nExample: https://github.com/username/repo.git",
            "Invalid URL",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Warning
        )
        return
    }
    
    # Hide form and show console
    $form.Hide()
    
    # Clear console and show header
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Git Upload Process" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check Git installation
    $gitInfo = Find-GitInstallation
    
    if (-not $gitInfo.Found) {
        Write-Host "" 
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "   [ERROR] Git Not Found" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Git is not installed or not in PATH." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Download Git from: https://git-scm.com/download/win" -ForegroundColor White
        Write-Host ""
        
        $result = [System.Windows.Forms.MessageBox]::Show(
            "Git is not installed.`n`nWould you like to open the Git download page?",
            "Git Not Found",
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Question
        )
        
        if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
            Start-Process "https://git-scm.com/download/win"
        }
        
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    Write-Host ""
    
    # Initialize Git repository if needed
    if (-not (Test-Path ".git")) {
        Write-Host "Initializing Git repository..." -ForegroundColor Cyan
        $result = Invoke-GitCommand "init"
        if (-not $result.Success) {
            [System.Windows.Forms.MessageBox]::Show(
                "Failed to initialize Git repository.`n`nCheck the console for details.",
                "Git Error",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Error
            )
            Write-Host "`nPress any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 1
        }
        Write-Host "[OK] Repository initialized" -ForegroundColor Green
    } else {
        Write-Host "[OK] Git repository already initialized" -ForegroundColor Green
    }
    
    # Create .gitignore if it doesn't exist
    if (-not (Test-Path ".gitignore")) {
        Write-Host "`nCreating .gitignore..." -ForegroundColor Cyan
        @"
# Dependencies
node_modules/
.npm-global/

# Build outputs
dist/
build/
*.log

# Environment files
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Temporary files
*.tmp
temp/
.cache/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Host "[OK] .gitignore created" -ForegroundColor Green
    }
    
    # Configure Git user
    Write-Host "`nConfiguring Git..." -ForegroundColor Cyan
    Invoke-GitCommand "config user.name `"$($usernameTextBox.Text)`"" -IgnoreErrors
    Invoke-GitCommand "config user.email `"$($usernameTextBox.Text)@users.noreply.github.com`"" -IgnoreErrors
    Write-Host "[OK] Git configured" -ForegroundColor Green
    
    # Add all files
    Write-Host "`nStaging files..." -ForegroundColor Cyan
    $result = Invoke-GitCommand "add ."
    if (-not $result.Success) {
        [System.Windows.Forms.MessageBox]::Show(
            "Failed to stage files.`n`nCheck the console for details.",
            "Git Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        Write-Host "`nPress any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "[OK] Files staged" -ForegroundColor Green
    
    # Commit
    Write-Host "`nCommitting changes..." -ForegroundColor Cyan
    $commitMessage = "Update vibecoding project - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    $result = Invoke-GitCommand "commit -m `"$commitMessage`""
    if (-not $result.Success -and $result.Output -notmatch "nothing to commit") {
        [System.Windows.Forms.MessageBox]::Show(
            "Failed to commit changes.`n`nCheck the console for details.",
            "Git Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        Write-Host "`nPress any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "[OK] Changes committed" -ForegroundColor Green
    
    # Set up remote with credentials
    Write-Host "`nConfiguring remote repository..." -ForegroundColor Cyan
    $username = $usernameTextBox.Text
    $token = $tokenTextBox.Text
    
    # Parse the URL to insert credentials
    if ($repoUrl -match '^(https?://)(.+)$') {
        $protocol = $matches[1]
        $urlWithoutProtocol = $matches[2]
        $authUrl = "${protocol}${username}:${token}@${urlWithoutProtocol}"
    } else {
        $authUrl = $repoUrl
    }
    
    # Remove existing origin if it exists
    Invoke-GitCommand "remote remove origin" -IgnoreErrors
    
    # Add new origin
    $result = Invoke-GitCommand "remote add origin `"$authUrl`""
    if (-not $result.Success) {
        [System.Windows.Forms.MessageBox]::Show(
            "Failed to add remote repository.`n`nCheck the console for details.",
            "Git Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
        Write-Host "`nPress any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "[OK] Remote configured" -ForegroundColor Green
    
    # Get current branch name
    $branch = (Invoke-GitCommand "branch --show-current").Output
    if ([string]::IsNullOrWhiteSpace($branch)) {
        $branch = "main"
        Invoke-GitCommand "branch -M main" -IgnoreErrors
    }
    
    # Push to remote
    Write-Host "`nPushing to remote repository..." -ForegroundColor Cyan
    Write-Host "Branch: $branch" -ForegroundColor White
    Write-Host "This may take a moment..." -ForegroundColor Yellow
    Write-Host ""
    
    $result = Invoke-GitCommand "push -u origin $branch"
    
    if ($result.Success) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   SUCCESS!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "All files uploaded to:" -ForegroundColor White
        Write-Host "  $repoUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Branch: $branch" -ForegroundColor White
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        
        [System.Windows.Forms.MessageBox]::Show(
            "Upload successful!`n`nYour files have been pushed to:`n$repoUrl",
            "Success",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        )
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "   PUSH FAILED" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        
        $errorMessage = $result.Output -join "`n"
        
        # Analyze error and provide specific guidance
        if ($errorMessage -match "authentication failed|could not read Username|could not read Password") {
            Write-Host "Authentication failed." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Possible solutions:" -ForegroundColor White
            Write-Host "  - Check your username and token" -ForegroundColor Gray
            Write-Host "  - For GitHub: Use Personal Access Token, not password" -ForegroundColor Gray
            Write-Host "  - Create token at: https://github.com/settings/tokens" -ForegroundColor Gray
            Write-Host "  - Token needs 'repo' permissions" -ForegroundColor Gray
        }
        elseif ($errorMessage -match "repository not found|does not appear to be a git repository") {
            Write-Host "Repository not found or doesn't exist." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Possible solutions:" -ForegroundColor White
            Write-Host "  - Create the repository on GitHub/GitLab first" -ForegroundColor Gray
            Write-Host "  - Check the repository URL is correct" -ForegroundColor Gray
            Write-Host "  - Verify you have access to the repository" -ForegroundColor Gray
        }
        elseif ($errorMessage -match "permission denied|forbidden") {
            Write-Host "Permission denied." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Possible solutions:" -ForegroundColor White
            Write-Host "  - Verify you have write access to the repository" -ForegroundColor Gray
            Write-Host "  - Check your token has the correct permissions" -ForegroundColor Gray
            Write-Host "  - For organizations: ensure you're a member" -ForegroundColor Gray
        }
        else {
            Write-Host "An error occurred during push." -ForegroundColor Yellow
            Write-Host "See error details above." -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        
        [System.Windows.Forms.MessageBox]::Show(
            "Push failed.`n`nCheck the console window for detailed error information and troubleshooting steps.",
            "Push Failed",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
    }
    
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    $form.Close()
})

# Show the form
$form.ShowDialog()
