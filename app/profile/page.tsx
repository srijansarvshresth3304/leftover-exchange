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

      // Sirf is user ke items fetch karo
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
  const confirmDelete = confirm("Kya aap pakka is ad ko hatana chahte hain?");
  if (!confirmDelete) return;

  try {
    // 1. Storage se Photo delete karo (URL se filename nikal kar)
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    if (fileName) {
      const { error: storageError } = await supabase.storage
        .from('item-images')
        .remove([fileName]);
      if (storageError) console.error("Storage error:", storageError);
    }

    // 2. Database se Row delete karo
    const { error: dbError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    // 3. UI Update
    setMyItems(myItems.filter(item => item.id !== id));
    alert("Ad aur Photo dono safaya ho gaye! 🗑️✅");

  } catch (err: any) {
    alert("Error: " + err.message);
  }
};

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black">Loading Profile... 🏗️</div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 italic tracking-tighter">MY ADS 👷‍♂️</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Aapne ab tak kitna saaman list kiya hai</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push("/"))} className="bg-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-red-50 hover:text-red-600 transition-all">Logout 🚪</button>
        </div>

        {myItems.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-100">
            <p className="text-slate-400 font-black text-xl mb-4 text-center">Bhai, abhi tak kuch becha nahi? 🤔</p>
            <a href="/post-item" className="text-orange-600 font-black uppercase tracking-widest text-sm hover:underline">+ Pehla ad dalo</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] p-4 shadow-xl border border-slate-100 flex gap-4 items-center group">
                <img src={item.image_url} className="w-24 h-24 rounded-[1.5rem] object-cover" />
                <div className="flex-grow">
                  <h3 className="font-black text-slate-800 text-lg leading-tight mb-1">{item.title}</h3>
                  <p className="text-orange-600 font-black text-sm mb-3 italic">₹{item.price}</p>
                  <button 
                    onClick={() => handleDelete(item.id, item.image_url)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    Delete Ad 🗑️
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