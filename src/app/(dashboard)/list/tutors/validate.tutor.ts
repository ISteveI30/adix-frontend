import { TutorType } from '@/api/interfaces/enrollment.interface';
import { z } from 'zod';

export const TutorSchema = z.object({
  id: z.string().uuid(),
  dni: z.string().min(1, { message: 'DNI is required' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone1: z.string().min(1, { message: 'Phone number is required' }),
  phone2: z.string().optional(),
  tutorType: z.nativeEnum(TutorType),
  observation: z.string().optional(),
})

export const UpdateTutorSchema = TutorSchema.omit({ id: true, dni: true })
  .partial()
  .refine((data) => {
    const { firstName, lastName, email, phone1, phone2, tutorType, observation } = data;
    return firstName || lastName || email || phone1 || phone2 || tutorType || observation;
  }, {
    message: 'At least one field must be provided for update',
  });

  
