import fetchWrapper from "@/api/services/api";
import {
  createTutor,
  TutorListResponse,
  Tutor,
  UpdateTutor,
} from "@/api/interfaces/tutor.interface";
import {
  ConflictResolutionAction,
  TutorConflict,
} from "@/api/interfaces/enrollment.interface";

function stripEmpty<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  ) as Partial<T>;
}

function sanitizeTutorPayload(tutor: Partial<Tutor>) {
  return stripEmpty({
    dni: tutor.dni,
    firstName: tutor.firstName,
    lastName: tutor.lastName,
    email: tutor.email,
    phone1: tutor.phone1,
    phone2: tutor.phone2,
    type: tutor.type,
    observation: tutor.observation,
    otherFirstName: tutor.otherFirstName,
    otherLastName: tutor.otherLastName,
    otherPhone: tutor.otherPhone,
  });
}

export class TutorService {
  private static BASE_URL = "/tutors";

  static async tutorSearch(searchTerm: string): Promise<Tutor[]> {
    return await fetchWrapper<Tutor[]>(
      `${this.BASE_URL}/tutorSearch?query=${encodeURIComponent(searchTerm)}`,
    );
  }

  static async saveTutor(tutor: createTutor): Promise<Tutor> {
    const payload = sanitizeTutorPayload(tutor);

    return await fetchWrapper<Tutor>(this.BASE_URL, {
      method: "POST",
      body: payload,
    });
  }

  static async checkDni(
    dni: string,
  ): Promise<{ available: boolean; tutor?: Tutor }> {
    try {
      return await fetchWrapper<{ available: boolean; tutor?: Tutor }>(
        `${this.BASE_URL}/check-dni/${dni}`,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al verificar el DNI:", error.message);
      } else {
        console.error("Error desconocido al verificar el DNI:", error);
      }
      return { available: true, tutor: undefined };
    }
  }

  static async handleTutorConflict(
    conflict: TutorConflict,
    action: ConflictResolutionAction,
  ): Promise<Tutor | undefined> {
    if (!conflict.existingTutor || !conflict.newTutorData) {
      throw new Error("Datos de conflicto incompletos");
    }

    switch (action) {
      case "create": {
        const modifiedTutor: Tutor = {
          ...conflict.newTutorData,
          id: crypto.randomUUID(),
          dni: conflict.newTutorData.dni
            ? `${conflict.newTutorData.dni}-${Math.random()
                .toString(36)
                .substring(2, 6)}`
            : undefined,
        } as Tutor;

        return this.saveTutor(modifiedTutor);
      }

      case "edit": {
        const updatedTutor: Tutor = {
          ...conflict.existingTutor,
          ...conflict.newTutorData,
        } as Tutor;

        return this.updateTutor(updatedTutor);
      }

      case "cancel":
        return undefined;

      default:
        throw new Error(
          `Acción de resolución de conflicto no válida: ${action}`,
        );
    }
  }

  static async fetchTutorByDni(dni: string): Promise<Tutor | null> {
    return await fetchWrapper<Tutor>(
      `${this.BASE_URL}/${encodeURIComponent(dni)}`,
    );
  }

  static async updateTutor(tutor: UpdateTutor): Promise<Tutor> {
    if (!tutor.id) {
      throw new Error("El id del tutor es requerido para actualizar");
    }

    const { id } = tutor;
    const payload = sanitizeTutorPayload(tutor);

    return await fetchWrapper<Tutor>(`${this.BASE_URL}/${id}`, {
      method: "PATCH",
      body: payload,
    });
  }

  static async deleteTutor(
    id: string,
  ): Promise<{ message: string; state: boolean }> {
    return await fetchWrapper<{ message: string; state: boolean }>(
      `${this.BASE_URL}/${id}`,
      {
        method: "DELETE",
      },
    );
  }

  static async getTutorById(id: string): Promise<Tutor> {
    return await fetchWrapper<Tutor>(`${this.BASE_URL}/${id}`);
  }

  static async listTutors(): Promise<TutorListResponse> {
    return await fetchWrapper<TutorListResponse>(this.BASE_URL);
  }

  static async listTutorsByPage(
    page: number,
    limit: number,
  ): Promise<TutorListResponse> {
    return await fetchWrapper<TutorListResponse>(
      `${this.BASE_URL}?page=${page}&limit=${limit}`,
    );
  }

  static async getAllTutors(): Promise<TutorListResponse> {
    return this.listTutors();
  }

  static async getTutorsByPage(
    page: number,
    limit: number,
  ): Promise<TutorListResponse> {
    return this.listTutorsByPage(page, limit);
  }
}