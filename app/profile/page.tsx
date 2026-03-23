"use client";
import { useEffect, useState, useRef } from "react";
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

export default function Profile() {
  const [myItems, setMyItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const { data } = await supabase.from("items").select("*").eq("seller_id", user.id).order("created_at", { ascending: false });
      if (data) setMyItems(data);
      setLoading(false);
    };
    getUserData();
  }, [router]);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Bhai, pakka ad hatana hai? Photo aur data dono ud jayenge.")) return;
    try {
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) await supabase.storage.from('item-images').remove([fileName]);
      }
      await supabase.from("items").delete().eq("id", id);
      setMyItems(prev => prev.filter(item => item.id !== id));
      alert("Ad Safaya! 🗑️");
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-orange-600 font-black text-2xl tracking-tighter uppercase italic">
      LOADING PROFILE... 🏗️
    </div>
  );

  return (
    <main className="relative min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none"><Canvas camera={{ position: [0, 0, 1] }}><Stars /></Canvas></div>
      <div className="relative z-10">
        <nav className="flex justify-between items-center p-6 backdrop-blur-xl border-b border-white/10 sticky top-0 bg-black/40">
          <h1 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent cursor-pointer" onClick={() => router.push("/")}>L.E. MARKET</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push("/")} className="text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all">Home 🏠</button>
            <button onClick={() => supabase.auth.signOut().then(() => router.push("/"))} className="text-[10px] font-bold uppercase tracking-widest bg-red-600/20 text-red-500 px-5 py-2 rounded-full border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">Logout 🚪</button>
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <header className="mb-12">
            <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">Your <span className="text-orange-500">Inventory</span></h2>
            <p className="text-white/40 font-medium tracking-[0.3em] text-[10px] uppercase mt-2 bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">{user?.email}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myItems.map((item) => (
              <div key={item.id} className="group bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={item.image_url || "https://placehold.co/600x400/111/orange?text=No+Photo"} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/111/orange?text=No+Photo")} 
                  />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase border border-white/10">Qty: {item.quantity}</span>
                    <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase border border-white/10">PIN: {item.pincode}</span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase truncate mr-2">{item.title}</h3>
                    <p className="text-xl font-black text-orange-500 italic">₹{item.price}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(item.id, item.image_url)}
                    className="w-full bg-red-600/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    Delete Ad Permanently 🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}