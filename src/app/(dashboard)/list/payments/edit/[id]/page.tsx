import { PaymentService } from "@/api/models/payment/payment.api";
import PaymentEditForm from "@/components/forms/PaymentEditForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}


const pageEditPayment = async ({ params }: PageProps) => {

  const { id } = await params;

  const data = await PaymentService.getPaymentById(id)
  if (!data) {
    return <div>No hay datos</div>
  }

  return (
    <>
    <h1 className="text-2xl font-bold">Editar Pago</h1>
    <div className="overflow-x-auto">
      <PaymentEditForm data={data} />
    </div>
    </>
  )
}

export default pageEditPayment