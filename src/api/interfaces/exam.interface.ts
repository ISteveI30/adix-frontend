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
    score?: number;
    status?: string;
    registered: string;  // ISO-8601
}


