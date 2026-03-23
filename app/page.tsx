"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [selectedSeller, setSelectedSeller] = useState<any>(null); // Popup feature wapas aa gaya

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        profiles:seller_id (
          full_name,
          bio,
          location_city,
          trust_points
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error ❌:", error.message);
      return;
    }

    if (data) {
      setItems(data);
      setFilteredItems(data);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchItems();
  }, []);

  useEffect(() => {
    const results = items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pincode.includes(searchTerm)
    );
    setFilteredItems(results);
  }, [searchTerm, items]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      {/* 🧭 NAVBAR SECTION (Wapas Sahi Kiya) */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-orange-600 tracking-tighter italic">L.E.🏗️</h1>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <a href="/profile" className="text-slate-500 font-bold text-xs uppercase hover:text-orange-600 transition-colors">My Profile 👤</a>
                <a href="/post-item" className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all">+ Post</a>
              </>
            ) : (
              <a href="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Login</a>
            )}
          </div>
        </div>
      </nav>

      {/* ⚡ HERO & SEARCH SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-10">
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl mb-12">
          <h2 className="text-4xl font-black mb-2 leading-tight italic">Sasta Saaman,<br/>Asli Log.</h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Apne area ke contractors se direct judiye.</p>
          <div className="absolute top-0 right-0 p-10 text-9xl opacity-5 font-black italic select-none">BUILD</div>
        </div>

        <div className="max-w-xl mx-auto -mt-20 relative z-20">
          <input 
            type="text" placeholder="Pincode ya Item dhoondhein..." 
            className="w-full p-6 bg-white rounded-[2rem] shadow-2xl outline-none font-bold text-slate-700 border border-slate-100 focus:ring-4 ring-orange-500/20 transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* 📦 ITEMS GRID */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-[2.5rem] p-3 shadow-sm hover:shadow-xl transition-all border border-slate-100 group relative flex flex-col">
            <div className="h-60 rounded-[2rem] overflow-hidden bg-slate-100">
              <img 
                src={item.image_url || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </div>

            <div className="p-5 flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight">{item.title}</h3>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                  {item.category}
                </span>
              </div>
              
              {/* 💰 PRICING TAG */}
              <p className="text-orange-600 font-black text-2xl mb-4 tracking-tighter italic">₹{item.price || "Contact for Price"}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-slate-200">
                  📦 Qty: {item.quantity || "N/A"}
                </span>
                <span className="bg-blue-50 text-blue-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-blue-100">
                  📍 {item.pincode}
                </span>
              </div>
              
              {/* 👤 SELLER STRIP (Wapas Add Kiya) */}
              <div 
                onClick={() => setSelectedSeller(item.profiles)}
                className="flex items-center gap-2 mb-6 cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all border border-transparent hover:border-slate-100"
              >
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-black text-xs uppercase shadow-lg shadow-orange-100">
                  {item.profiles?.full_name?.[0] || "?"}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-800 leading-none">
                    {item.profiles?.full_name || "Unknown Seller"}
                  </p>
                  <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest mt-1">
                    ⭐ {item.profiles?.trust_points || 0} Trust Points
                  </p>
                </div>
              </div>

              {/* 💬 WHATSAPP BUTTON */}
              <button 
                onClick={() => {
                  const message = encodeURIComponent(
                    `Ram Ram bhai! 🙏\n\nMain aapka list kiya hua saaman *"${item.title}"* kharidne mein interested hoon jo maine *L.E.🏗️* par dekha.\n\nDaam: *₹${item.price}*\nLocation: *${item.pincode}*\n\nKya ye abhi mil jayega?`
                  );
                  window.open(`https://wa.me/91${item.whatsapp_number}?text=${message}`, '_blank');
                }}
                className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all active:scale-95 group"
              >
                <span className="group-hover:rotate-12 transition-transform text-xl">💬</span>
                I AM INTERESTED ✅
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🛡️ SELLER MODAL / POPUP (Wapas Add Kiya) */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setSelectedSeller(null)}>
          <div className="bg-white max-w-sm w-full rounded-[3rem] p-10 relative shadow-2xl animate-in zoom-in-95 duration-200 border-4 border-white" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedSeller(null)} className="absolute top-6 right-8 text-2xl font-black text-slate-300 hover:text-slate-600 transition-colors">×</button>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-orange-600 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-xl shadow-orange-100 rotate-3 transition-transform hover:rotate-0">
                {selectedSeller.full_name?.[0] || "U"}
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">{selectedSeller.full_name}</h2>
              <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center justify-center gap-1">
                Verified Seller ⭐ {selectedSeller.trust_points} Points
              </p>
              
              <div className="bg-slate-50 p-6 rounded-[2rem] mb-8 text-left border border-slate-100 shadow-inner">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">About Seller</p>
                <p className="text-slate-600 text-sm font-bold leading-relaxed italic">
                  "{selectedSeller.bio || "Bhai ne abhi bio nahi likha hai."}"
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                <span className="bg-slate-100 px-4 py-2 rounded-full border border-slate-200">📍 {selectedSeller.location_city || "Unknown"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}