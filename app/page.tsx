"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from 'three';
// @ts-ignore
import * as random from "maath/random/dist/maath-random.esm";

// --- 3D Background Component ---
function Stars() {
  // Ref ko properly type kiya taaki rotation error na de
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
        <PointMaterial 
          transparent 
          color="#ea580c" 
          size={0.005} 
          sizeAttenuation={true} 
          depthWrite={false} 
        />
      </Points>
    </group>
  );
}

// --- Main Home Component ---
export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();

  const categories = ["All", "Cement", "Tiles", "Steel", "Paint", "Bricks", "Others"];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await supabase.from("items").select("*").order("created_at", { ascending: false });
        if (data) { 
          setItems(data); 
          setFilteredItems(data); 
        }
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (!items) return;
    let result = items.filter(item => 
      (activeCategory === "All" || item.category === activeCategory) &&
      (item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredItems(result);
  }, [search, activeCategory, items]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-orange-600 font-black text-2xl tracking-tighter">
      INITIALIZING ENGINE... 🏗️
    </div>
  );

  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden">
      
      {/* --- THREE.JS BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars />
        </Canvas>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10">
        
        {/* NAVBAR */}
        <nav className="flex justify-between items-center p-6 backdrop-blur-xl border-b border-white/10 sticky top-0 bg-black/20">
          <h1 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent cursor-pointer" onClick={() => router.push("/")}>
            L.E. MARKET
          </h1>
          <div className="flex gap-4">
            <button onClick={() => router.push("/profile")} className="hidden sm:block text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-all">Dashboard 👷‍♂️</button>
            <button onClick={() => router.push("/post-item")} className="text-[10px] font-bold uppercase tracking-widest bg-orange-600 px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(234,88,12,0.5)] transition-all">Sell Now +</button>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="px-6 py-20 text-center">
          <h2 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter uppercase leading-none">
            Build Faster.<br /><span className="text-orange-500">Buy Direct.</span>
          </h2>
          <p className="text-white/40 font-medium tracking-[0.3em] text-[10px] uppercase mb-12">Bihar's Premium Construction Hub</p>
          
          {/* SEARCH BAR */}
          <div className="max-w-3xl mx-auto relative group">
            <input 
              type="text" 
              placeholder="Sariya, Cement, Tiles..."
              className="w-full bg-white/5 border border-white/10 backdrop-blur-2xl p-6 rounded-3xl text-xl font-bold outline-none focus:border-orange-500/50 transition-all shadow-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-orange-600 border-orange-600' : 'bg-white/5 border-white/10 hover:border-white/40'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ITEMS GRID */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item.id} className="group relative bg-white/5 border border-white/10 backdrop-blur-md rounded-[2.5rem] overflow-hidden hover:border-orange-500/50 transition-all duration-500">
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/111/orange?text=No+Photo")}
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-orange-500 border border-orange-500/30">
                    {item.category}
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black uppercase tracking-tight truncate flex-1 mr-4">{item.title}</h3>
                    <p className="text-2xl font-black text-orange-500 italic">₹{item.price}</p>
                  </div>
                  <p className="text-white/40 text-xs font-medium italic line-clamp-2 mb-8 leading-relaxed">"{item.description}"</p>
                  
                  <a 
                    href={`https://wa.me/${item.seller_phone}?text=Bhai, I want to buy ${item.title}`}
                    target="_blank"
                    className="block w-full bg-white text-black text-center py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 hover:text-white transition-all shadow-lg"
                  >
                    Contact Dealer
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-20 opacity-20">
              <p className="text-4xl font-black italic">NO STOCK FOUND 📦</p>
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #ea580c; }
      `}</style>
    </main>
  );
}