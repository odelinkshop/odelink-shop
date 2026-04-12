# PostgreSQL Şifre Sıfırlama Script'i
# Bu dosyayı PowerShell'de YÖNETİCİ OLARAK çalıştırın

Write-Host "1. PostgreSQL durduruluyor..." -ForegroundColor Yellow
Stop-Service postgresql-x64-13 -Force

Write-Host "2. pg_hba.conf yedekleniyor..." -ForegroundColor Yellow
Copy-Item "C:\Program Files\PostgreSQL\13\data\pg_hba.conf" "C:\Program Files\PostgreSQL\13\data\pg_hba.conf.backup"

Write-Host "3. pg_hba.conf düzenleniyor (şifresiz giriş)..." -ForegroundColor Yellow
$content = Get-Content "C:\Program Files\PostgreSQL\13\data\pg_hba.conf"
$content = $content -replace 'scram-sha-256', 'trust'
$content | Set-Content "C:\Program Files\PostgreSQL\13\data\pg_hba.conf"

Write-Host "4. PostgreSQL başlatılıyor..." -ForegroundColor Yellow
Start-Service postgresql-x64-13
Start-Sleep -Seconds 3

Write-Host "5. Şifre değiştiriliyor..." -ForegroundColor Yellow
& "C:\Program Files\PostgreSQL\13\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

Write-Host "6. pg_hba.conf geri yükleniyor..." -ForegroundColor Yellow
Copy-Item "C:\Program Files\PostgreSQL\13\data\pg_hba.conf.backup" "C:\Program Files\PostgreSQL\13\data\pg_hba.conf" -Force

Write-Host "7. PostgreSQL yeniden başlatılıyor..." -ForegroundColor Yellow
Restart-Service postgresql-x64-13
Start-Sleep -Seconds 3

Write-Host "8. Veritabanı oluşturuluyor..." -ForegroundColor Yellow
$env:PGPASSWORD='postgres'
& "C:\Program Files\PostgreSQL\13\bin\createdb.exe" -U postgres -h localhost odelink_shop

Write-Host "`n✅ TAMAMLANDI! Şifre: postgres" -ForegroundColor Green
Write-Host "Veritabanı: odelink_shop oluşturuldu" -ForegroundColor Green
