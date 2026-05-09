# ═══════════════════════════════════════════════════════════
# NOVA THEME — DEEP INTEGRATION & FIX SCRIPT
# ═══════════════════════════════════════════════════════════

Write-Host "🚀 Nova Tema Entegrasyonu baslatiliyor..." -ForegroundColor Cyan

$RootPath = Resolve-Path ".."
$BackendPath = Join-Path $RootPath "backend"
$NovaPath = Join-Path $BackendPath "themes\Nova"
$PlatformPath = Join-Path $RootPath "platform"

# 1. Bağımlılık Kontrolü
Write-Host "📦 Bağımlılıklar kontrol ediliyor..." -ForegroundColor Yellow

if (!(Test-Path (Join-Path $NovaPath "node_modules"))) {
    Write-Host "⚠️ Nova node_modules eksik. Yukleniyor (Bu biraz zaman alabilir, 2GB+)..." -ForegroundColor Magenta
    Set-Location $NovaPath
    npm install
} else {
    Write-Host "✅ Nova node_modules hazir." -ForegroundColor Green
}

if (!(Test-Path (Join-Path $PlatformPath "node_modules"))) {
    Write-Host "⚠️ Platform node_modules eksik. Yukleniyor..." -ForegroundColor Magenta
    Set-Location $PlatformPath
    npm install
} else {
    Write-Host "✅ Platform node_modules hazir." -ForegroundColor Green
}

# 2. Port ve Env Kontrolü
Write-Host "⚙️ Port yapilandirmasi kontrol ediliyor..." -ForegroundColor Yellow
$NovaEnv = Join-Path $NovaPath ".env.local"
if (!(Test-Path $NovaEnv)) {
    "PORT=3001`nNEXT_PUBLIC_API_URL=http://localhost:5000" | Out-File -FilePath $NovaEnv -Encoding utf8
    Write-Host "✅ Nova .env.local olusturuldu (Port: 3001)" -ForegroundColor Green
}

# 3. Derleme (Build) Kontrolü
Write-Host "🏗️ Derleme durumu kontrol ediliyor..." -ForegroundColor Yellow
if (!(Test-Path (Join-Path $NovaPath ".next"))) {
    Write-Host "⚠️ Nova derlenmemis. Ilk derleme yapiliyor..." -ForegroundColor Magenta
    Set-Location $NovaPath
    npm run build
} else {
    Write-Host "✅ Nova derleme klasoru (.next) hazir." -ForegroundColor Green
}

# 4. Final
Write-Host "`n✨ NOVA ENTEGRASYONU TAMAMLANDI!" -ForegroundColor Cyan
Write-Host "Sistemi baslatmak icin 'scripts\BASLATMA_KOLAY.bat' dosyasini kullanabilirsiniz." -ForegroundColor White
Write-Host "Dashboard: http://localhost:3000"
Write-Host "Nova (Shop): http://localhost:5000/s/demo"
Write-Host "========================================`n"

Set-Location $RootPath
pause
