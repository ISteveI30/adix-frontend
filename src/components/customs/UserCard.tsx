const UserCard = ({type}:{type:string}) => {
  return (
    <div className="rounded-2xl odd:bg-[#2DD2FF] even:bg-[#FFC229] p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">2024/2025</span>
        <img src={'/more.png'} alt="Indicadores" width={20} height={20}/>
      </div>
      <h1 className="py-4 text-2xl font-bold">1,234</h1>
      <h2 className="capitalize text-sm text-gray-500 font-semibold">{type}</h2>
    </div>
  )
}

export default UserCard