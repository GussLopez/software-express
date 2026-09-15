import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata = {
  title: "GameDevOps | Gestión",
  description: "Frontend para la gestión de jugadores, videojuegos y puntuaciones.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
