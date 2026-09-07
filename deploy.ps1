# GYMIN Quick Deployment Helper Script
param (
    [string]$GithubRepoUrl = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       GYMIN Production Deployment      " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# 1. Check Git Status
Write-Host "`n[1/3] Checking Git repository status..." -ForegroundColor Yellow
git status --short

# 2. Push to GitHub if repository URL provided
if ($GithubRepoUrl) {
    Write-Host "`n[2/3] Configuring GitHub remote ($GithubRepoUrl)..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin $GithubRepoUrl
    git branch -M main
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "Failed to push. Please check your GitHub credentials or permissions." -ForegroundColor Red
    }
} else {
    Write-Host "`n[2/3] Skipping GitHub push (No repository URL provided)." -ForegroundColor DarkGray
    Write-Host "To link GitHub, run: .\deploy.ps1 -GithubRepoUrl https://github.com/<username>/<repo>.git" -ForegroundColor DarkGray
}

# 3. Deploy to Vercel
Write-Host "`n[3/3] Launching Vercel deployment..." -ForegroundColor Yellow
npx vercel
