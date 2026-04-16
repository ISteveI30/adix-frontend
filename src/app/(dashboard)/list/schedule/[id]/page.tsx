import { Suspense } from "react";
import ScheduleTable from "../scheduleTable";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const SchedulePage = async ({ params }: PageProps) => {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <h1 className="text-2xl font-bold">Cronograma de pagos</h1>

      <div className="overflow-x-auto">
        <Suspense key={id} fallback={<div className="p-4 text-center">Cargando cronograma...</div>}>
          <ScheduleTable id={id} />
        </Suspense>
      </div>
    </div>
  );
};

export default SchedulePage;