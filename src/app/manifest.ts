import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bia — learn conversational Farsi",
    short_name: "Bia",
    description: "Bite-sized lessons for speaking everyday Persian.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e8f0fa",
    theme_color: "#e8f0fa",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
