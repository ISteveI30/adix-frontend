"use client";
import { useRouter } from "next/navigation";
import ExamForm, { ExamFormData } from "@/components/forms/ExamForm";
import { TypeExam } from "@/api/interfaces/exam.interface";

const DRAFT_KEY = "exam_draft";

export default function NewExam() {
  const router = useRouter();

  const handleSubmit = async (data: ExamFormData) => {
    const draft = {
      title: data.title.trim(),
      modality: data.modality as string,
      type: data.examType as TypeExam,
      cycleId: data.cycleId,
      cycleName: data.cycleName || "", 
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    router.push("/list/exam/assing"); // 👈 SIN params en URL
  };

  return <ExamForm type="regular" onSubmit={handleSubmit} />;
}
