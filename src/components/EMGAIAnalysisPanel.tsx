// src/components/EMGAIAnalysisPanel.tsx
import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, Save, Download, FileText, AlertTriangle, Info } from 'lucide-react';
import { getEMGAnalysis, saveEMGAnalysis, getEMGAnalysisHistory } from '../services/emgAIAnalysisService';

interface EMGAIAnalysisPanelProps {
  emgData: any;
  patientData: {
    age?: number;
    gender?: string;
    muscleType?: string;
    fitnessLevel?: string;
    medicalHistory?: string;
  };
  studyId?: string;
  onSave?: (analysisText: string) => void;
}

const EMGAIAnalysisPanel: React.FC<EMGAIAnalysisPanelProps> = ({ 
  emgData, 
  patientData, 
  studyId,
  onSave 
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previousAnalysis, setPreviousAnalysis] = useState<{timestamp: string, content: string} | null>(null);
  const [showPrevious, setShowPrevious] = useState<boolean>(false);
  const [infoExpanded, setInfoExpanded] = useState<boolean>(false);
  
  // Verificar si hay análisis previos al cargar el componente
  useEffect(() => {
    if (studyId) {
      const prevAnalysis = getEMGAnalysisHistory(studyId);
      if (prevAnalysis) {
        setPreviousAnalysis(prevAnalysis);
      }
    }
  }, [studyId]);
  
  const handleRequestAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getEMGAnalysis(emgData, patientData);
      setAnalysis(result);
      
      // Guardar el análisis si tiene ID de estudio
      if (studyId) {
        saveEMGAnalysis(studyId, result);
        // Actualizar el historial de análisis
        setPreviousAnalysis({
          timestamp: new Date().toISOString(),
          content: result
        });
      }
    } catch (err) {
      setError(`Error al obtener análisis: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAnalysis = () => {
    if (onSave) {
      onSave(analysis);
    }
  };
  
  const handleExportAnalysis = () => {
    // Crear un blob con el texto del análisis
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Crear un enlace y simular clic para descargar
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-emg-ia-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Brain className="h-5 w-5 text-purple-600 mr-2" />
          Análisis EMG con IA
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setInfoExpanded(!infoExpanded)}
            className="text-blue-600 hover:text-blue-800"
            title="Información sobre el análisis de IA"
          >
            <Info className="h-5 w-5" />
          </button>
          
          {previousAnalysis && (
            <button
              onClick={() => setShowPrevious(!showPrevious)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showPrevious ? 'Ocultar análisis previo' : 'Ver análisis previo'}
            </button>
          )}
        </div>
      </div>
      
      {infoExpanded && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm">
          <h4 className="font-medium text-blue-800 mb-1">Sobre el análisis EMG con IA:</h4>
          <p className="text-blue-700 mb-2">
            Este sistema utiliza inteligencia artificial avanzada para analizar datos electromiográficos y generar un informe técnico-médico detallado.
          </p>
          <ul className="list-disc pl-5 text-blue-700 text-xs space-y-1">
            <li>Evaluación cuantitativa de amplitud, frecuencia y patrones de activación muscular</li>
            <li>Comparación con valores de referencia según edad, tipo de músculo y condición física</li>
            <li>Identificación de posibles anomalías y disfunciones neuromusculares</li>
            <li>Conclusiones clínicas y recomendaciones basadas en evidencia</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            <strong>Nota:</strong> Este análisis es una herramienta de apoyo y no reemplaza el juicio clínico del profesional.
          </p>
        </div>
      )}
      
      {previousAnalysis && showPrevious && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md border text-sm">
          <div className="text-xs text-gray-500 mb-2 flex justify-between">
            <span>Análisis generado el {formatTimestamp(previousAnalysis.timestamp)}</span>
            <button
              onClick={handleExportAnalysis}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </button>
          </div>
          <div className="whitespace-pre-wrap">{previousAnalysis.content}</div>
        </div>
      )}
      
      {!analysis && !isLoading && !showPrevious && (
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            El análisis especializado de EMG con IA proporciona una interpretación detallada de los patrones de actividad muscular, valores de referencia y posibles anomalías.
          </p>
          
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 mb-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-700">
                Para un análisis óptimo, asegúrese de proporcionar datos completos de:
              </p>
              <ul className="list-disc pl-5 text-sm text-yellow-700 mt-1">
                <li>Amplitud de señales EMG</li>
                <li>Frecuencia de contracciones</li>
                <li>Patrones de activación muscular</li>
                <li>Información demográfica del paciente</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={handleRequestAnalysis}
            className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
          >
            <Brain className="h-5 w-5 mr-2" />
            Solicitar análisis EMG por IA
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">Generando análisis especializado de EMG...</p>
          <p className="text-sm text-gray-500 mt-2">Procesando datos y comparando con valores de referencia</p>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {analysis && !isLoading && !showPrevious && (
        <div>
          <div className="border rounded-md p-4 mb-4 max-h-[500px] overflow-y-auto">
            <div className="whitespace-pre-wrap text-sm">{analysis}</div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveAnalysis}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar en informe
            </button>
            
            <button
              onClick={handleExportAnalysis}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar análisis
            </button>
            
            <button
              onClick={handleRequestAnalysis}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar análisis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMGAIAnalysisPanel;