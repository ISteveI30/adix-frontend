// "use client";

import { Suspense } from 'react';
import ScheduleTable from '../scheduleTable';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const AccountReceivableListPage = async ({ params }: PageProps) => {

  const { id } = await params;

  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <h1 className="text-2xl font-bold">Cuentas por cobrar</h1>

      <div className="overflow-x-auto">
        <Suspense key={id} fallback={<div className="p-4 text-center">Cargando tabla...</div>}>
          <ScheduleTable id={id} />
        </Suspense>
      </div>

    </div>
  );
};

export default AccountReceivableListPage;