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

export default function PostItem() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
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
      if (!user) router.push("/login");
      else setUser(user);
    };
    checkUser();
  }, [router]);

  const handlePost = async () => {
    if (!title || !pincode || !phone || !imageFile || !price || !description) {
      alert("Saari details bharo bhai! Description aur Photo zaroori hai. 📸");
      return;
    }
    setLoading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("item-images").upload(fileName, imageFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('items').insert([{ 
          title, category, description, pincode, quantity,
          price: parseFloat(price), seller_phone: phone, 
          image_url: publicUrl, seller_id: user.id 
      }]);

      if (dbError) throw dbError;
      alert("Listing Live ho gayi! 🚀");
      router.push("/");
    } catch (err: any) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  if (!user) return <div className="h-screen w-full bg-black text-orange-500 flex items-center justify-center font-black">ACCESSING...</div>;

  return (
    <main className="relative min-h-screen bg-[#050505] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none"><Canvas camera={{ position: [0, 0, 1] }}><Stars /></Canvas></div>
      <div className="relative z-10 p-6 max-w-2xl mx-auto">
        <h2 className="text-4xl font-black italic text-orange-500 mb-10 tracking-tighter">POST NEW AD</h2>
        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 space-y-6">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item Title" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold text-white">
            <option className="bg-black">Cement</option><option className="bg-black">Tiles</option><option className="bg-black">Steel</option><option className="bg-black">Paint</option><option className="bg-black">Other</option>
          </select>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold h-24" />
          <div className="grid grid-cols-2 gap-4">
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty (e.g. 50 Bags)" className="p-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price ₹" className="p-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input value={pincode} onChange={(e) => setPincode(e.target.value)} type="number" placeholder="PIN" className="p-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" placeholder="WhatsApp No." className="p-5 bg-white/5 border border-white/10 rounded-2xl outline-none font-bold" />
          </div>
          <div className="relative border-2 border-dashed border-white/10 p-10 rounded-3xl text-center bg-white/5">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
            <p className="text-white/40 font-black uppercase text-[10px] tracking-widest">{imageFile ? `✅ ${imageFile.name.substring(0,20)}` : "Click to Upload Photo"}</p>
          </div>
          <button onClick={handlePost} disabled={loading} className="w-full bg-orange-600 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all">
            {loading ? "Posting..." : "Launch Ad 🚀"}
          </button>
        </div>
      </div>
    </main>
  );
}