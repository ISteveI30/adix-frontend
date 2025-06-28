"use client";

import ExamForm from "@/components/forms/ExamForm"

const NewExam = () => {
  const handleSubmit = (data: any) => {
      console.log("Examen enviado:", data);
  };
  return (
    <ExamForm type="regular" onSubmit={handleSubmit} />
  );
}

export default NewExam