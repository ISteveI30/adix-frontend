const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function listEnrollments() {
  const results = await fetch(`${API_URL}/enrollment`)
  const data: [] = await results.json()
  return data
}

export async function createEnrollment(data: any) {
  const results = await fetch(`${API_URL}/enrollment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  const response = await results.json()

  return response
}

export const getStudents = async (query: string) => {
  const response = await fetch(`${API_URL}/students/findStudentByName?query=${query}`);
  return response.json();
};

export const getCycles = async () => {
  const response = await fetch(`${API_URL}/cycles`);
  return response.json();
};

export const getCareers = async () => {
  const response = await fetch(`${API_URL}/careers`);
  return response.json();
};