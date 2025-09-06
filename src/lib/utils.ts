import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function formatDateToLocalFromISO(date: string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("es-PE", {
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


// utils/stripEmpty.ts (o donde prefieras)

// export function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

export const generatePagination = (currentPage: number, totalPages: number) => {

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

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