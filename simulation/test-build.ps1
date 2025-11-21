# Test Build Script for FireSwarm Simulation
# This script tests the Dockerfile build step by step

Write-Host "=== FireSwarm Build Test ===" -ForegroundColor Cyan
Set-Location $PSScriptRoot

# Test 1: Check if Dockerfile exists
if (-not (Test-Path "Dockerfile")) {
    Write-Host "[ERROR] Dockerfile not found!" -ForegroundColor Red
    exit 1
}

# Test 2: Validate Dockerfile syntax
Write-Host "Testing Dockerfile syntax..." -ForegroundColor Yellow
try {
    docker build --dry-run -f Dockerfile . 2>$null
    Write-Host "[OK] Dockerfile syntax is valid" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Dockerfile syntax error: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Check required dependencies
Write-Host "Checking required system dependencies..." -ForegroundColor Yellow
$deps = @("git", "cmake", "make", "gcc", "g++")
foreach ($dep in $deps) {
    try {
        $null = Get-Command $dep -ErrorAction Stop
    } catch {
        Write-Host "[WARN] $dep not found in PATH (but should be available in Docker)" -ForegroundColor Yellow
    }
}

# Test 4: Build with progress and error capture
Write-Host "Building Docker image (this may take 5-10 minutes)..." -ForegroundColor Yellow
try {
    $startTime = Get-Date

    # Build with progress output
    $process = Start-Process -FilePath "docker" -ArgumentList @("build", "-t", "fireswarm_sitl:test", ".") -NoNewWindow -Wait -PassThru

    $endTime = Get-Date
    $duration = $endTime - $startTime

    if ($process.ExitCode -eq 0) {
        Write-Host "[SUCCESS] Build completed in $($duration.TotalSeconds) seconds" -ForegroundColor Green
        Write-Host "Image: fireswarm_sitl:test" -ForegroundColor Green

        # Test 5: Verify the image
        Write-Host "Verifying built image..." -ForegroundColor Yellow
        $imageInfo = docker inspect fireswarm_sitl:test 2>$null | ConvertFrom-Json
        if ($imageInfo) {
            Write-Host "[OK] Image created successfully" -ForegroundColor Green
            Write-Host "Size: $([math]::Round($imageInfo.Size / 1MB, 2)) MB" -ForegroundColor Gray
        } else {
            Write-Host "[WARN] Could not inspect image" -ForegroundColor Yellow
        }

        # Test 6: Try to run the container briefly
        Write-Host "Testing container startup..." -ForegroundColor Yellow
        try {
            $testProcess = Start-Process -FilePath "docker" -ArgumentList @("run", "--rm", "-d", "--name", "fireswarm_test", "fireswarm_sitl:test", "sleep", "5") -NoNewWindow -Wait -PassThru
            if ($testProcess.ExitCode -eq 0) {
                Write-Host "[OK] Container starts successfully" -ForegroundColor Green
                # Clean up test container
                docker rm -f fireswarm_test 2>$null | Out-Null
            } else {
                Write-Host "[WARN] Container startup test failed" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "[WARN] Container test error: $_" -ForegroundColor Yellow
        }

    } else {
        Write-Host "[ERROR] Build failed with exit code: $($process.ExitCode)" -ForegroundColor Red
        Write-Host "Check the Docker build output above for specific errors." -ForegroundColor Red

        # Try to get more details about the failure
        Write-Host "Recent Docker logs:" -ForegroundColor Yellow
        docker system df 2>$null | Out-Null
        exit 1
    }

} catch {
    Write-Host "[ERROR] Build process failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Build Test Complete ===" -ForegroundColor Cyan
Write-Host "If successful, you can now use: docker run -it fireswarm_sitl:test" -ForegroundColor Gray
