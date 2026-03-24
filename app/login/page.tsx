"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from 'three';
// @ts-ignore
import * as random from "maath/random/dist/maath-random.esm";

function Stars() {
  const ref = useRef<THREE.Points>(null!);
  const [sphere] = useState(() => {
    const data = new Float32Array(5000);
    return random.inSphere(data, { radius: 1.5 });
  });
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#ea580c" size={0.005} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
}

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false); // Toggle state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) { alert("Bhai, details toh dalo!"); return; }
    setLoading(true);

    try {
      if (isSignup) {
        // --- SIGNUP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        alert("Signup Successful! Bhai, apna email check karo verification link ke liye.");
      } else {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}><Stars /></Canvas>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-orange-600 italic tracking-tighter leading-none mb-3">
              L.E. <span className="text-white">{isSignup ? "SIGNUP" : "ACCESS"}</span>
            </h1>
            <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px]">
              {isSignup ? "Create your dealer account" : "Enter your dashboard"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex bg-black/40 p-1 rounded-2xl mb-4 border border-white/5">
              <button 
                onClick={() => setIsSignup(false)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isSignup ? 'bg-orange-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsSignup(true)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSignup ? 'bg-orange-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Signup
              </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-white/40 ml-4 mb-2 block">Email Address</label>
              <input 
                type="email" placeholder="bhai@example.com" 
                className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none transition-all font-bold text-white placeholder:text-white/10"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-white/40 ml-4 mb-2 block">Password</label>
              <input 
                type="password" placeholder="••••••••" 
                className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none transition-all font-bold text-white placeholder:text-white/10"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              onClick={handleAuth} disabled={loading} 
              className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all active:scale-95 mt-4"
            >
              {loading ? "PROCESSING..." : isSignup ? "CREATE ACCOUNT ✨" : "ENTER DASHBOARD 🚀"}
            </button>

            <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-widest mt-6 cursor-pointer hover:text-orange-500 transition-colors" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Already have an account? Login" : "Don't have an account? Signup"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}