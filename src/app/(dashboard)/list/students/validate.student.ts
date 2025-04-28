import {tuple, z} from 'zod';

export const schemaStudent = z.object({
  id: z.string().optional(),
  dni: z.string().optional(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(6).max(20).optional(),
  address: z.string().max(100).optional(),
  image: z.string().url().optional(),
  school: z.string().max(50).optional(),
  birthday: z.string().optional(),
  tutorId: z.string()
});
