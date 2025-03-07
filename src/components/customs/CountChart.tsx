'use client'

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import WraperCards from './WraperCards';

const data = [
  {
    name: 'Escolar',
    count: 50,
    fill: '#8884d8',
  },
  {
    name: 'Universitario',
    count: 26.69,
    fill: '#83a6ed',
  },
  {
    name: 'Pre-Universitario',
    count: 15.69,
    fill: '#8dd1e1',
  },
];

const CountChart = () => (
  <>
    <WraperCards title="Estudiantes por nivel" className='h-full'>
      {/* chart */}
      <article className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={20}
            data={data}
          >
            <RadialBar
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              dataKey="count"
            />
            <Legend
              margin={{ top: 0, right: 0, bottom: -310, left: 0 }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <img
          src={"/maleFemale.png"}
          alt='Alumnos'
          width={50}
          height={50}
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        />
      </article>
    </WraperCards>
  </>
)

export default CountChart