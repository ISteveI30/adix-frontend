// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import InputField from "../customs/InputField";
// import Image from "next/image";

// const schema = z.object({
//   firstName: z.string().min(1, { message: "First name is required!" }),
//   lastName: z.string().min(1, { message: "Last name is required!" }),
//   email: z.string().email({ message: "Invalid email address!" }),
//   phone: z.string().min(1, { message: "Phone is required!" }),
//   address: z.string().min(1, { message: "Address is required!" }).optional(),
//   birthday: z.date({ message: "Birthday is required!" }).optional(),
//   gender: z.enum(["MASCULINO", "FEMENINO"], { message: "Gender is required!" }),
//   image: z.instanceof(File, { message: "Image is required" }).optional(),
//   school: z.string().min(1, { message: "School is required!" }).optional(),// Colegio como texto
//   tutorId: z.string().min(1, { message: "Tutor ID is required!" }), // Tutor ID obligatorio
// });

// export type Inputs = z.infer<typeof schema>;

// const StudentForm = ({
//   type,
//   data,
//   tutorId, // Recibir tutorId como prop
// }: {
//   type: "create" | "update";
//   data?: Inputs;
//   tutorId: string; // Prop obligatoria
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//   } = useForm<Inputs>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       ...data,
//       tutorId, // Establecer tutorId como valor predeterminado
//     },
//   });

//   const onSubmit = handleSubmit((data) => {
//     if (!tutorId) {
//       alert("Tutor ID is required!"); // Validar que tutorId esté presente
//       return;
//     }
//     console.log(data); // Aquí puedes enviar los datos al backend
//   });

//   return (
//     <form className="flex flex-col gap-8" onSubmit={onSubmit}>
//       <h1 className="text-xl font-semibold">Registrar Alumno Nuevo</h1>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Nombre"
//           name="firstName"
//           defaultValue={data?.firstName}
//           register={register}
//           error={errors.firstName}
//           className="md:w-1/4"
//         />
//         <InputField
//           label="Apellido"
//           name="lastName"
//           defaultValue={data?.lastName}
//           register={register}
//           error={errors.lastName}
//           className="md:w-1/4"
//         />
//         <InputField
//           label="Email"
//           name="email"
//           defaultValue={data?.email}
//           register={register}
//           error={errors?.email}
//           className="md:w-1/4"
//         />
//         <InputField
//           label="Colegio"
//           name="school"
//           defaultValue={data?.school}
//           register={register}
//           error={errors.school}
//           className="md:w-1/4"
//         />
//         <InputField
//           label="Celular"
//           name="phone"
//           defaultValue={data?.phone}
//           register={register}
//           error={errors.phone}
//           className="md:w-1/4"
//         />
//         <InputField
//           label="Dirección"
//           name="address"
//           defaultValue={data?.address}
//           register={register}
//           error={errors.address}
//           className="md:w-1/4"
//         />
//         <InputField
//           label="Cumpleaños"
//           name="birthday"
//           defaultValue={data?.birthday ? data.birthday.toISOString().split('T')[0] : undefined}
//           register={register}
//           error={errors.birthday}
//           type="date"
//           className="md:w-1/4"
//         />
     
//         <div className="flex flex-col gap-2 border w-full md:w-4/4 justify-center p-3">
//           <label
//             className="text-xs text-gray-500 flex items-center justify-center gap-2 cursor-pointer"
//             htmlFor="image"
//           >
//             <Image src="/upload.png" alt="" width={28} height={28} />
//             <span>Subir una foto</span>
//           </label>
//           <input type="file" id="image" {...register("image")} className="hidden" />
//           {errors.image?.message && (
//             <p className="text-xs text-red-400">
//               {errors.image.message.toString()}
//             </p>
//           )}
//         </div>
//       </div>
//       <button className="bg-blue-400 text-white p-2 rounded-md">
//         {type === "create" ? "Create" : "Update"}
//       </button>
//     </form>
//   );
// };

// export default StudentForm;