import fetchWrapper from "@/api/services/api";
import { Student, StudentListResponse } from "@/api/interfaces/student.interface";

export class StudentService {

  //Listar estudiantes
  static async listStudents(): Promise<StudentListResponse[]> {
    const response = await fetchWrapper<StudentListResponse[]>(`/students`)
    return response
  }
  //Listar estudiantes por pagina
  static async listStudentsByPage(page: number, limit: number): Promise<{ data: Student[]; meta: { lastPage: number; page: number; total: number } }> {
    return fetchWrapper<{ data: Student[]; meta: { lastPage: number; page: number; total: number } }>(`/students?page=${page}&limit=${limit}`)
  }

  static async StudentByPage(page: number, limit: number): Promise<StudentListResponse> {
    const response = await fetchWrapper<StudentListResponse>(`/students?page=${page}&limit=${limit}`)
    return response
  }

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

  //Eliminar un estudiante, retorna el mensaje de la API
  static async deleteStudent(id: string): Promise<{ message: string, state:boolean }> {
    const response = await fetchWrapper<{ message: string, state:boolean }>(`/students/${id}`, {
      method: "DELETE",
    })
    return { message: response.message, state: response.state }
  }

  
  static async getStudentById(id: string): Promise<Student> {
    return fetchWrapper<Student>(`/students/${id}`)
  }
}
