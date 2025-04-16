// types/student.ts


export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  dni?: string;
  email: string;
  phone?: string;
  address?: string;
  image?: string;
  school?: string;
  birthday?: string;
  tutorId: string;
}

export interface StudentSearch {
  id: string
  name: string
}