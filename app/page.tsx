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

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setItems(data);
        setFilteredItems(data);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  // Filtering Logic
  useEffect(() => {
    let result = items;

    // 1. Category Filter
    if (activeCategory !== "All") {
      result = result.filter(item => item.category === activeCategory);
    }

    // 2. Search Filter (Title or Description)
    if (search) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredItems(result);
  }, [search, activeCategory, items]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-2xl animate-pulse">
      L.E. MARKETPLACE IS LOADING... 🏗️
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* --- HERO SECTION --- */}
      <section className="bg-white border-b-4 border-slate-900 pt-12 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 italic tracking-tighter mb-4">
            L.E. MARKET <span className="text-orange-600">🏗️</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs mb-10">
            Sasta Saaman, Asli Log. No Middleman.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => router.push("/post-item")} className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
              + Post Your Ad
            </button>
            <button onClick={() => router.push("/profile")} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] active:translate-y-1 active:shadow-none transition-all">
              My Profile 👷‍♂️
            </button>
          </div>
        </div>
      </section>

      {/* --- SEARCH & FILTERS --- */}
      <section className="max-w-6xl mx-auto -mt-10 px-6">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border-4 border-slate-900">
          <input 
            type="text" 
            placeholder="Search items (e.g. 'Cement', 'Tiles')..."
            className="w-full bg-slate-100 p-5 rounded-2xl font-bold text-slate-700 outline-none border-2 border-transparent focus:border-orange-500 transition-all mb-6"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                  ? "bg-orange-600 text-white" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- ITEMS GRID --- */}
      <section className="max-w-6xl mx-auto py-20 px-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-300 font-black text-4xl uppercase italic">No items found! 🔍</p>
            <p className="text-slate-400 font-bold mt-2 text-sm uppercase">Try searching for something else</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[3rem] overflow-hidden border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-2 transition-all">
                <img src={item.image_url} alt={item.title} className="w-full h-64 object-cover border-b-2 border-slate-900" />
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {item.category}
                    </span>
                    <p className="text-2xl font-black text-slate-900 italic">₹{item.price}</p>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase mb-3 truncate">{item.title}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-8 line-clamp-2 italic">"{item.description}"</p>
                  
                  <a 
                    href={`https://wa.me/${item.seller_phone}?text=Hello, I am interested in your ${item.title} listed on L.E. Marketplace.`}
                    target="_blank"
                    className="block w-full bg-green-500 text-white text-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-colors"
                  >
                    Contact Seller (WhatsApp)
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