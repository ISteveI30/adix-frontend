import { z} from 'zod';

export const schemaStudent = z.object({
  id: z.string().optional(),
  dni: z.string().optional(),
  firstName: z.string().min(2, { message: 'Nombre es requerido' }).max(50),
  lastName: z.string().min(2, { message: 'Apellidos son requeridos' }).max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  image: z.string().url().optional(),
  school: z.string().optional(),
  birthday: z.string().optional(),
  tutorId: z.string()
});
