
const WraperCards = ({
  children, title, className
}: Readonly<{ children: React.ReactNode, title: string, className?: string }>)  => {
  return (
    <>
    <section className={`bg-white rounded-lg  p-4 ${className}`}>
        <article className='flex items-center justify-between'>
          <span className="text-lg font-semibold bg-white px-2 rounded-full">{title}</span>
          <img src='/moreDark.png' alt="Indicadores" width={20} height={20} />
        </article>
        {children}
        </section>
    </>
  )
}

export default WraperCards