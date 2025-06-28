"use client";

import { FC, useState } from "react";
import { z } from "zod";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";
import { redirect } from "next/navigation";
import { ExternalService } from "@/api/models/external/external.api";
import Swal from "sweetalert2";

// Esquema de validación
const formSchema = z.object({
  firstName: z.string().min(1, "Nombre obligatorio"),
  lastName: z.string().min(1, "Apellido obligatorio"),
  dni: z.string().min(8, "DNI debe tener al menos 8 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

const ExternalForm: FC = () => {
  const [formData, setFormData] = useState<FormValues>({
    firstName: "",
    lastName: "",
    dni: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const validatedData = formSchema.parse(formData);

      await ExternalService.create(validatedData);

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Estudiante externo registrado correctamente",
        confirmButtonColor: "#2563EB",
      }).then(() => {
        redirect("/list/exam");
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al registrar. Intenta nuevamente.",
        });
      }
    }
  };

  const handleCancel = () => {
    redirect("/list/exam");
  };

  return (
    <section className="p-6 w-full flex justify-center">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Registrar estudiante externo</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombres */}
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombres
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Ingrese nombres"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300"
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
            </div>

            {/* Apellidos */}
            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Ingrese apellidos"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300"
              />
              {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
            </div>

            {/* DNI */}
            <div>
              <Label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                Número de documento (DNI)
              </Label>
              <Input
                id="dni"
                name="dni"
                placeholder="Ingrese DNI"
                maxLength={8}
                value={formData.dni}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300"
              />
              {errors.dni && <p className="text-red-600 text-sm mt-1">{errors.dni}</p>}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center gap-6 mt-8">
            <Button
              type="button"
              className="px-8 py-2 text-base bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-8 py-2 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ExternalForm;
