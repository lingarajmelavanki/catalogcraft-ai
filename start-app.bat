@echo off
echo ========================================================
echo   Starting CatalogCraft AI (Backend + Frontend)
echo ========================================================

echo [1/3] Starting Backend API server on http://localhost:8000...
start "CatalogCraft Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Dev server on http://localhost:5173...
start "CatalogCraft Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] Opening Google Chrome...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:5173"
) else (
    start "" "http://localhost:5173"
)

echo.
echo Application is running! Keep the backend and frontend terminal windows open.
echo URL: http://localhost:5173
