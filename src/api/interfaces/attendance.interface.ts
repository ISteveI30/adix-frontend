export type AttendanceRow = {
  id: string;
  studentId: string;
  fullName: string;
  dni?: string | null;
  barcodeValue?: string | null;
  admissionName?: string | null;
  cycleName: string;
  careerName: string;
  shift?: string | null;
  attendanceId: string | null;
  entryTime: string | null;
  status: string | null;
  notes: string | null;
  canJustify: boolean;
};

export type ScanAttendanceResponse = {
  message: string;
  attendance: {
    id: string;
    entryTime?: string;
    status: string;
  };
  student: {
    id: string;
    fullName: string;
    barcodeValue?: string;
    admissionName?: string;
    cycleName: string;
    careerName: string;
    shift?: string;
  };
};

export type BarcodeCardRow = {
  id: string;
  fullName: string;
  barcodeValue: string;
  admissionName?: string;
  cycleName: string;
  careerName: string;
  codeStudent: string;
};