import { create } from "zustand";
import { TypeExam } from "@/api/interfaces/exam.interface";

export type ExamDraft = {
  title: string;
  modality: string;
  type: TypeExam;
  cycleId: string;
  cycleName?: string;
};

interface ExamDraftState {
  draft: ExamDraft | null;
  setDraft: (draft: ExamDraft) => void;
  clearDraft: () => void;
}

export const useExamDraftStore = create<ExamDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));