"use client"
import {  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';
import WraperCards from './WraperCards';

const data = [
  {
    name: "Ene",
    Ingresos: 4000,
    Gastos: 2400,
  },
  {
    name: "Feb",
    Ingresos: 3000,
    Gastos: 1398,
  },
  {
    name: "Mar",
    Ingresos: 2000,
    Gastos: 9800,
  },
  {
    name: "Abr",
    Ingresos: 2780,
    Gastos: 3908,
  },
  {
    name: "May",
    Ingresos: 1890,
    Gastos: 4800,
  },
  {
    name: "Jun",
    Ingresos: 2390,
    Gastos: 3800,
  },
  {
    name: "Jul",
    Ingresos: 3490,
    Gastos: 4300,
  },
  {
    name: "Ago",
    Ingresos: 3490,
    Gastos: 4300,
  },
  {
    name: "Sep",
    Ingresos: 3490,
    Gastos: 4300,
  },
  {
    name: "Oct",
    Ingresos: 3490,
    Gastos: 4300,
  },
  {
    name: "Nov",
    Ingresos: 3490,
    Gastos: 4300,
  },
  {
    name: "Dic",
    Ingresos: 3490,
    Gastos: 4300,
  },
];

const FinanceChart = () => {
  return (
    <>
      <WraperCards title="Finanzas" className='h-full'>
        <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend 
            align='center'
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "0.5rem", paddingBottom: "1rem" }}
          />
          <Line type="monotone" dataKey="Ingresos" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Gastos" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
      </WraperCards>
    </>
  )
}

export default FinanceChart