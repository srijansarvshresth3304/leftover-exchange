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

  // 1. Fetch Data from Supabase
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

  // 2. Client-side Filtering Logic
  useEffect(() => {
    if (!items) return;

    let result = [...items];

    if (activeCategory !== "All") {
      result = result.filter((item) => item?.category === activeCategory);
    }

    if (search.trim() !== "") {
      const query = search.toLowerCase();
      result = result.filter(
        (item) =>
          (item?.title?.toLowerCase() || "").includes(query) ||
          (item?.description?.toLowerCase() || "").includes(query)
      );
    }
    setFilteredItems(result);
  }, [search, activeCategory, items]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-black text-slate-900">
        <div className="text-6xl animate-bounce mb-4">🏗️</div>
        <p className="tracking-tighter uppercase animate-pulse">L.E. MARKET LOADING...</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans pb-20">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black italic tracking-tighter text-orange-600 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            L.E.🏗️
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/profile")}
              className="text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100"
            >
              My Ads 👷‍♂️
            </button>
            <button
              onClick={() => router.push("/post-item")}
              className="text-[10px] font-black uppercase tracking-widest bg-orange-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all"
            >
              Post Ad +
            </button>
          </div>
        </div>
      </nav>

      {/* SEARCH SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Sariya, Cement, Tiles dhoondhein..."
              className="w-full bg-white border-2 border-slate-100 p-6 rounded-[2rem] font-bold text-lg shadow-sm focus:border-orange-500 outline-none transition-all pl-14"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-6 top-7 text-xl opacity-40">🔍</span>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest border transition-all whitespace-nowrap shadow-sm ${
                activeCategory === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-32 border-4 border-dashed border-slate-50 rounded-[3rem]">
              <p className="text-4xl font-black italic text-slate-200">NO ITEMS FOUND 📉</p>
              <p className="text-slate-400 font-bold mt-2 uppercase text-xs">Try another search bhai</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
              >
                {/* IMAGE BOX - Optimized with fallback */}
                <div className="relative h-72 bg-slate-50 overflow-hidden border-b border-slate-50">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as any).src = "https://placehold.co/600x400/f8fafc/ea580c?text=No+Image+Found";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl grayscale opacity-20">
                      🏗️
                    </div>
                  )}
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-orange-600 italic uppercase tracking-[0.2em]">
                      {item.category}
                    </p>
                  </div>
                </div>

                {/* INFO BOX */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-2xl font-black text-slate-800 uppercase leading-tight line-clamp-1 flex-1">
                      {item.title}
                    </h3>
                    <p className="text-2xl font-black text-orange-600 italic">₹{item.price}</p>
                  </div>
                  <p className="text-slate-400 text-xs font-bold italic line-clamp-2 mb-8 leading-relaxed">
                    "{item.description}"
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-50">
                    <a
                      href={`https://wa.me/${item.seller_phone}?text=Bhai, I saw your ${item.title} on L.E. Marketplace. Is it available?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-slate-900 text-white text-center py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-[#25D366] transition-all shadow-lg active:scale-95"
                    >
                      WhatsApp Seller 💬
                    </a>
                  </div>
                </div>
              </div>
            )))}
        </div>
      </section>
    </main>
  );
}