import Header from "./_components/Header";
import Logo from "./_components/Logo";
import Navigation from "./_components/Navigation";
import "@/app/_styles/globals.css";
import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});
console.log(josefin);
export const metadata = {
  // title: "Next-Wild-Oasis",
  title: {
    template: "%s Next-Wild-Oasis",
    default: "Welcome / Next-Wild-Oasis",
  },
  description:
    "Luxuriuos cabin hotel, located in the heart of theIalian Dolomites.Surrounded by beautiful mountains and dark forests ",
};

function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} antialiased bg-primary-950 text-primary-100 min-h-screen flex flex-col relative`}
      >
        <Header />

        <div className="flex-1 px-8 py-12 grid">
          <main className="max-w-7xl mx-auto w-full">
            {children}
            {/* <ReservationProvider>{children}</ReservationProvider> */}
          </main>
        </div>
      </body>
    </html>
  );
}

export default RootLayout;
