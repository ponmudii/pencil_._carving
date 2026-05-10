# Graphite Gallery - Premium Sync (PowerShell Version)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GRAPHITE GALLERY - PREMIUM SYNC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check for Git and GH
try {
    git --version | Out-Null
    gh --version | Out-Null
} catch {
    Write-Host "[ERROR] Git or GitHub CLI not found. Please install them first." -ForegroundColor Red
    Pause
    exit
}

# 2. Get Task Info
$title = Read-Host "1. Enter Task Title"
if ([string]::IsNullOrWhiteSpace($title)) { $title = "UI Refinement" }

$desc = Read-Host "2. Enter Details"
if ([string]::IsNullOrWhiteSpace($desc)) { $desc = "Automated UI and code cleanup." }

$cleanTitle = $title -replace '"', '\"'
$cleanDesc = $desc -replace '"', '\"'

Write-Host ""
Write-Host "[1/5] Creating GitHub Issue..." -ForegroundColor Yellow
$issueUrl = gh issue create --title "$cleanTitle" --body "$cleanDesc"
if (-not $issueUrl) {
    Write-Host "[ERROR] Failed to create issue." -ForegroundColor Red
    Pause
    exit
}

$issueNum = $issueUrl.Split('/')[-1]
Write-Host "Issue #$issueNum created!" -ForegroundColor Green

# 3. Create branch
$branchName = "task-$issueNum"
Write-Host ""
Write-Host "[2/5] Creating branch: $branchName" -ForegroundColor Yellow
git checkout -b $branchName

# 4. Commit and Push
Write-Host ""
Write-Host "[3/5] Saving changes and uploading..." -ForegroundColor Yellow
git add .
git commit -m "$cleanTitle (Closes #$issueNum)"
git push -u origin $branchName

# 5. Create Pull Request (FULLY AUTOMATIC)
Write-Host ""
Write-Host "[4/5] Creating Pull Request..." -ForegroundColor Yellow
# --fill handles everything automatically
gh pr create --title "$cleanTitle" --body "$cleanDesc (Resolves #$issueNum)" --head $branchName --base main --fill

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PR CREATED! Profile graph updated." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Type 'ok' to merge to main and release"
if ($confirm -eq "ok") {
    Write-Host ""
    Write-Host "[5/5] Merging to Main..." -ForegroundColor Yellow
    gh pr merge --auto --merge --delete-branch
    git checkout main
    git pull
    Write-Host "SUCCESS! Your site is live." -ForegroundColor Green
} else {
    Write-Host "PR left open for manual merge." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done. Press any key to close."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
