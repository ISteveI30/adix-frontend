'use client'

import MENU_ITEMS from "@/lib/dataMenu";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Menu = () => {
  const pathname = usePathname();

  return (
    <section className="mt-4 text-sm">
      {
        MENU_ITEMS.map(menu => (
          <article className="flex flex-col gap-2" key={menu.title}>
            {
              menu.items.map(item => (
                <Link 
                  href={item.href}
                  key={item.label} 
                  className={`flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-userSkyLight
                     ${ pathname === item.href ? "bg-sky-100 text-blue-600" : ""}`}
                  >
                  <Image src={item.icon} alt={menu.title + " " + item.label} width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                  
                </Link>

              )
              )
            }
          </article>
        ))
      }
    </section>
  )
}

export default Menu;