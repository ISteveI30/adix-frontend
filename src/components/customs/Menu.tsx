'use client'

import MENU_ITEMS, { MenuGroup, MenuItem } from "@/lib/dataMenu";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from 'lucide-react'
const Menu = () => {
  const pathname = usePathname();

  return (
    <section className="mt-4 text-sm">
      {MENU_ITEMS.map((menu: MenuGroup) => (
        <article className="flex flex-col gap-2" key={menu.title}>

          {menu.items.map((item: MenuItem) => {
            const Icon = item.icon as LucideIcon

            return (
              <Link
                href={item.href}
                key={item.label}
                className={`
                  flex items-center justify-center lg:justify-start gap-4
                  text-gray-500 py-2 px-2 rounded-md transition-colors
                  hover:bg-userSkyLight
                  ${pathname === item.href ? 'bg-sky-100 text-blue-600' : ''}
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            )
          })}
        </article>
      ))}
    </section>
  )
}

export default Menu