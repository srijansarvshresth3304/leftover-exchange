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
      try {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .order("created_at", { ascending: false });

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

  useEffect(() => {
    if (!items) return;
    let result = [...items];

    if (activeCategory !== "All") {
      result = result.filter(item => item?.category === activeCategory);
    }

    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter(item => 
        item?.title?.toLowerCase().includes(query) || 
        item?.description?.toLowerCase().includes(query)
      );
    }
    setFilteredItems(result);
  }, [search, activeCategory, items]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-slate-900 animate-pulse">
      L.E. MARKET IS LOADING... 🏗️
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900">
      {/* HEADER SECTION */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black italic tracking-tighter text-orange-600">L.E.🏗️</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push("/profile")} className="text-xs font-black uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">My Ads 👷‍♂️</button>
            <button onClick={() => router.push("/post-item")} className="text-xs font-black uppercase tracking-widest bg-orange-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-orange-200">Post Ad +</button>
          </div>
        </div>
      </nav>

      {/* SEARCH & FILTERS */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <input 
            type="text" 
            placeholder="Cement, Tiles, Sariya..."
            className="w-full bg-white border-2 border-slate-100 p-5 rounded-2xl font-bold text-lg shadow-sm focus:border-orange-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border transition-all whitespace-nowrap ${
                activeCategory === cat ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ITEMS LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-20 opacity-30">
              <p className="text-4xl font-black italic">NO ITEMS FOUND 📉</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col hover:shadow-2xl transition-all duration-300">
                {/* IMAGE BOX - Fixing the loading issue */}
                <div className="relative h-64 bg-slate-100">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🏗️</div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-orange-600 italic uppercase tracking-widest">{item.category}</p>
                  </div>
                </div>

                {/* CONTENT BOX */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-slate-800 uppercase leading-tight line-clamp-1">{item.title}</h3>
                    <p className="text-xl font-black text-slate-900 italic">₹{item.price}</p>
                  </div>
                  <p className="text-slate-500 text-xs font-medium italic line-clamp-2 mb-6">"{item.description}"</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Direct Dealer Contact
                    </div>
                    <a 
                      href={`https://wa.me/${item.seller_phone}?text=Bhai, I saw your ${item.title} on L.E. Marketplace. Is it available?`}
                      target="_blank"
                      className="bg-slate-900 text-white text-center py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-colors shadow-lg shadow-slate-200"
                    >
                      WhatsApp Seller 💬
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}