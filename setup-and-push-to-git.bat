@echo off
setlocal enabledelayedexpansion
title Setup Git Repository and Push
color 0B

echo ========================================
echo   Git Repository Setup and Push
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH
    echo.
    echo Please install Git first:
    echo   1. Download from: https://git-scm.com/download/win
    echo   2. Run the installer
    echo   3. IMPORTANT: Select "Add Git to PATH" during installation
    echo   4. Restart this script after installation
    echo.
    echo Alternatively, if Git is installed but not in PATH:
    echo   - Add Git's bin directory to your system PATH
    echo   - Usually: C:\Program Files\Git\bin
    echo.
    pause
    exit /b 1
)

echo [OK] Git found
git --version
echo.

REM Check if already a git repository
if exist ".git" (
    echo [INFO] Git repository already initialized
    set INIT_REPO=0
) else (
    echo [INFO] Initializing new Git repository...
    git init
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to initialize Git repository
        pause
        exit /b 1
    )
    set INIT_REPO=1
    echo [OK] Repository initialized
    echo.
)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo [INFO] Creating .gitignore file...
    (
        echo node_modules/
        echo .env
        echo .env.local
        echo dist/
        echo build/
        echo *.log
        echo .DS_Store
        echo Thumbs.db
        echo *.swp
        echo *.swo
        echo .vscode/
        echo .idea/
        echo *.zip
    ) > .gitignore
    echo [OK] .gitignore created
    echo.
)

REM Show current status
echo ========================================
echo   Current Git Status
echo ========================================
echo.
git status
echo.

REM Ask user what they want to do
echo ========================================
echo   What would you like to do?
echo ========================================
echo.
echo 1. Stage all changes and commit
echo 2. Stage all changes, commit, and push to remote
echo 3. Just show status (exit)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="3" (
    echo.
    echo Exiting...
    pause
    exit /b 0
)

if "%choice%"=="1" goto :commit_only
if "%choice%"=="2" goto :commit_and_push
goto :invalid_choice

:commit_only
echo.
echo ========================================
echo   Staging and Committing Changes
echo ========================================
echo.
git add .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to stage files
    pause
    exit /b 1
)
echo [OK] Files staged
echo.

set /p commit_msg="Enter commit message (or press Enter for default): "
if "!commit_msg!"=="" set commit_msg=Update start-vibecoding.bat with enhanced error handling

git commit -m "!commit_msg!"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to commit changes
    pause
    exit /b 1
)
echo.
echo [OK] Changes committed successfully!
echo.
echo Commit details:
git log -1 --oneline
echo.
pause
exit /b 0

:commit_and_push
echo.
echo ========================================
echo   Staging, Committing, and Pushing
echo ========================================
echo.

REM Stage files
git add .
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to stage files
    pause
    exit /b 1
)
echo [OK] Files staged
echo.

REM Get commit message
set /p commit_msg="Enter commit message (or press Enter for default): "
if "!commit_msg!"=="" set commit_msg=Update start-vibecoding.bat with enhanced error handling

REM Commit
git commit -m "!commit_msg!"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to commit changes
    pause
    exit /b 1
)
echo [OK] Changes committed
echo.

REM Check for remote
git remote -v >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] No remote repository configured
    echo.
    echo To push to a remote repository:
    echo   1. Create a repository on GitHub/GitLab/Bitbucket
    echo   2. Add the remote: git remote add origin YOUR_REPO_URL
    echo   3. Run this script again
    echo.
    echo For now, changes are committed locally only.
    pause
    exit /b 0
)

REM Show remotes
echo Current remote repositories:
git remote -v
echo.

REM Ask which branch to push to
set /p branch="Enter branch name to push (default: main or master): "
if "!branch!"=="" (
    REM Try to detect default branch
    git branch --show-current >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        for /f "tokens=*" %%b in ('git branch --show-current') do set branch=%%b
    ) else (
        REM Check if main or master exists
        git show-ref --verify --quiet refs/heads/main
        if %ERRORLEVEL% EQU 0 (
            set branch=main
        ) else (
            set branch=master
        )
    )
)

REM Push
echo.
echo [INFO] Pushing to remote repository...
echo.
git push -u origin !branch!
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Push failed!
    echo.
    echo Possible causes:
    echo   - Authentication required (GitHub/GitLab credentials)
    echo   - Remote URL is incorrect
    echo   - Network connectivity issues
    echo   - Branch doesn't exist on remote
    echo.
    echo To fix authentication:
    echo   - Use: git config --global user.name "Your Name"
    echo   - Use: git config --global user.email "your.email@example.com"
    echo   - For GitHub: Use Personal Access Token instead of password
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Changes have been pushed to remote repository!
echo.
git log -1 --oneline
echo.
pause
exit /b 0

:invalid_choice
echo.
echo [ERROR] Invalid choice. Please run the script again.
pause
exit /b 1

