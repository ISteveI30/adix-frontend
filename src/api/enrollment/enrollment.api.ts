export async function listEnrollments() {

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const results = await fetch(`${API_URL}/enrollment`)
  const data: [] = await results.json()

  return data
}