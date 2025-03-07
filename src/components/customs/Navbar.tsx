import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

const Navbar = async () => {

  const user = await currentUser()
  const role: string  = user?.publicMetadata.role as string
  const username: string  = user?.firstName as string

  return (
    <section className='flex items-center justify-between p-2'>
      <Link href="/" className="flex items-center justify-start p-2 gap-2">
        <img src="/logo1.png" alt="Logotipo academia" width={100} height={20} />
      </Link>
      <div className='flex items-center gap-6 justify-end w-full'>
        <div className='hidden lg:flex flex-col'>
          <span className='text-xs leading-3 font-medium'>{username}</span>
          <span className='text-[10px] text-gray-500 text-right'>{role}</span>
        </div>
        <UserButton />
      </div>
    </section>
  )
}

export default Navbar