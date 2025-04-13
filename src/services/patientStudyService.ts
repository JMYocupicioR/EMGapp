// src/services/patientStudyService.ts
import { Patient } from '../types/patient';
import { Study, StudyType } from '../types';

// src/services/patientStudyService.ts

/**
 * Guarda un estudio asociado a un paciente
 */
export const savePatientStudy = (
  patient: Patient, 
  studyType: StudyType, 
  studyData: Study, 
  observations?: string,
  conclusion?: string,
  aiEmgAnalysis?: string
): PatientStudy => {
  const patientStudies = getAllPatientStudies();
  
  const studyId = crypto.randomUUID();
  
  const patientStudy: PatientStudy = {
    id: studyId,
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    studyType,
    studyData,
    timestamp: new Date().toISOString(),
    observations,
    conclusion
  };
  
  // Añadir el análisis de IA si existe
  if (aiEmgAnalysis) {
    patientStudy.aiAnalysis = {
      emgAnalysis: {
        id: crypto.randomUUID(),
        studyId: studyId,
        content: aiEmgAnalysis,
        timestamp: new Date().toISOString(),
        modelVersion: 'gpt-4'
      }
    };
  }
  
  patientStudies.push(patientStudy);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patientStudies));
  
  return patientStudy;
};

/**
 * Obtiene todos los estudios de pacientes
 */
export const getAllPatientStudies = (): PatientStudy[] => {
  const studiesJson = localStorage.getItem(STORAGE_KEY);
  return studiesJson ? JSON.parse(studiesJson) : [];
};

/**
 * Obtiene los estudios de un paciente específico
 */
export const getPatientStudies = (patientId: string): PatientStudy[] => {
  const allStudies = getAllPatientStudies();
  return allStudies.filter(study => study.patientId === patientId);
};

/**
 * Obtiene un estudio específico por su ID
 */
export const getPatientStudyById = (studyId: string): PatientStudy | undefined => {
  const allStudies = getAllPatientStudies();
  return allStudies.find(study => study.id === studyId);
};

/**
 * Actualiza un estudio existente
 */
export const updatePatientStudy = (studyId: string, updates: Partial<PatientStudy>): PatientStudy | null => {
  const allStudies = getAllPatientStudies();
  const studyIndex = allStudies.findIndex(study => study.id === studyId);
  
  if (studyIndex === -1) {
    return null;
  }
  
  const updatedStudy = {
    ...allStudies[studyIndex],
    ...updates,
    timestamp: new Date().toISOString() // Actualiza la marca de tiempo
  };
  
  allStudies[studyIndex] = updatedStudy;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allStudies));
  
  return updatedStudy;
};

/**
 * Elimina un estudio
 */
export const deletePatientStudy = (studyId: string): boolean => {
  const allStudies = getAllPatientStudies();
  const filteredStudies = allStudies.filter(study => study.id !== studyId);
  
  if (filteredStudies.length === allStudies.length) {
    return false; // No se encontró el estudio
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredStudies));
  return true;
};

/**
 * Obtiene los estudios más recientes
 */
export const getRecentStudies = (limit: number = 5): PatientStudy[] => {
  const allStudies = getAllPatientStudies();
  return allStudies
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};

/**
 * Añade o actualiza análisis de IA para un estudio existente
 */
export const addAIAnalysisToStudy = (
  studyId: string, 
  emgAnalysis: string, 
  modelVersion: string = 'gpt-4'
): PatientStudy | null => {
  const allStudies = getAllPatientStudies();
  const studyIndex = allStudies.findIndex(study => study.id === studyId);
  
  if (studyIndex === -1) {
    return null;
  }
  
  // Crear o actualizar el objeto aiAnalysis
  const updatedStudy = { ...allStudies[studyIndex] };
  
  if (!updatedStudy.aiAnalysis) {
    updatedStudy.aiAnalysis = {};
  }
  
  updatedStudy.aiAnalysis.emgAnalysis = {
    id: crypto.randomUUID(),
    studyId: studyId,
    content: emgAnalysis,
    timestamp: new Date().toISOString(),
    modelVersion: modelVersion
  };
  
  allStudies[studyIndex] = updatedStudy;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allStudies));
  
  return updatedStudy;
};

/**
 * Obtener análisis de IA para un estudio
 */
export const getAIAnalysis = (studyId: string): { emgAnalysis?: any } | null => {
  const study = getPatientStudyById(studyId);
  if (!study || !study.aiAnalysis) {
    return null;
  }
  
  return study.aiAnalysis;
};