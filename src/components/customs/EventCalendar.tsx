'use client'

import { useState } from 'react';
import Calendar from 'react-calendar';
import WraperCards from './WraperCards';
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const events = [
  {
    id: 1,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const EventCalendar = () => {
  const date = new Date();

  const [value, onChange] = useState<Value>(date);

  return (
    <>
      <WraperCards title="Calendario">
        <Calendar onChange={onChange} value={value}/>
      </WraperCards>
      <WraperCards title="Eventos">
        {events.map((event) => (
          <div key={event.id} className='p-5 rounded-md border-2 border-gray-100 odd: border-t-userSky even:border-t-userPurple'>
            <div className='flex items-center justify-between pb-1'>
              <h2 className='font-semibold text-gray-600'>{event.title}</h2>
              <span className='text-gray-300 text-xs'>{event.time}</span>
            </div>
            <div>
              <span className='text-gray-500 text-sm'>{event.description}</span>
            </div>
          </div>
        ))}
      </WraperCards>
    </>
  );
}

export default EventCalendar