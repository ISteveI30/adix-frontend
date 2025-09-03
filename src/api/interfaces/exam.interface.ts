export enum Modality {
    PRESENCIAL = "PRESENCIAL",
    VIRTUAL = "VIRTUAL",
    HIBRIDO = "HIBRIDO",
}

export enum TypeExam {
    DIARIO = "DIARIO",
    SEMANAL = "SEMANAL",
    SIMULACRO = "SIMULACRO",
}


export interface Exam {
    id: string;
    title: string;
    startTime?: string;  
    endTime?: string;    
    modality: Modality;
    type: TypeExam;
    createdAt: string;   
    updatedAt: string;  
    deletedAt?: string; 
    cycleId: string;
}


export interface ExamDetail {
    id: string;
    examId: string;
    studentId?: string;
    externalId?: string;
    //score?: number;
    goodAnswers?: number | null; 
    wrongAnswers?: number | null;
    totalScore?: number | null;  

    status?: string;
    registered: string;  
}


export interface ExamSummary {
  id: string;
  title: string;
  modality: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';
  assigned: number;
}

export type RosterRow = {
  personKey: string;            
  detailId?: string;             
  firstName: string;
  lastName: string;
  type: "Matriculado" | "Externo";
  //careerName?: string;
  //score?: number | null;
  careerName?: string;
  goodAnswers?: number | null;
  wrongAnswers?: number | null;
  totalScore?: number | null;
};