// types/student.ts

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  image?: string;
  school?: string;
  birthday?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  tutorId: string;
  // Otras relaciones como attendances, results, enrollments, accountReceivable pueden ser añadidas si es necesario
}


export interface StudentSearch {
  id: string
  firstName: string
  lastName: string
}