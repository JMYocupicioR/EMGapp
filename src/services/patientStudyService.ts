// src/services/patientStudyService.ts
import { Patient } from '../types/patient';
import { Study, StudyType } from '../types';

// Interfaz para un estudio con información del paciente
export interface PatientStudy {
  id: string;
  patientId: string;
  patientName: string;
  studyType: StudyType;
  studyData: Study;
  timestamp: string;
  observations?: string;
  conclusion?: string;
}

const STORAGE_KEY = 'emg_patient_studies';

/**
 * Guarda un estudio asociado a un paciente
 */
export const savePatientStudy = (patient: Patient, studyType: StudyType, studyData: Study, observations?: string, conclusion?: string): PatientStudy => {
  const patientStudies = getAllPatientStudies();
  
  const patientStudy: PatientStudy = {
    id: crypto.randomUUID(),
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    studyType,
    studyData,
    timestamp: new Date().toISOString(),
    observations,
    conclusion
  };
  
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