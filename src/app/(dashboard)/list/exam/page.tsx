"use client";

import ExamForm from "@/components/forms/ExamForm";
import ExternalForm from "@/components/forms/ExternalForm";
import { Button } from "@/components/ui/button";
import { CreateExternal } from '@/components/customs/ButtonsForm';
import { CreateExam } from '@/components/customs/ButtonsForm';
import { CreateExamWithExternal } from '@/components/customs/ButtonsForm';
interface ExamPageProps {

}

const ExamPage = (props: ExamPageProps) => {
 return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Página de Examen</h1>
      </div>

      {/* Contenedor de botones */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        {/* Este boton llama al formulario ExternalForm */}
        <CreateExternal/>

        {/* Este boton llama al formulario ExamForm */}
        <CreateExam/>

        {/* Se esta trabajando en el flujo */}
        <CreateExamWithExternal/>
      </div>
    </div>
  );
}
export default ExamPage;