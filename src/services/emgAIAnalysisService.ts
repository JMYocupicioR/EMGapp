// src/services/emgAIAnalysisService.ts
import { Study } from '../types';

// Configuración para la API de OpenAI
const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

/**
 * Solicita un análisis especializado de electromiografía usando IA
 */
export async function getEMGAnalysis(
  emgData: any, 
  patientData: { 
    age?: number; 
    gender?: string; 
    muscleType?: string; 
    fitnessLevel?: string;
    medicalHistory?: string;
  }
): Promise<string> {
  try {
    // Si no hay clave API configurada, mostrar mensaje instructivo
    if (!API_KEY) {
      return "Para usar el análisis de IA, configure su clave API en las variables de entorno.";
    }
    
    // Preparar el prompt especializado en EMG
    const prompt = prepareEMGPrompt(emgData, patientData);
    
    // Realizar la solicitud a la API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un neurofisiólogo especializado en electromiografía con más de 20 años de experiencia clínica. Tu tarea es analizar datos de EMG y proporcionar una interpretación médica profesional y detallada siguiendo estándares clínicos.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2, // Valor bajo para respuestas más consistentes y precisas
        max_tokens: 1500
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al conectar con la API de IA');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error en análisis EMG por IA:', error);
    return `Error al realizar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`;
  }
}

/**
 * Prepara el prompt especializado en EMG para la IA
 */
function prepareEMGPrompt(emgData: any, patientData: any): string {
  let prompt = `Analiza los siguientes datos electromiográficos y genera un informe detallado profesional:\n\n`;
  
  // Datos del paciente
  prompt += `## DATOS DEL PACIENTE\n`;
  prompt += `- Edad: ${patientData.age || 'No especificada'} años\n`;
  prompt += `- Sexo: ${patientData.gender || 'No especificado'}\n`;
  prompt += `- Tipo de músculo evaluado: ${patientData.muscleType || 'No especificado'}\n`;
  prompt += `- Condición física general: ${patientData.fitnessLevel || 'No especificada'}\n`;
  
  if (patientData.medicalHistory) {
    prompt += `- Historia médica relevante: ${patientData.medicalHistory}\n`;
  }
  
  prompt += `\n## DATOS EMG REGISTRADOS\n`;
  
  // Formatear datos de EMG
  if (emgData.results) {
    // Si es un formato de resultados estructurado
    Object.entries(emgData.results).forEach(([key, value]: [string, any]) => {
      prompt += `- ${key}: ${JSON.stringify(value)}\n`;
    });
  } else if (emgData.measurements) {
    // Si tiene el formato de mediciones
    prompt += `- Amplitud: ${emgData.measurements.amplitude} ${emgData.measurements.amplitudeUnit || 'mV'}\n`;
    
    if (emgData.measurements.frequency) {
      prompt += `- Frecuencia: ${emgData.measurements.frequency} Hz\n`;
    }
    
    if (emgData.measurements.duration) {
      prompt += `- Duración: ${emgData.measurements.duration} ms\n`;
    }
    
    if (emgData.measurements.recruitmentPattern) {
      prompt += `- Patrón de reclutamiento: ${emgData.measurements.recruitmentPattern}\n`;
    }
    
    if (emgData.measurements.interference) {
      prompt += `- Patrón de interferencia: ${emgData.measurements.interference}\n`;
    }
  } else {
    // Formato genérico para cualquier tipo de datos
    Object.entries(emgData).forEach(([key, value]: [string, any]) => {
      if (typeof value !== 'object') {
        prompt += `- ${key}: ${value}\n`;
      } else if (value !== null) {
        prompt += `- ${key}: ${JSON.stringify(value)}\n`;
      }
    });
  }
  
  // Instrucciones específicas para el análisis
  prompt += `\nAnálisis solicitado: Por favor analiza los datos electromiográficos proporcionados y genera un informe detallado que incluya:\n\n`;
  prompt += `1. Evaluación cuantitativa de la actividad muscular registrada:\n`;
  prompt += `   - Amplitud de las señales EMG\n`;
  prompt += `   - Frecuencia de las contracciones\n`;
  prompt += `   - Patrones de activación muscular\n`;
  prompt += `   - Fatiga muscular (si es observable)\n\n`;
  
  prompt += `2. Comparación con valores de referencia normales para:\n`;
  prompt += `   - Edad del paciente\n`;
  prompt += `   - Tipo de músculo evaluado\n`;
  prompt += `   - Condición física general\n\n`;
  
  prompt += `3. Identificación de:\n`;
  prompt += `   - Anomalías en los patrones de activación\n`;
  prompt += `   - Posibles disfunciones neuromusculares\n`;
  prompt += `   - Asimetrías entre grupos musculares\n\n`;
  
  prompt += `4. Conclusiones clínicas que incluyan:\n`;
  prompt += `   - Interpretación de los hallazgos principales\n`;
  prompt += `   - Recomendaciones específicas basadas en los resultados\n`;
  prompt += `   - Sugerencias para seguimiento o evaluaciones adicionales\n\n`;
  
  prompt += `Presenta tu análisis en formato técnico-médico, utilizando terminología profesional y respaldando tus conclusiones con los datos observados.`;
  
  return prompt;
}

/**
 * Guarda un análisis EMG por IA
 */
export function saveEMGAnalysis(studyId: string, analysisContent: string): void {
  const existingAnalysesJson = localStorage.getItem('emg_ai_analyses') || '{}';
  const analyses = JSON.parse(existingAnalysesJson);
  
  analyses[studyId] = {
    timestamp: new Date().toISOString(),
    content: analysisContent
  };
  
  localStorage.setItem('emg_ai_analyses', JSON.stringify(analyses));
}

/**
 * Obtiene análisis EMG previos por IA
 */
export function getEMGAnalysisHistory(studyId: string): { timestamp: string, content: string } | null {
  const existingAnalysesJson = localStorage.getItem('emg_ai_analyses') || '{}';
  const analyses = JSON.parse(existingAnalysesJson);
  
  return analyses[studyId] || null;
}