"use client";

import ExamForm, { ExamFormData } from "@/components/forms/ExamForm";
import { useRouter } from "next/navigation";
import { TypeExam } from "@/api/interfaces/exam.interface";
import { useExamDraftStore } from "@/store/examDraftStore";

export default function NewExamWithExternal() {
  const router = useRouter();
  const { setDraft } = useExamDraftStore();

  const handleSubmit = async (data: ExamFormData) => {
    setDraft({
      title: data.title.trim(),
      modality: data.modality as string,
      type: TypeExam.SIMULACRO,
      cycleId: data.cycleId,
      cycleName: data.cycleName || "",
    });

    router.push("/list/exam/assing");
  };

  return <ExamForm type="simulacro" onSubmit={handleSubmit} />;
}