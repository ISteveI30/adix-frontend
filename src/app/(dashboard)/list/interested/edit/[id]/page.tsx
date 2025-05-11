import { InterestedService } from "@/api/models/interested/interested.api"
import InterestedForm from "@/components/forms/InterestedForm"

interface InterestedEditPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    page?: string
  }>;
}

const InterestedEditPage = async ({ params, searchParams }: InterestedEditPageProps) => {

  const { id } = await params
  const { page } = await searchParams

  const dataInterested = await InterestedService.getById(id)
  return (
    <>
      <section className="flex flex-col gap-4 w-full p-4">
        <InterestedForm dataEdit={dataInterested} type="update" page={Number(page)} />
      </section>
    </>
  )
}

export default InterestedEditPage