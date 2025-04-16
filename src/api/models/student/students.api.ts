import fetchWrapper from "@/api/services/api";
import { Student } from "@/api/interfaces/student.interface";

export class StudentService {
   static async searchStudents(searchTerm: string): Promise<Student[]> {
    return fetchWrapper<Student[]>(`/students/findStudentByName?query=${encodeURIComponent(searchTerm)}`)
  }

  //Guardar un estudiante
  static async saveStudent(student:Student): Promise<Student> {
    student.birthday = student.birthday ? new Date(student.birthday).toISOString() : undefined
    return await fetchWrapper<Student>(`/students`, {
      method: "POST",
      body: student,
    })
  }
  //Actualizar un estudiante
  static async updateStudent(student: Student): Promise<Student> {
    const { id, ...studentData } = student 
    studentData.birthday = student.birthday ? new Date(student.birthday).toISOString() : undefined
    return await fetchWrapper<Student>(`/students/${id}`, {
      method: "PATCH",
      body: studentData,
    })
  }

  
  static async getStudentById(id: string): Promise<Student> {
    return fetchWrapper<Student>(`/students/${id}`)
  }
}
