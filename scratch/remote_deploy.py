import paramiko
import time

host = "141.98.48.172"
user = "root"
password = "OCNtS3xPhbo4"

def run_remote_commands():
    try:
        print(f"🔗 Sunucuya bağlanılıyor: {host}...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(host, username=user, password=password, timeout=20)
        
        commands = [
            "cd /root/odelink-shop",
            "git fetch origin main",
            "git reset --hard origin/main",
            "npm install",
            "pm2 restart all",
            "echo '--- VDS RAPORU ---'",
            "df -h /",
            "free -h",
            "nproc",
            "lscpu | grep 'Model name'"
        ]
        
        full_command = " && ".join(commands)
        print("🚀 Komutlar gönderiliyor...")
        stdin, stdout, stderr = ssh.exec_command(full_command)
        
        output = stdout.read().decode()
        error = stderr.read().decode()
        
        if output:
            print("✅ ÇIKTI:\n", output)
        if error:
            print("⚠️ UYARI/HATA:\n", error)
            
        ssh.close()
        print("🏁 İşlem tamamlandı.")
        
    except Exception as e:
        print(f"❌ HATA: {str(e)}")

if __name__ == "__main__":
    run_remote_commands()
