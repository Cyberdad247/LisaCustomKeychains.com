# setup-ollama.ps1 — Install Ollama + pull the best free model for this project.
# Run: pwsh scripts/setup-ollama.ps1

Write-Host ""
Write-Host "  CAMELOT-OS · Ollama Free LLM Setup" -ForegroundColor Cyan
Write-Host "  =====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is installed
$ollamaInstalled = Get-Command ollama -ErrorAction SilentlyContinue

if (-not $ollamaInstalled) {
    Write-Host "  [1/3] Ollama not found. Opening download page..." -ForegroundColor Yellow
    Write-Host "  → Download from: https://ollama.com/download" -ForegroundColor White
    Write-Host ""
    Start-Process "https://ollama.com/download"
    Write-Host "  After installing Ollama, re-run this script." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "  [1/3] Ollama is installed ✓" -ForegroundColor Green
}

# Pull recommended model
$model = "llama3.2"
Write-Host ""
Write-Host "  [2/3] Pulling model: $model (2GB, free)" -ForegroundColor Yellow
Write-Host "  This is a one-time download. Runs fully offline after." -ForegroundColor White
Write-Host ""
ollama pull $model

if ($LASTEXITCODE -ne 0) {
    Write-Host "  Model pull failed. Make sure Ollama is running." -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "  Model ready ✓" -ForegroundColor Green

# Write env vars to .env.local
$envFile = ".env.local"
$envLine = "`nOLLAMA_BASE_URL=http://localhost:11434"
$modelLine = "`nOLLAMA_MODEL=llama3.2"

Write-Host ""
Write-Host "  [3/3] Adding OLLAMA_BASE_URL to $envFile..." -ForegroundColor Yellow

if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    if ($content -notmatch "OLLAMA_BASE_URL") {
        Add-Content $envFile $envLine
        Add-Content $envFile $modelLine
        Write-Host "  Added env vars ✓" -ForegroundColor Green
    } else {
        Write-Host "  OLLAMA_BASE_URL already in $envFile ✓" -ForegroundColor Green
    }
} else {
    "OLLAMA_BASE_URL=http://localhost:11434`nOLLAMA_MODEL=llama3.2" | Out-File $envFile -Encoding utf8
    Write-Host "  Created $envFile ✓" -ForegroundColor Green
}

Write-Host ""
Write-Host "  =====================================" -ForegroundColor Cyan
Write-Host "  Setup complete! Ollama will run free & local." -ForegroundColor Green
Write-Host ""
Write-Host "  To start Ollama:  ollama serve" -ForegroundColor White
Write-Host "  To use in app:    npm run dev  (no API key needed)" -ForegroundColor White
Write-Host ""
Write-Host "  The Hermes AI assistant now runs on $model locally." -ForegroundColor White
Write-Host ""
Write-Host "  OPTIONAL — Also add a free Gemini key for production (Vercel):" -ForegroundColor Yellow
Write-Host "  → https://aistudio.google.com/app/apikey" -ForegroundColor White
Write-Host "  → Add GOOGLE_AI_API_KEY in Vercel env vars" -ForegroundColor White
Write-Host ""
