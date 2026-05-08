# ============================================
# NEHA AP PRECALC — AUTO DEPLOY SCRIPT
# Double-click this file to push to GitHub
# Netlify auto-deploys within 30 seconds
# ============================================
$ErrorActionPreference = "Continue"
$SiteFolder = "C:\Claude CoWork\Projects\Neha_Subject_Guru"
$NetlifyURL = "https://nehapractice.netlify.app"
$GitHubRepo = "https://github.com/jothivenugopal73/Neha-Practice.git"

function Write-Green($msg)  { Write-Host $msg -ForegroundColor Green }
function Write-Yellow($msg) { Write-Host $msg -ForegroundColor Yellow }
function Write-Red($msg)    { Write-Host $msg -ForegroundColor Red }

try {

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "   NEHA AP PRECALC -- DEPLOY TO GITHUB"     -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""

    # Step 1 - Check folder
    if (-not (Test-Path $SiteFolder)) {
        Write-Red "ERROR: Folder not found: $SiteFolder"
        Write-Host ""; Write-Host "Press any key to close..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown"); exit 1
    }

    Set-Location $SiteFolder
    Write-Yellow "Working in: $SiteFolder"

    # Step 2 - Check index.html
    if (-not (Test-Path "index.html")) {
        Write-Red "ERROR: index.html not found in $SiteFolder"
        Write-Host ""; Write-Host "Press any key to close..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown"); exit 1
    }
    Write-Green "index.html found."

    # Step 3 - Set credential helper
    git config --global credential.helper wincred
    Write-Green "Credential helper set (Windows Credential Manager)."

    # Step 4 - Init git if needed
    if (-not (Test-Path ".git")) {
        Write-Host ""
        Write-Yellow "First time setup - initialising git..."
        git init
        git branch -M main
        git remote add origin $GitHubRepo
        Write-Green "Git initialised."
    } else {
        git remote set-url origin $GitHubRepo
        Write-Green "Remote URL confirmed."
    }

    # Step 5 - Check for changes
    Write-Host ""
    Write-Yellow "Checking for changes..."
    $changes = git status --porcelain
    if (-not $changes) {
        Write-Yellow "No changes detected - nothing to deploy."
        Write-Yellow "Update and save index.html to the folder first."
        Write-Host ""; Write-Host "Press any key to close..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown"); exit 0
    }
    Write-Green "Changes found:"
    git status --short

    # Step 6 - Stage
    Write-Host ""
    Write-Yellow "Staging files..."
    git add .
    Write-Green "Files staged."

    # Step 7 - Commit
    $timestamp = Get-Date -Format "dd-MM-yyyy HH:mm"
    $commitMsg = "Update -- $timestamp"
    Write-Host ""
    Write-Yellow "Committing: $commitMsg"
    git commit -m $commitMsg
    Write-Green "Committed."

    # Step 8 - Push
    Write-Host ""
    Write-Yellow "Pushing to GitHub..."
    Write-Yellow "If a login popup appears:"
    Write-Yellow "  Username : jothivenugopal73"
    Write-Yellow "  Password : your Personal Access Token (not your GitHub password)"
    Write-Host ""
    git push origin main

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Green "DONE! Netlify is deploying now."
        Write-Green "Live in ~30 seconds at:"
        Write-Host $NetlifyURL -ForegroundColor Cyan
        Write-Host "============================================" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Red "Push failed. To fix:"
        Write-Red "1. github.com -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic)"
        Write-Red "2. Generate new token -> tick 'repo' -> copy it"
        Write-Red "3. Run this script again and paste the token as your password"
    }

} catch {
    Write-Host ""
    Write-Red "UNEXPECTED ERROR:"
    Write-Red $_.Exception.Message
    Write-Host $_ -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to close..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
