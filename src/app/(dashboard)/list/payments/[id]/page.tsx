import { Suspense} from 'react';
import PaymentTable from '../paymentTable';


  const PaymentListPage = async ({
    params,
  }: {
    params: { id: string };
  }) => {
  const { id } = await params;
  
  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <h1 className="text-2xl font-bold">Cuentas por cobrar</h1>

      <div className="overflow-x-auto">
        <Suspense key={id} fallback={<div className="p-4 text-center">Cargando tabla...</div>}>
          <PaymentTable id={id} />
        </Suspense>
      </div>

    </div>
  );
};

export default PaymentListPage;