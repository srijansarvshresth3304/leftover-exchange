"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from 'three';
// @ts-ignore
import * as random from "maath/random/dist/maath-random.esm";

// --- 3D Background (Consistently used across all pages) ---
function Stars() {
  const ref = useRef<THREE.Points>(null!);
  const [sphere] = useState(() => {
    const data = new Float32Array(5000);
    // @ts-ignore
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

export default function PostItem() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Cement");
  const [description, setDescription] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  const handlePost = async () => {
    if (!title || !pincode || !phone || !imageFile || !price || !description) {
      alert("Bhai, saari details bharna zaroori hai! Description aur Photo miss mat karo. 💰📸");
      return;
    }
    
    setLoading(true);

    try {
      // 1. Photo Upload
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // Unique name using timestamp
      
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);

      // 3. Database Insert
      const { error: dbError } = await supabase
        .from('items')
        .insert([{ 
            title, 
            category, 
            description,
            pincode, 
            quantity,
            price: parseFloat(price),
            seller_phone: phone, // Name matched with home page field
            image_url: publicUrl,
            seller_id: user.id 
        }]);

      if (dbError) throw dbError;

      alert("Mubarak ho! Saaman Market mein live ho gaya. 🚀");
      router.push("/"); 

    } catch (err: any) {
      alert("Lafda ho gaya: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="h-screen w-full flex items-center justify-center bg-black text-orange-600 font-black">CHECKING AUTH...</div>;

  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars />
        </Canvas>
      </div>

      <div className="relative z-10 p-6 md:p-10">
        {/* Simple Header */}
        <div className="max-w-2xl mx-auto mb-10 flex justify-between items-center">
            <h1 className="text-3xl font-black italic tracking-tighter text-orange-500">NEW LISTING <span className="text-white">.</span></h1>
            <button onClick={() => router.push("/")} className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all">Cancel ✕</button>
        </div>

        <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-3xl rounded-[3rem] shadow-2xl p-8 md:p-12 border border-white/10">
          <div className="space-y-6">
            
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4">Item Name</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. UltraTech Cement" className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none font-bold text-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none font-bold text-white transition-all appearance-none">
                  <option className="bg-[#111]">Cement</option>
                  <option className="bg-[#111]">Tiles</option>
                  <option className="bg-[#111]">Paint</option>
                  <option className="bg-[#111]">Steel</option>
                  <option className="bg-[#111]">Bricks</option>
                  <option className="bg-[#111]">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 ml-4">Short Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bhai, saaman ki khasiyat batao..." className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none font-bold text-white h-24 resize-none transition-all" />
            </div>

            {/* Quantity & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4">Total Quantity</label>
                <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 100 Bags / 2 Ton" className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none font-bold text-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4">Price (₹)</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="450" className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none font-bold text-white transition-all" />
              </div>
            </div>

            {/* PIN & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4">Area Pincode</label>
                <input value={pincode} onChange={(e) => setPincode(e.target.value)} type="number" placeholder="848101" className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none font-bold text-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 ml-4">WhatsApp Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" placeholder="91XXXXXXXX" className="w-full p-5 bg-white/5 border border-white/10 focus:border-orange-500 rounded-3xl outline-none font-bold text-white transition-all" />
              </div>
            </div>

            {/* Photo Upload Area */}
            <div className="group relative border-2 border-dashed border-white/10 p-10 rounded-[2.5rem] text-center bg-white/5 hover:border-orange-500/50 transition-all cursor-pointer">
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">📸</span>
                <div className="text-white/40 font-black text-[10px] uppercase tracking-widest group-hover:text-orange-500 transition-colors">
                  {imageFile ? `✅ ${imageFile.name.substring(0,25)}` : "Upload Product Photo"}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button onClick={handlePost} disabled={loading} className="w-full bg-orange-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Engine Initializing..." : "Launch Advertisement 🚀"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}