# GitHub Actions deployment durumunu kontrol et
Write-Host "🔍 GitHub Actions deployment durumu kontrol ediliyor..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment URL: https://github.com/odelinkshop/odelink-shop/actions" -ForegroundColor Yellow
Write-Host ""
Write-Host "Deployment tamamlandığında VDS'ye bağlanmak için:" -ForegroundColor Green
Write-Host "  ssh -i .ssh/vds_key -p 4383 root@VDS_IP_ADRESI" -ForegroundColor White
Write-Host ""
Write-Host "VDS'de kontrol komutları:" -ForegroundColor Green
Write-Host "  cd ~/odelink-shop" -ForegroundColor White
Write-Host "  docker ps" -ForegroundColor White
Write-Host "  docker logs odelink_backend --tail 50" -ForegroundColor White
Write-Host "  cat backend/.env | head -20" -ForegroundColor White
Write-Host "  curl http://127.0.0.1:5000/api/health" -ForegroundColor White
Write-Host "  curl http://127.0.0.1:5000/api/auth/google/config" -ForegroundColor White
Write-Host ""
