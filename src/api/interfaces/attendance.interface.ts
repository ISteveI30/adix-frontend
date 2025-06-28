export enum StatusAttendance {
  ASISTIO = 'ASISTIO',
  TARDANZA = 'TARDANZA',
  FALTA = 'FALTA',
  FALTA_JUSTIFICADA = 'FALTA_JUSTIFICADA',
}


export interface Attendance {
    studentId: string;
    date: string;
    present: boolean;
    status: StatusAttendance;
}

