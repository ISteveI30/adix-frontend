"use client";

import ExamForm from "@/components/forms/ExamForm"

const NewExam = () => {
  const handleSubmit = (data: any) => {
      console.log("Examen enviado:", data);
  };
  return (
    <ExamForm type="simulacro" onSubmit={handleSubmit} />
  );
}

export default NewExam