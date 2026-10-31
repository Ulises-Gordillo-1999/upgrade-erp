import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UPGRADE ERP - Infraestructura IT & Seguridad",
    short_name: "UPGRADE ERP",
    description: "Plataforma corporativa de gestión de infraestructura IT, proyectos y catálogo para UPGRADE.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#07090e",
    theme_color: "#07090e",
    orientation: "any",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

