
import { AccountReceivableService } from "@/api/models/accountReceivable/account-receivable.api"
import { PaymentForm } from "@/components/forms/PaymentForm"


interface PageProps {
  params: Promise< { id: string }>,
}

const page = async (
  { params }: PageProps
) => {

  const { id } = await params

  const dataAccountReceivable = await AccountReceivableService.getAccountReceivableById(id)
  
  return (
    <section className="flex flex-col gap-4 w-full p-4">
      <h1 className="text-2xl font-bold">Nuevo Pago</h1>
      <PaymentForm data={dataAccountReceivable}/>
    </section>
  )
}

export default page