"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PostItem() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Cement");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(""); 
  const [price, setPrice] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Bhai, pehle login toh kar lo!");
        router.push("/login");
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  const handlePost = async () => {
    if (!title || !pincode || !phone || !imageFile || !price) {
      alert("Saari details bharo bhai! Price aur Photo zaroori hai. 💰📸");
      return;
    }
    
    setLoading(true);

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("item-images").getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('items')
        .insert([{ 
            title, 
            category, 
            pincode, 
            quantity,
            price: parseFloat(price), // Number mein convert kiya
            whatsapp_number: phone, 
            image_url: publicUrl,
            seller_id: user.id 
        }]);

      if (dbError) throw dbError;

      alert("Mubarak ho! Saaman live ho gaya. 🚀");
      router.push("/"); 

    } catch (err: any) {
      alert("Error ho gaya bhai: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center font-black">Checking Access...</div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 flex items-center justify-center pb-20">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100">
        <h2 className="text-3xl font-black text-slate-800 mb-8 italic italic tracking-tighter">LIST YOUR ITEM 🏗️</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Item Title" className="p-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-bold text-slate-700" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-bold text-slate-700">
              <option>Cement</option><option>Tiles</option><option>Paint</option><option>Steel</option><option>Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity (e.g. 50 Bags)" className="p-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-bold text-slate-700" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price (₹)" className="p-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-bold text-slate-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input value={pincode} onChange={(e) => setPincode(e.target.value)} type="number" placeholder="Pincode" className="p-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-bold text-slate-700" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="number" placeholder="WhatsApp No." className="p-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-3xl outline-none font-bold text-slate-700" />
          </div>

          <div className="group relative border-4 border-dashed border-slate-100 p-10 rounded-[2.5rem] text-center bg-slate-50/50 hover:border-orange-200">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-slate-400 font-black text-sm uppercase tracking-widest group-hover:text-orange-600 transition-colors">
              {imageFile ? `✅ ${imageFile.name.substring(0,20)}...` : "Choose a Clear Photo 📸"}
            </div>
          </div>

          <button onClick={handlePost} disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 uppercase">
            {loading ? "Uploading..." : "Post Advertisement 🚀"}
          </button>
        </div>
      </div>
    </main>
  );
}