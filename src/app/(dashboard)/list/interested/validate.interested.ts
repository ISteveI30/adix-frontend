import {z} from 'zod';

export const interestedSchema = z.object({
  id: z.string().optional(), 
  firstName: z.string().min(2, {message: 'El nombre es requerido'}),
  lastName: z.string().min(2, {message: 'El apellido es requerido'}),
  email: z.string().email({message: 'El email no es válido'}),
  phone1: z.string().min(9, {message: 'El teléfono es requerido'}),
  phone2: z.string().optional()
});
export type InterestedSchema = z.infer<typeof interestedSchema>;
