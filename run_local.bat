@echo off
echo ========================================
echo Disease Prediction System - Local Run
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Checking Python installation...
python --version
echo.

REM Check if dependencies are installed
echo [2/3] Checking dependencies...
cd ml_service
python -c "import flask, pandas, numpy, sklearn, joblib" >nul 2>&1
if errorlevel 1 (
    echo.
    echo Dependencies not found. Installing...
    echo This may take a few minutes...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        echo Please run: pip install -r ml_service\requirements.txt
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo Dependencies are installed.
    echo.
)

REM Start the server
echo [3/3] Starting ML Service...
echo.
echo ========================================
echo Server starting on http://localhost:5000
echo ========================================
echo.
echo The application will open in your browser automatically.
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Wait a moment then open browser
timeout /t 2 /nobreak >nul
start http://localhost:5000

REM Start the Flask server
python app.py

pause

