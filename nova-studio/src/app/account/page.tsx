"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const { setAuth, isLoggedIn, customer, logout } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/store-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.customer, data.token);
        router.push("/");
      } else {
        setMessage(data.error || "Giriş başarısız.");
      }
    } catch (err) {
      setMessage("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/store-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.customer, data.token);
        router.push("/");
      } else {
        setMessage(data.error || "Kayıt başarısız.");
      }
    } catch (err) {
      setMessage("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/store-auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setMessage("Şifre sıfırlama kodu gönderildi (E-Postanızı kontrol edin).");
      } else {
        setMessage("İşlem başarısız.");
      }
    } catch (err) {
      setMessage("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn && customer) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-48 pb-32 px-6 max-w-md mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-serif text-secondary uppercase tracking-tight">Hoş Geldin, {customer.name}</h1>
            <p className="text-xs text-secondary/40 tracking-widest uppercase">{customer.email}</p>
          </div>
          <Button onClick={logout} className="w-full bg-secondary text-primary py-6 h-auto font-bold tracking-widest uppercase">ÇIKIŞ YAP</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-48 pb-32 px-6 max-w-md mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif text-secondary uppercase tracking-tight">
            {mode === "login" ? "Giriş Yap" : mode === "register" ? "Hesap Oluştur" : "Şifre Sıfırla"}
          </h1>
          <p className="text-xs text-secondary/40 tracking-widest uppercase">
            {mode === "login" ? "Hesabınıza erişin" : mode === "register" ? "Koleksiyona katılın" : "E-Postanızı giriniz"}
          </p>
        </div>

        <form onSubmit={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot} className="space-y-6">
          {message && <div className="text-[10px] text-accent font-bold uppercase tracking-widest bg-accent/5 py-3 border border-accent/10">{message}</div>}
          
          <div className="space-y-4">
            {mode === "register" && (
              <input 
                type="text" 
                placeholder="AD SOYAD" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-secondary/10 py-4 outline-none text-xs tracking-widest uppercase focus:border-secondary transition-all"
              />
            )}
            
            <input 
              type="email" 
              placeholder="E-POSTA" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-secondary/10 py-4 outline-none text-xs tracking-widest uppercase focus:border-secondary transition-all"
            />
            
            {mode !== "forgot" && (
              <input 
                type="password" 
                placeholder="ŞİFRE" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-secondary/10 py-4 outline-none text-xs tracking-widest uppercase focus:border-secondary transition-all"
              />
            )}

            {mode === "register" && (
              <input 
                type="text" 
                placeholder="TELEFON (OPSİYONEL)" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent border-b border-secondary/10 py-4 outline-none text-xs tracking-widest uppercase focus:border-secondary transition-all"
              />
            )}
          </div>

          <div className="space-y-4">
            <Button disabled={loading} type="submit" className="w-full bg-secondary text-primary py-6 h-auto font-bold tracking-widest uppercase hover:brightness-125 transition-all">
              {loading ? "BEKLEYİN..." : mode === "login" ? "GİRİŞ YAP" : mode === "register" ? "KAYIT OL" : "KOD GÖNDER"}
            </Button>
            
            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} className="text-[10px] text-secondary/40 tracking-widest uppercase underline block mx-auto">
                Şifremi Unuttum
              </button>
            )}

            {mode !== "login" && (
              <button type="button" onClick={() => setMode("login")} className="text-[10px] text-secondary/40 tracking-widest uppercase underline block mx-auto">
                Giriş Sayfasına Dön
              </button>
            )}
          </div>
        </form>

        {mode === "login" && (
          <div className="pt-12 border-t border-secondary/5 space-y-6">
            <p className="text-[10px] text-secondary/40 tracking-widest uppercase">Henüz üye değil misiniz?</p>
            <Button variant="outline" onClick={() => setMode("register")} className="w-full border-secondary text-secondary py-6 h-auto font-bold tracking-widest uppercase hover:bg-secondary hover:text-primary transition-all">
              HESAP OLUŞTUR
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
