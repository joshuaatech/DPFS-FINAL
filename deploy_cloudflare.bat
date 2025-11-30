@echo off
REM Cloudflare Deployment Quick Start Script for Windows

echo.
echo ====================================
echo Cloudflare Deployment Quick Start
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed: %NODE_VERSION%

REM Check if wrangler is installed
wrangler --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo Installing Wrangler CLI...
    npm install -g wrangler
)
echo ✓ Wrangler is ready

REM Install dependencies
echo.
echo Installing npm dependencies...
npm install

echo.
echo ====================================
echo Choose an option:
echo ====================================
echo.
echo 1. Test locally (wrangler dev)
echo 2. Deploy Worker (wrangler deploy)
echo 3. Deploy Pages (wrangler pages deploy)
echo 4. Set ML Service URL secret
echo 5. View logs (wrangler tail)
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo Starting local development server...
    echo API will be available at: http://localhost:8787/api/
    echo Press Ctrl+C to stop
    echo.
    wrangler dev
) else if "%choice%"=="2" (
    echo.
    echo Deploying Worker to Cloudflare...
    wrangler deploy
    echo.
    echo ✓ Worker deployed!
    pause
) else if "%choice%"=="3" (
    echo.
    echo Deploying Frontend to Cloudflare Pages...
    wrangler pages deploy public/
    echo.
    echo ✓ Frontend deployed!
    pause
) else if "%choice%"=="4" (
    echo.
    echo Setting ML Service URL secret...
    echo Enter your ML service URL (e.g., https://your-ml-service.railway.app):
    set /p ml_url="ML_SERVICE_URL: "
    echo %ml_url% | wrangler secret put ML_SERVICE_URL
    echo.
    echo ✓ Secret saved!
    pause
) else if "%choice%"=="5" (
    echo.
    echo Viewing recent logs...
    echo Press Ctrl+C to exit
    echo.
    wrangler tail
) else (
    echo.
    echo Exiting...
)
