import {z} from 'zod';

export const interestedSchema = z.object({
  id: z.string().optional(), 
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone1: z
    .string()
    .regex(/^[0-9]*$/, "Debe contener solo números")
    .length(9, "Debe tener 9 dígitos")
    .optional()
    .or(z.literal("")),
  phone2: z
    .string()
    .regex(/^[0-9]*$/, "Debe contener solo números")
    .length(9, "Debe tener 9 dígitos")
    .optional()
    .or(z.literal("")),
  careerId: z.string().min(1, "Debe seleccionar una carrera"),
  cycleId: z.string().min(1, "Debe seleccionar un ciclo"),
});
export type InterestedSchema = z.infer<typeof interestedSchema>;
