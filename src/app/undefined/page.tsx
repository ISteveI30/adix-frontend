'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

export default function UndefinedPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  const homeByRole = useMemo(() => ({
    admin: '/admin',
    guest: '/list/parents',
  }), [])

  useEffect(() => {
    if (!isLoaded) return


    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }

   
    const role = (user?.publicMetadata as any)?.role as string | undefined
    const target = (role && homeByRole[role as keyof typeof homeByRole]) || '/admin'
    router.replace(target)
  }, [isLoaded, isSignedIn, user, homeByRole, router])

  return (
    <div className="h-screen w-full grid place-items-center bg-zinc-100">
      <p className="text-sm text-zinc-600">Redirigiendo…</p>
    </div>
  )
}
