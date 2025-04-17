import fetchWrapper from "@/api/services/api";
import { Tutor } from "@/api/interfaces/tutor.interface";
import { ConflictResolutionAction, TutorConflict } from "@/api/interfaces/enrollment.interface";

export class TutorService {

  private static BASE_URL = "/tutors";

   static async tutorSearch(searchTerm: string): Promise<Tutor[]> {
    return await fetchWrapper<Tutor[]>(`${this.BASE_URL}/tutorSearch?query=${encodeURIComponent(searchTerm)}`)
  }
  
  static async saveTutor(tutor: Tutor): Promise<Tutor> {
      // const {id, ...tutorData}= tutor
      const response = await fetchWrapper<Tutor>("/tutors", {
        method: "POST",
        body: tutor,
      });

      return response;
  }

  static async checkDni(dni: string): Promise<{ exists: boolean; tutor?: Tutor }> {
    try {
      const response = await fetchWrapper<{ exists: boolean; tutor?: Tutor }>(
        `${this.BASE_URL}/check-dni/${dni}`
      );
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al verificar el DNI:", error.message);
      } else {
        console.error("Error desconocido al verificar el DNI:", error);
      }
      return { exists: false, tutor: undefined };
    }
  }

  static async handleTutorConflict(
    conflict: TutorConflict,
    action: ConflictResolutionAction
  ): Promise<Tutor | undefined> {
    if (!conflict.existingTutor || !conflict.newTutorData) {
      throw new Error("Datos de conflicto incompletos");
    }

    switch (action) {
      case 'create':
        const modifiedTutor: Tutor = {
          ...conflict.newTutorData,
          dni: `${conflict.newTutorData.dni}-${Math.random().toString(36).substring(2, 6)}`,
        };
        return this.saveTutor(modifiedTutor);
      
      case 'edit':
        // Lógica para edición del tutor existente
        const updatedTutor: Tutor = {
          ...conflict.existingTutor,
          ...conflict.newTutorData,
        };
        return this.updateTutor(updatedTutor);
        // return conflict.existingTutor;
      
      case 'cancel':
        return undefined;
      
      default:
        throw new Error(`Acción de resolución de conflicto no válida: ${action}`);
    }
  }


  static async fetchTutorByDni(dni: string): Promise<Tutor | null> {
    return fetchWrapper<Tutor>(`${this.BASE_URL}/${encodeURIComponent(dni)}`)
  }
  
  //Actualizar un tutor
  static async updateTutor(tutor: Omit<Tutor,"dni">): Promise<Tutor> {
    const { id, firstName, lastName, phone1, type, email, phone2, observation} = tutor
    const tutorData = { firstName, lastName, phone1, type, email, phone2, observation}
    return await fetchWrapper<Tutor>(`${this.BASE_URL}/${id}`, {
      method: "PATCH",
      body: tutorData,
    })
  }

  static async getTutorById(id: string): Promise<Tutor> {
    return fetchWrapper<Tutor>(`${this.BASE_URL}/${id}`)
  }
}

export const ParentsData = async() =>{
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const results = await fetch(`${API_URL}/tutor`)
  const listTutor = await results.json()

  return listTutor.data
}


export const parentsData = [
  {
    id: 1,
    name: "John Doe",
    students: ["Sarah Brewer"],
    email: "john@doe.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 2,
    name: "Jane Doe",
    students: ["Cecilia Bradley"],
    email: "jane@doe.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 3,
    name: "Mike Geller",
    students: ["Fanny Caldwell"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 4,
    name: "Jay French",
    students: ["Mollie Fitzgerald", "Ian Bryant"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 5,
    name: "Jane Smith",
    students: ["Mable Harvey"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 6,
    name: "Anna Santiago",
    students: ["Joel Lambert"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 7,
    name: "Allen Black",
    students: ["Carrie Tucker", "Lilly Underwood"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 8,
    name: "Ophelia Castro",
    students: ["Alexander Blair"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 9,
    name: "Derek Briggs",
    students: ["Susan Webster", "Maude Stone"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
  {
    id: 10,
    name: "John Glover",
    students: ["Stella Scott"],
    email: "mike@geller.com",
    phone: "1234567890",
    address: "123 Main St, Anytown, USA",
  },
];
