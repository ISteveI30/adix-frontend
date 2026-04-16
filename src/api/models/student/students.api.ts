import fetchWrapper from "@/api/services/api";
import {
  Student,
  StudentAttendance,
  StudentListResponse,
} from "@/api/interfaces/student.interface";

function sanitizeStudentPayload(student: Partial<Student>) {
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    dni: student.dni || undefined,
    email: student.email || undefined,
    phone: student.phone || undefined,
    address: student.address || undefined,
    image: student.image || undefined,
    school: student.school || undefined,
    birthday: student.birthday
      ? new Date(student.birthday).toISOString()
      : undefined,
    tutorId: student.tutorId,
  };
}

export class StudentService {
  static async listStudents(): Promise<StudentListResponse> {
    return await fetchWrapper<StudentListResponse>(`/students`, {
      method: "GET",
    });
  }

  static async listStudentsByPage(
    page: number,
    limit: number,
  ): Promise<{
    data: Student[];
    meta: { lastPage: number; page: number; total: number };
  }> {
    return await fetchWrapper<StudentListResponse>(
      `/students?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
    );
  }

  static async StudentByPage(
    page: number,
    limit: number,
  ): Promise<StudentListResponse> {
    return await fetchWrapper<StudentListResponse>(
      `/students?page=${page}&limit=${limit}`,
    );
  }

  static async searchStudents(searchTerm: string): Promise<Student[]> {
    return fetchWrapper<Student[]>(
      `/students/findStudentByName?query=${encodeURIComponent(searchTerm)}`,
    );
  }

  static async saveStudent(student: Student): Promise<Student> {
    const payload = sanitizeStudentPayload(student);

    return await fetchWrapper<Student>(`/students`, {
      method: "POST",
      body: payload,
    });
  }

  static async updateStudent(student: Student): Promise<Student> {
    if (!student.id) {
      throw new Error("El id del estudiante es requerido para actualizar");
    }

    const { id } = student;
    const payload = sanitizeStudentPayload(student);

    return await fetchWrapper<Student>(`/students/${id}`, {
      method: "PATCH",
      body: payload,
    });
  }

  static async deleteStudent(
    id: string,
  ): Promise<{ message: string; state: boolean }> {
    const response = await fetchWrapper<{ message: string; state: boolean }>(
      `/students/${id}`,
      {
        method: "DELETE",
      },
    );
    return { message: response.message, state: response.state };
  }

  static async getStudentById(id: string): Promise<Student> {
    return fetchWrapper<Student>(`/students/${id}`);
  }

  static async getStudentByDni(dni: string): Promise<StudentAttendance> {
    return fetchWrapper<StudentAttendance>(
      `/students/findByDni/${encodeURIComponent(dni)}`,
    );
  }

  static async getStudentByNameFull(
    query: string,
  ): Promise<StudentAttendance[]> {
    const data = await fetchWrapper<StudentAttendance[] | undefined>(
      `/students/findStudentByNameFull?query=${encodeURIComponent(query)}`,
    );
    return Array.isArray(data) ? data : [];
  }
}