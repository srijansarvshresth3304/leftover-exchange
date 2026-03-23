"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { alert("Bhai, dono dalo!"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert("Error: " + error.message); } 
    else { router.push("/"); setTimeout(() => window.location.reload(), 500); }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-orange-600 italic tracking-tighter leading-none mb-3">L.E. <span className="text-white">ACCESS</span></h1>
            <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px]">Contractor Dashboard Only</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-white/40 ml-4 mb-2 block">Registered Email</label>
              <input 
                type="email" 
                placeholder="contractor@le.com" 
                className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none transition-all font-bold text-white placeholder:text-white/10"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-white/40 ml-4 mb-2 block">Secure Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none transition-all font-bold text-white placeholder:text-white/10"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              onClick={handleLogin} 
              disabled={loading} 
              className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all active:scale-95 mt-4"
            >
              {loading ? "VERIFYING..." : "ENTER DASHBOARD 🚀"}
            </button>
            
            <p className="text-center text-white/20 text-[9px] font-bold uppercase tracking-widest mt-8">
              Managed by Supabase Security
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}