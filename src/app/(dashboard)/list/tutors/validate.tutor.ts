import { TutorType } from '@/api/interfaces/enrollment.interface';
import { z } from 'zod';

export const tutorSchema = z.object({
  id: z.string().optional(),
  dni: z.string().min(1, { message: 'DNI es obligatorio' }),
  firstName: z.string().min(1, { message: 'Nombre es requerido' }),
  lastName: z.string().min(1, { message: 'Apellidos son requeridos' }),
  email: z.string().email({ message: 'Ingrese un correo válido' }).optional(),
  phone1: z.string().min(1, { message: 'Número de teléfono es requerido' }).optional(),
  phone2: z.string().optional(),
  type: z.nativeEnum(TutorType),
  observation: z.string().optional(),
})

// export const UpdateTutorSchema = TutorSchema.omit({ id: true, dni: true })
//   .partial()
//   .refine((data) => {
//     const { firstName, lastName, email, phone1, phone2, tutorType, observation } = data;
//     return firstName || lastName || email || phone1 || phone2 || tutorType || observation;
//   }, {
//     message: 'At least one field must be provided for update',
//   });

  
