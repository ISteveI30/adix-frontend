'use client'
import { Pie, PieChart, ResponsiveContainer } from "recharts"
import WraperCards from "./WraperCards"

const data =[
  { name: "Group A", value: 92, fill: "#C3EBFA" },
  { name: "Group B", value: 8, fill: "#FAE27C" },
]

const Performance = () => {
  return (
    <WraperCards title="Performance" className="h-80 relative">
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            fill="#8884d8"
          />
        </PieChart>
      </ResponsiveContainer>  <div className="flex flex-col items-center justify-center">
        </div>
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
         <h1 className="text-3xl font-bold">9.2</h1>
         <p className="text-xs text-gray-300">of 10 max LTS</p>
       </div>
       <h2 className="font-medium absolute bottom-16 left-0 right-0 m-auto text-center">1er Semestre - 2nd Semestre</h2>
    </WraperCards>
  )
}

export default Performance