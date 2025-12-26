@echo off
echo.
echo ========================================
echo   VERCEL + RAILWAY DEPLOYMENT SETUP
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo [INFO] Initializing Git repository...
    git init
    echo [OK] Git initialized
    echo.
)

REM Check if remote exists
git remote | findstr "origin" >nul
if errorlevel 1 (
    echo [INFO] Please enter your GitHub repository URL:
    echo Example: https://github.com/yourusername/ads-manager-brutalist.git
    set /p GITHUB_URL="GitHub URL: "
    
    git remote add origin %GITHUB_URL%
    echo [OK] Remote added
    echo.
)

REM Add all files
echo [INFO] Adding files to git...
git add .
echo [OK] Files staged
echo.

REM Commit
echo [INFO] Creating commit...
git commit -m "Setup: Vercel + Railway deployment configuration"
echo [OK] Commit created
echo.

REM Push
echo [INFO] Pushing to GitHub...
git branch -M main
git push -u origin main
echo [OK] Pushed to GitHub
echo.

echo ========================================
echo   CODE PUSHED SUCCESSFULLY!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Setup MongoDB Atlas:
echo    - Go to: https://cloud.mongodb.com
echo    - Create M0 Free Cluster in Singapore
echo    - Get connection string
echo.
echo 2. Deploy Backend to Railway:
echo    - Go to: https://railway.app
echo    - New Project -^> Deploy from GitHub
echo    - Select your repository
echo    - Add environment variables
echo.
echo 3. Deploy Frontend to Vercel:
echo    - Go to: https://vercel.com/new
echo    - Import your GitHub repository
echo    - Add VITE_API_URL environment variable
echo.
echo 4. Read full guide: DEPLOY_VERCEL_RAILWAY.md
echo.
echo [SUCCESS] Setup complete! Happy deploying!
echo.
pause
