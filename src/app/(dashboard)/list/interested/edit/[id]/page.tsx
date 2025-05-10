import { InterestedService } from "@/api/models/interested/interested.api"
import InterestedForm from "@/components/forms/InterestedForm"
import { use } from "react"

interface InterestedEditPageProps {
  params: Promise<{
    id: string
  }>
}

const InterestedEditPage = ({ params }: InterestedEditPageProps) => {

  const { id } = use(params)
  const dataInterested = use(InterestedService.getById(id))
  return (
    <>
      <div className="overflow-x-auto">
        <InterestedForm dataEdit={dataInterested} type="update" />
      </div>
    </>
  )
}

export default InterestedEditPage