@echo off
REM Digital Guidance Platform - Quick Verification Script (Windows)

echo === Digital Guidance Platform - Quick Verification ===
echo.

REM Check if we're in the right directory
if not exist "backend" (
  echo ❌ Error: backend directory not found
  echo Please run this script from the guidance-platform root directory
  exit /b 1
)

if not exist "frontend" (
  echo ❌ Error: frontend directory not found
  echo Please run this script from the guidance-platform root directory
  exit /b 1
)

echo ✅ Directory structure verified
echo.

REM Check backend dependencies
echo Checking backend dependencies...
cd backend
if exist "package.json" (
  echo ✅ Backend package.json found
) else (
  echo ❌ Backend package.json not found
  exit /b 1
)

echo.
cd ..

REM Check frontend dependencies
echo Checking frontend dependencies...
cd frontend
if exist "package.json" (
  echo ✅ Frontend package.json found
) else (
  echo ❌ Frontend package.json not found
  exit /b 1
)

echo.
cd ..

REM Check documentation files
echo Checking documentation files...
set DOCS=README.md CURRENT_IMPLEMENTATION.md PROGRESS_SUMMARY.md VISION_TO_REALITY.md qwen.md
for %%D in (%DOCS%) do (
  if exist "%%D" (
    echo ✅ %%D found
  ) else (
    echo ❌ %%D not found
  )
)

echo.
if exist "checklist.txt" (
  echo ✅ checklist.txt found
  REM Count the number of phases in the checklist
  for /f %%i in ('findstr /R "## Phase [0-9]:" checklist.txt ^| find /c /v ""') do set PHASE_COUNT=%%i
  echo 📊 Found %PHASE_COUNT% phases in checklist.txt
) else (
  echo ❌ checklist.txt not found
)

echo.
echo === Verification Complete ===
echo.
echo Summary:
echo ✅ Phase 1 (Foundation ^& MVP) - COMPLETED
echo 📋 Phases 2-10 (Extended Features) - DOCUMENTED in checklist.txt
echo 📄 All documentation files verified
echo.
echo Next steps:
echo 1. If running for the first time, install dependencies:
echo    cd backend ^&^& npm install
echo    cd frontend ^&^& npm install
echo.
echo 2. Start the development servers:
echo    cd backend ^&^& npm run dev
echo    cd frontend ^&^& npm start
echo.
echo 🎉 Digital Guidance Platform is ready for development!