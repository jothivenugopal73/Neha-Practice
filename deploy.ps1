# ============================================
# NEHA AP PRECALC — AUTO DEPLOY SCRIPT
# Double-click this file to push to GitHub
# Netlify auto-deploys within 30 seconds
# ============================================
$ErrorActionPreference = "Stop"
$SiteFolder = "C:\Claude CoWork\Projects\Neha_Subject_Guru"

# Colors for output
function Write-Green($msg)  { Write-Host $msg -ForegroundColor Green }
function Write-Yellow($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Red($msg)    { Write-Host $msg -ForegroundColor Red }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   NEHA AP PRECALC — DEPLOY TO GITHUB"      -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1 — Check site folder exists
if (-not (Test-Path $SiteFolder)) {
    Write-Red "ERROR: Site folder not found at $SiteFolder"
    Write-Red "Please check your folder structure."
    pause
    exit 1
}

# Step 2 — Navigate to site folder
Set-Location $SiteFolder
Write-Yellow "Working in: $SiteFolder"

# Step 3 — Check index.html exists
if (-not (Test-Path "index.html")) {
    Write-Red "ERROR: index.html not found in $SiteFolder"
    Write-Red "Please make sure index.html is in the folder."
    pause
    exit 1
}
Write-Green "index.html found."

# Step 4 — Git status
Write-Host ""
Write-Yellow "Checking for changes..."
$changes = git status --porcelain
if (-not $changes) {
    Write-Yellow "No changes detected. Nothing to deploy."
    Write-Yellow "Make sure you saved the new index.html into the folder."
    pause
    exit 0
}
Write-Green "Changes detected:"
git status --short

# Step 5 — Stage all changes
Write-Host ""
Write-Yellow "Staging files..."
git add .
Write-Green "Files staged."

# Step 6 — Commit with timestamp
$timestamp = Get-Date -Format "dd-MM-yyyy HH:mm"
$commitMsg = "Update site - $timestamp"
Write-Host ""
Write-Yellow "Committing: $commitMsg"
git commit -m $commitMsg
Write-Green "Committed."

# Step 7 — Force push to GitHub
Write-Host ""
Write-Yellow "Pushing to GitHub..."
git push origin main --force
Write-Green "Pushed successfully!"

# Done
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Green "DONE! Netlify is deploying now."
Write-Green "Your site will be live in 30 seconds at:"
Write-Host "https://nehapractice.netlify.app" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
pause
