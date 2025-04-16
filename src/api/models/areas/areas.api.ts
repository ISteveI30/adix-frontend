const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAreas = async () => {
  const response = await fetch(`${API_URL}/areas`);
  return await response.json();
};

export const getCareersByArea = async (areaId: string) => {
  const response = await fetch(`${API_URL}/areas/${areaId}`);
  const data = await response.json();
  return data.careers;
};