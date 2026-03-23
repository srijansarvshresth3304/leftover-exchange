"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // OTP ki jagah Password
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Bhai, Email aur Password dono dalo!");
      return;
    }

    setLoading(true);
    
    // 🔑 Dashboard wale user se login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Login Nahi Hua: " + error.message);
    } else {
      console.log("Login Success:", data);
      router.push("/"); // Seedha Home page pe
      // Page refresh taaki navbar update ho jaye
      setTimeout(() => window.location.reload(), 500);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-orange-600 mb-2 italic tracking-tighter">
            L.E. 🏗️
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Contractor Dashboard Access
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Email Address</label>
            <input 
              type="email" 
              placeholder="test@example.com" 
              className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none transition-all font-bold text-slate-700"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-1 block">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none transition-all font-bold text-slate-700"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            onClick={handleLogin} 
            disabled={loading} 
            className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95 mt-4"
          >
            {loading ? "CHECKING ACCESS..." : "LOGIN TO ACCOUNT 🚀"}
          </button>
          
          <p className="text-center text-slate-400 text-xs font-medium mt-6">
            Bhul gaye? Supabase Dashboard se reset karo!
          </p>
        </div>
      </div>
    </main>
  );
}