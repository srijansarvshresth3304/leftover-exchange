"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();

  const categories = ["All", "Cement", "Tiles", "Steel", "Paint", "Bricks", "Others"];

  // 1. Database se data lana
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) {
          setItems(data);
          setFilteredItems(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // 2. Search aur Category Filtering Logic (CRASH-FREE)
  useEffect(() => {
    if (!items) return;

    let result = [...items];

    // Category Filter
    if (activeCategory !== "All") {
      result = result.filter(item => item?.category === activeCategory);
    }

    // Search Filter (Safe checking with optional chaining)
    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter(item => {
        const titleMatch = item?.title?.toLowerCase().includes(query);
        const descMatch = item?.description?.toLowerCase().includes(query);
        return titleMatch || descMatch;
      });
    }

    setFilteredItems(result);
  }, [search, activeCategory, items]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-6xl animate-bounce mb-4">🏗️</div>
      <p className="font-black text-slate-900 tracking-tighter uppercase">L.E. Market Load Ho Raha Hai...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* --- HERO SECTION --- */}
      <section className="bg-white border-b-4 border-slate-900 pt-16 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-7xl md:text-9xl font-black text-slate-900 italic tracking-tighter mb-6 select-none">
            L.E. MARKET <span className="text-orange-600">.</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-12">
            Bihar's First Direct Construction Marketplace
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => router.push("/post-item")} 
              className="bg-orange-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] active:translate-y-2 active:shadow-none transition-all"
            >
              + Post Your Ad
            </button>
            <button 
              onClick={() => router.push("/profile")} 
              className="bg-white text-slate-900 border-4 border-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] active:translate-y-2 active:shadow-none transition-all"
            >
              My Profile 👷‍♂️
            </button>
          </div>
        </div>
      </section>

      {/* --- SEARCH & CATEGORY BAR --- */}
      <section className="max-w-6xl mx-auto -mt-12 px-6 relative z-10">
        <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-slate-900">
          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder="Sariya, Cement ya Tiles dhoondhein..."
              className="w-full bg-slate-100 p-6 rounded-[1.5rem] font-bold text-slate-800 outline-none border-4 border-transparent focus:border-orange-500 transition-all text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute right-6 top-7 text-2xl">🔍</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                  ? "bg-slate-900 text-white scale-105 shadow-lg" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- ITEMS LIST --- */}
      <section className="max-w-7xl mx-auto py-24 px-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-300 font-black text-5xl uppercase italic mb-4">No results! 📉</p>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Kuch aur search karke dekhein bhai</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[3.5rem] overflow-hidden border-4 border-slate-900 shadow-[15px_15px_0px_0px_rgba(15,23,42,1)] group hover:-translate-y-3 transition-all duration-300">
                <div className="h-72 overflow-hidden border-b-4 border-slate-900 relative">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-2xl border-2 border-slate-900">
                    <p className="text-orange-600 font-black text-xl italic">₹{item.price}</p>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.category}</p>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 uppercase mb-4 truncate">{item.title}</h3>
                  <p className="text-slate-500 text-sm font-bold mb-10 line-clamp-2 italic leading-relaxed">"{item.description}"</p>
                  
                  <a 
                    href={`https://wa.me/${item.seller_phone}?text=Bhai, mujhe aapka ad '${item.title}' pasand aaya hai. Kya ye available hai?`}
                    target="_blank"
                    className="block w-full bg-[#25D366] text-white text-center py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-[0px_6px_0px_0px_#128C7E] hover:shadow-none hover:translate-y-1 transition-all"
                  >
                    Chat on WhatsApp 💬
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}