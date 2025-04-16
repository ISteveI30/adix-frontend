import { useEffect, useState } from "react"

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Tutor } from "@/api/interfaces/tutor.interface";
import { Student } from "@/api/interfaces/student.interface";
import { TutorStudentData, TutorStudentNestedData, TutorType } from "@/api/interfaces/enrollment.interface";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formateaFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateToISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatDateToISOWithTime(date: Date): string {
  return date.toISOString().split("T")[0] + " " + date.toLocaleTimeString();
}

export function formatDateToLocal(date: Date): string {
  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
export function formatDateToLocalWithTime(date: Date): string {
  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
 export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value)
  }

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


// Transforma de formato plano a estructura anidada
export const flattenToNested = (data: TutorStudentData): TutorStudentNestedData  => {
  return {
    tutor: {
      dni: data.dni,
      firstName: data.firstName,
      lastName: data.lastName,
      phone1: data.phone1,
      type: data.type,
      email: data.email,
      phone2: data.phone2,
      observation: data.observation,
    },
    student: {
      firstName: data.studentFirstName,
      lastName: data.studentLastName,
      email: data.studentEmail!,
      phone: data.studentPhone,
      address: data.studentAddress,
      school: data.studentSchool,
      birthday: data.studentBirthday ? new Date(data.studentBirthday).toISOString().split('T')[0] : undefined,
      tutorId: "", // Se establecerá después
    },
  };
};

// Transforma de estructura anidada a formato plano
export const nestedToFlatten = (
  tutor: Tutor,
  student: Student
): TutorStudentData => {
  return {
    firstName: tutor.firstName,
    lastName: tutor.lastName,
    dni: tutor.dni,
    phone1: tutor.phone1,
    type: tutor.type as TutorType,
    email: tutor.email,
    phone2: tutor.phone2,
    observation: tutor.observation,

    studentSchool: student.school,
    studentFirstName: student.firstName,
    studentLastName: student.lastName,
    studentEmail: student.email,
    studentPhone: student.phone,
    studentAddress: student.address,
    studentBirthday: student.birthday
  };
};


export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
// // 📂 Ruta donde se guardarán los logs
// const LOG_FILE_PATH = path.join(process.cwd(), "logs", "app.log")

// // 📌 Definimos el formato de los logs
// const logFormat = format.combine(
//   format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//   format.printf(({ timestamp, level, message, user, ...meta }) => {
//     return `${timestamp} [${level.toUpperCase()}] ${user ? `[User: ${user}]` : ""} ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`
//   })
// )

// // 📌 Tipado para los datos de log
// interface LogMeta {
//   user?: string
//   [key: string]: unknown
// }

// // 📌 Logger principal de Winston
// const winstonLogger: Logger = createLogger({
//   level: "info",
//   format: logFormat,
//   transports: [
//     new transports.Console({
//       format: format.combine(format.colorize(), format.simple()),
//     }),
//     new transports.File({ filename: LOG_FILE_PATH }),
//   ],
// })

// // 📌 Envolvemos `winstonLogger` en un servicio con tipado correcto
// class CustomLogger {
//   private logger: Logger

//   constructor(logger: Logger) {
//     this.logger = logger
//   }

//   info(message: string, meta?: LogMeta) {
//     this.logger.info(message, meta)
//   }

//   error(message: string, meta?: LogMeta) {
//     this.logger.error(message, meta)
//   }

//   warn(message: string, meta?: LogMeta) {
//     this.logger.warn(message, meta)
//   }

//   debug(message: string, meta?: LogMeta) {
//     this.logger.debug(message, meta)
//   }
// }

// // 📌 Exportamos una única instancia del logger
// export const logger = new CustomLogger(winstonLogger)