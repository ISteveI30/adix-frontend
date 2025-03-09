"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { JSX, useState } from "react";

// type FormFunction<T> = (type: "create" | "update", data?: T) => JSX.Element;

// const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
//   loading: () => <h1>Loading...</h1>,
// });
const StudentForm = dynamic(() => import("../forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const EnrollmentForm = dynamic(() => import("../forms/EnrollmentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (type: "create" | "update", data?: any) => JSX.Element;
} = {
  // teacher: (type, data) => <TeacherForm type={type} data={data} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
  enrollment: (type, data) => <EnrollmentForm type={type} data={data} />
};

const tables = [
  "teacher",
  "student",
  "parent",
  "enrollment",
  "subject",
  "class",
  "lesson",
  "exam",
  "assignment",
  "result",
  "attendance",
  "event",
  "announcement",
] as const;

type TableType = (typeof tables)[number];

type ActionType = "create" | "update" | "delete";


interface FormModalProps {
  table: TableType;
  type: ActionType;
  data?: any; 
  id?: number | string;
}

const FormModal = ({ table, type, data, id }: FormModalProps) => {

  const size = type === 'create' ? 'size-8' : 'size-7'
  const bgColor = type === 'create' ? 'bg-userYellow' : type === 'update' ? 'bg-userSky' : 'bg-userPurple'

  const [isOpen, setIsOpen] = useState(false)

  const Form = () => {
    return type === "delete" && id ? (
      <form action="" className="p-4 flex flex-col gap-4">
        <span className="text-center font-medium">
          Todos los datos se perderan. Estas seguro que quieres eliminar esta {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](type, data)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setIsOpen(true)}
      >

        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {isOpen && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FormModal