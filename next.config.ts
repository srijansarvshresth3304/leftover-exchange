import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vmpwqqivzltfexkdyivl.supabase.co', // Maine aapka ID yahan daal diya hai
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  /* Aap yahan aur options bhi add kar sakte hain */
};

export default nextConfig;