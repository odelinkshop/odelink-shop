# PostgreSQL Şifre Sıfırlama

## Yöntem 1: pg_hba.conf ile Trust Authentication (En Kolay)

1. **PostgreSQL servisini durdurun:**
   ```powershell
   Stop-Service postgresql-x64-13
   ```

2. **pg_hba.conf dosyasını düzenleyin:**
   - Dosya yolu: `C:\Program Files\PostgreSQL\13\data\pg_hba.conf`
   - Not Defteri'ni **Yönetici olarak** açın
   - Bu dosyayı açın
   - Şu satırı bulun:
     ```
     host    all             all             127.0.0.1/32            scram-sha-256
     ```
   - Şununla değiştirin:
     ```
     host    all             all             127.0.0.1/32            trust
     ```
   - Kaydedin

3. **PostgreSQL servisini başlatın:**
   ```powershell
   Start-Service postgresql-x64-13
   ```

4. **Şifreyi değiştirin:**
   ```powershell
   & "C:\Program Files\PostgreSQL\13\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
   ```

5. **pg_hba.conf'u geri alın:**
   - `trust` yerine tekrar `scram-sha-256` yazın
   - Servisi yeniden başlatın

## Yöntem 2: Başlat Menüsünden SQL Shell (psql)

1. Başlat menüsünde "SQL Shell (psql)" arayın ve açın
2. Enter, Enter, Enter, Enter (varsayılanları kabul et)
3. Şifre sorunca kurulumda girdiğiniz şifreyi girin
4. Bağlandıktan sonra:
   ```sql
   ALTER USER postgres WITH PASSWORD 'postgres';
   ```

## Yöntem 3: pgAdmin 4

1. Başlat menüsünde "pgAdmin 4" arayın ve açın
2. Sol tarafta "Servers" → "PostgreSQL 13" üzerine çift tıklayın
3. Kurulum şifrenizi girin
4. Sağ tıklayın "postgres" kullanıcısına → Properties → Definition
5. Yeni şifre: `postgres`
6. Save

---

**Hangisini tercih edersiniz?**
- Yöntem 1 en hızlı ama dosya düzenleme gerektirir
- Yöntem 2 en basit, sadece SQL Shell açıp şifre değiştirirsiniz
- Yöntem 3 görsel arayüz, daha kolay
