import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Les images produits sont servies par le storage Supabase. Le projet a
    // déjà déménagé deux fois (SaaS → Fournisseur → portail-mdjambo) et chaque
    // déménagement change le sous-domaine : un hôte figé ici casse
    // silencieusement toutes les images, next/image refusant de les charger.
    // D'où le joker sur le sous-domaine.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
