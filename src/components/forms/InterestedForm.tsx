"use client";

import { useActionState, useEffect, useState } from "react";
import InputFieldUpdate from "../customs/InputFieldUpdate";
import { Button } from "../ui/button";
import { interestedSchema } from "@/app/(dashboard)/list/interested/validate.interested";
import Swal from "sweetalert2";
import { InterestedService } from "@/api/models/interested/interested.api";
import { InterestedColumns } from "@/api/interfaces/interested.interface";
import { redirect } from "next/navigation";
import { getAreas, getCareersByArea } from "@/api/models/areas/areas.api";
import { CycleService } from "@/api/models/cycle/cycle.api";

const InterestedForm = (
  props: {
    dataEdit?: InterestedColumns;
    page?: number;
    type?: "create" | "update";
  }
) => {
  const currentPage = props.page || 1;
  const actionType = props.type || "create";

  const [isError, submitAction, isPending] = useActionState(handleSubmit, null);

  // 🔹 estados para combos
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [careers, setCareers] = useState<{ id: string; name: string }[]>([]);
  const [cycles, setCycles] = useState<{ id: string; name: string }[]>([]);

  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedCareer, setSelectedCareer] = useState<string>("");
  const [selectedCycle, setSelectedCycle] = useState<string>("");

  useEffect(() => {
    // cargar áreas y ciclos
    getAreas().then(setAreas);
    CycleService.list().then(setCycles);

    if (props.type === "update" && props.dataEdit) {
      // precargar valores desde el interesado
      const areaId = props.dataEdit.career?.area?.id || "";
      const careerId = props.dataEdit.careerId || "";
      const cycleId = props.dataEdit.cycleId || "";

      if (areaId) {
        setSelectedArea(areaId);
        getCareersByArea(areaId).then((list) => {
          setCareers(list);
          setSelectedCareer(careerId);
        });
      }
      if (cycleId) setSelectedCycle(cycleId);
    }
  }, [props.type, props.dataEdit]);

  async function handleSubmit(_: unknown, formData: FormData) {
    const data = Object.fromEntries(formData.entries());

    if (actionType === "update") {
      props.dataEdit?.id && (data.id = props.dataEdit.id);
    }

    const parseData = interestedSchema.safeParse(data);

    if (!parseData.success) {
      Swal.fire({
        icon: "error",
        title: "Error de Registro",
        text: parseData.error.errors[0].message,
      });
      return;
    }

    if (actionType === "update") {
      await InterestedService.update(parseData.data);
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Interesado actualizado correctamente",
      });
    } else {
      await InterestedService.create(parseData.data);
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Interesado creado correctamente",
      });
    }
    handleCancel();
  }

  const handleCancel = () => {
    redirect(`/list/interested?page=${currentPage}`);
  };

  if (isError) {
    Swal.fire({
      icon: "error",
      title: "Error de Registro",
      text: isError,
    });
  }

  return (
    <div className="flex flex-col gap-4 w-full p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800">
        {props.type === "update" ? "Editar interesado" : "Registrar interesado"}
      </h2>
      <form action={submitAction} className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-6 bg-white rounded-lg shadow-sm">
          {/* Nombre */}
          <InputFieldUpdate
            name="firstName"
            label="Nombre"
            defaultValue={props.dataEdit?.firstName}
            inputProps={{
              maxLength: 50,
              minLength: 2,
              pattern: "[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*",
              required: true,
            }}
          />
          {/* Apellido */}
          <InputFieldUpdate
            name="lastName"
            label="Apellido"
            defaultValue={props.dataEdit?.lastName}
            inputProps={{
              maxLength: 50,
              minLength: 2,
              pattern: "[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*",
              required: true,
            }}
          />
          {/* Email */}
          <InputFieldUpdate
            name="email"
            label="Email"
            type="email"
            defaultValue={props.dataEdit?.email}
            inputProps={{
              maxLength: 50,
              required: false,
            }}
          />
          {/* Teléfono */}
          <InputFieldUpdate
            name="phone1"
            label="Teléfono"
            defaultValue={props.dataEdit?.phone1}
            inputProps={{
              maxLength: 9,
              minLength: 9,
              pattern: "[0-9]*",
              required: false,
            }}
          />
          {/* Teléfono 2 */}
          <InputFieldUpdate
            name="phone2"
            label="Teléfono 2"
            defaultValue={props.dataEdit?.phone2}
            inputProps={{
              maxLength: 9,
              pattern: "[0-9]*",
            }}
          />

          {/* 🔹 Área */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Área</label>
            <select
              name="areaId"
              value={selectedArea}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const areaId = e.target.value;
                setSelectedArea(areaId);
                getCareersByArea(areaId).then((list) => {
                  setCareers(list);
                  setSelectedCareer(""); // resetear carrera al cambiar área
                });
              }}
              className="border rounded-md p-2 mt-1"
              required
            >
              <option value="">Seleccione área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Carrera */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Carrera</label>
            <select
              name="careerId"
              value={selectedCareer}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedCareer(e.target.value)
              }
              className="border rounded-md p-2 mt-1"
              required
            >
              <option value="">Seleccione carrera</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Ciclo */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium">Ciclo</label>
            <select
              name="cycleId"
              value={selectedCycle}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedCycle(e.target.value)
              }
              className="border rounded-md p-2 mt-1"
              required
            >
              <option value="">Seleccione ciclo</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-around gap-3">
          <Button
            type="button"
            onClick={handleCancel}
            variant="destructive"
            className="bg-red-500 text-white rounded-md p-4 cursor-pointer"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 text-white hover:bg-blue-800"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InterestedForm;
