"use client";
import AttendanceForm from "@/components/forms/AttendanceForm";
import { Attendance } from "@/api/interfaces/attendance.interface";
import { toast } from "sonner";
import { AttendanceService } from "@/api/models/attendance/attendance.api";

interface AttendancePageProps {
  //searchParams?: {
  //  query?: string;
  //  page?: string;
  //};
  onSave: (attendance: Attendance) => Promise<Attendance>;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ /*searchParams*/ }) => {

  const handleSave = async (attendance: Attendance): Promise<Attendance> => {
    try {
      const result = await AttendanceService.create(attendance);  
      //toast.success("Asistencia registrada con éxito");
      return result;
    } catch (err) {
      //console.error(err); 
      //toast.error("No se pudo registrar la asistencia");
      throw err; 
    }
  };
 
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 border">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h1 className="text-lg font-semibold">Registro de Asistencias</h1>
      </div>
      <AttendanceForm onSave={handleSave} />
    </div>
  );
};

export default AttendancePage;
