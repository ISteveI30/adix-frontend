import Menu from "@/components/customs/Menu";
import Navbar from "@/components/customs/Navbar";
import { Toaster } from "@/components/ui/sonner"
import { cache } from 'react';
export const experimental_ppr = true;

const CachedNavbar = cache(() => <Navbar />);
const CachedMenu = cache(() => <Menu />);

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <CachedNavbar />
    <section className="h-screen flex">
      <article className="w-[14%] md:w-[8%] lg:w-[16%]">
        <CachedMenu />
      </article>
      <article className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        {children}
        <Toaster />
      </article>
    </section>
    </>
  )
}
