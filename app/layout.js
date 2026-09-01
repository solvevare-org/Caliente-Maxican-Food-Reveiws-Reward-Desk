import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Reward Desk — Caliente Mexican Food",
  description: "Look up a customer's review and hand over their free soft drink.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="masa-field min-h-screen antialiased">{children}</body>
    </html>
  );
}
