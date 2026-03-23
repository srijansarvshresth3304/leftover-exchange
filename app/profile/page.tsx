"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setBio(data.bio || "");
        setCity(data.location_city || "");
      }
    };
    fetchProfile();
  }, [router]);

  const updateProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      bio: bio,
      location_city: city
    }).eq("id", user?.id);

    if (error) alert(error.message);
    else alert("Profile Update Ho Gayi! ✅");
    setLoading(false);
  };

  if (!profile) return <div className="p-20 text-center font-bold">Loading Profile...</div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-4 border-4 border-white shadow-lg">
            {fullName[0] || "U"}
          </div>
          <h2 className="text-2xl font-black text-slate-800">Apni Pehchaan Banayein</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Trust Points: ⭐️ {profile.trust_points}</p>
        </div>

        <div className="space-y-6">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Poora Naam" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-orange-500 font-bold" />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sheher (e.g. Patna, Bihar)" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-orange-500 font-bold" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Apne baare mein batayein (e.g. 10 saal ka experience as a Mason)" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-orange-500 font-medium h-32" />
          
          <button onClick={updateProfile} disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95">
            {loading ? "SAVING..." : "UPDATE PROFILE ✅"}
          </button>
        </div>
      </div>
    </main>
  );
}