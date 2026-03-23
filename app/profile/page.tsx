"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [myItems, setMyItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserAndItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setMyItems(data);
      setLoading(false);
    };
    getUserAndItems();
  }, [router]);

  const handleDelete = async (id: string, imageUrl: string) => {
    const confirmDelete = confirm("Bhai, kya aap pakka is ad ko hatana chahte hain? Photo aur data dono ud jayenge.");
    if (!confirmDelete) return;

    try {
      // 1. Storage se Photo delete karo
      // URL format: .../storage/v1/object/public/item-images/filename.jpg
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('item-images')
          .remove([fileName]);
        
        if (storageError) {
          console.error("Storage delete error:", storageError.message);
          // Agar photo nahi milti toh bhi hum database se record delete hone denge
        }
      }

      // 2. Database se Row delete karo
      const { error: dbError } = await supabase
        .from("items")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // 3. UI Update (Bina refresh kiye item gayab)
      setMyItems(prev => prev.filter(item => item.id !== id));
      alert("Ad aur Photo dono safaya ho gaye! 🗑️✅");

    } catch (err: any) {
      alert("Kuch gadbad hui: " + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="animate-bounce text-4xl mb-4">🏗️</div>
      <p className="font-black text-slate-800 uppercase tracking-tighter">Aapka Profile Load ho raha hai...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none">
              MY ADS <span className="text-orange-600">.</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-3 bg-slate-100 inline-block px-2 py-1 rounded">
              {user?.email}
            </p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => router.push("/")}
                className="bg-white text-slate-800 px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Home 🏠
              </button>
             <button 
                onClick={() => supabase.auth.signOut().then(() => router.push("/"))} 
                className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                Logout 🚪
              </button>
          </div>
        </div>

        {/* Items Grid */}
        {myItems.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-100 shadow-inner">
            <p className="text-slate-400 font-black text-2xl mb-6">Bhai, abhi tak kuch becha nahi? 🤔</p>
            <button 
              onClick={() => router.push("/post-item")}
              className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-lg shadow-orange-200"
            >
              + Pehla ad dalo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-50 group hover:-translate-y-2 transition-all duration-300">
                <div className="relative h-48 w-full">
                  <img 
                    src={item.image_url} 
                    className="w-full h-full object-cover" 
                    alt={item.title}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                    <p className="text-orange-600 font-black text-sm italic">₹{item.price}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-black text-slate-800 text-xl leading-tight mb-2 uppercase truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Active Ad</p>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(item.id, item.image_url)}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                  >
                    Delete Permanently 🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}