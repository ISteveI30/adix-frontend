import { StudentService } from "@/api/models/student/students.api";
import StudentForm from "@/components/forms/StudentForm";

interface PageProps {
  params: Promise<{
    id: string
  }>;
  searchParams: Promise<{
    page?: string
  }>;
}

const EditStudentPage = async({params, searchParams}: PageProps) => {

  const { id } = await params;
  const { page } = await searchParams;
  
  const studentData = await StudentService.getStudentById(id);

  return (
    <section className="flex flex-col gap-4 w-full p-4">
      <h1 className="text-2xl font-bold">Editar Estudiante</h1>
      <StudentForm data={studentData} page={Number(page)}/>
    </section>
  )
}

export default EditStudentPage