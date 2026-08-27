import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "D’Hages Turismo", short_name: "D’Hages", description: "Pacotes de viagem e experiências saindo de Belém.", start_url: "/", display: "standalone", background_color: "#fffdf7", theme_color: "#062e47", icons: [{ src: "/favicon.ico", sizes: "256x256", type: "image/x-icon" }] };
}
