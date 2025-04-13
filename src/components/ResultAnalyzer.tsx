// src/components/ResultAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  Brain, 
  RefreshCw, 
  Download, 
  Save, 
  AlertTriangle,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Study } from '../types';
import { Patient } from '../types/patient';
import { analyzeDiagnostics } from '../utils/diagnosticAnalyzer';
import { getPatientById } from '../services/patientService';
import { savePatientStudy, getPatientStudyById, updatePatientStudy } from '../services/patientStudyService';
import EMGAIAnalysisPanel from './EMGAIAnalysisPanel';

interface ResultAnalyzerProps {
  studyData: any;
  initialDiagnosis: string;
  patientInfo?: any;
  patientId?: string;
  studyId?: string;
  onSaveComplete?: () => void;
  onBack?: () => void;
}

const ResultAnalyzer: React.FC<ResultAnalyzerProps> = ({
  studyData,
  initialDiagnosis,
  patientInfo,
  patientId,
  studyId,
  onSaveComplete,
  onBack,
}) => {
  // Estados del componente
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [conclusion, setConclusion] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [showAiPanel, setShowAiPanel] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [existingStudy, setExistingStudy] = useState<any>(null);
  const [reportMode, setReportMode] = useState<'edit' | 'view'>('view');

  // Cargar datos del paciente y estudio existente si se proporcionan IDs
  useEffect(() => {
    const loadPatient = async () => {
      if (patientId) {
        const patientData = getPatientById(patientId);
        if (patientData) {
          setPatient(patientData);
        }
      }
    };

    const loadExistingStudy = async () => {
      if (studyId) {
        const study = getPatientStudyById(studyId);
        if (study) {
          setExistingStudy(study);
          setObservations(study.observations || '');
          setConclusion(study.conclusion || '');
          if (study.aiAnalysis?.emgAnalysis?.content) {
            setAiAnalysis(study.aiAnalysis.emgAnalysis.content);
          }
        }
      }
    };

    loadPatient();
    loadExistingStudy();
  }, [patientId, studyId]);

  // Analizar datos para diagnóstico cuando cambien los datos del estudio
  useEffect(() => {
    if (studyData && initialDiagnosis) {
      const results = analyzeDiagnostics(studyData, initialDiagnosis);
      setDiagnosticResults(results);
      
      // Generar conclusión automática basada en los resultados
      const autoConclusion = generateAutoConclusion(results);
      if (!conclusion) {
        setConclusion(autoConclusion);
      }
    }
  }, [studyData, initialDiagnosis]);

  // Generar contenido del reporte cuando cambien los resultados o textos
  useEffect(() => {
    if (diagnosticResults) {
      const reportText = generateReport();
      setReportContent(reportText);
    }
  }, [diagnosticResults, observations, conclusion, aiAnalysis]);

  // Generar una conclusión automática basada en los resultados del análisis
  const generateAutoConclusion = (results: any): string => {
    if (!results) return '';

    let conclusionText = '';
    
    // Evaluar la probabilidad del diagnóstico principal
    if (results.primary.probability > 0.8) {
      conclusionText += `Los hallazgos electrofisiológicos son altamente compatibles con ${results.primary.name}. `;
    } else if (results.primary.probability > 0.5) {
      conclusionText += `Los hallazgos electrofisiológicos sugieren un cuadro compatible con ${results.primary.name}. `;
    } else {
      conclusionText += `Los hallazgos electrofisiológicos muestran algunas características que podrían asociarse con ${results.primary.name}, pero los resultados no son concluyentes. `;
    }

    // Añadir información sobre hallazgos anormales
    const abnormalFindings = results.primary.keyFindings.filter((f: any) => f.abnormal);
    if (abnormalFindings.length > 0) {
      conclusionText += `\n\nSe evidencian los siguientes hallazgos anormales:\n`;
      abnormalFindings.forEach((finding: any) => {
        conclusionText += `- ${finding.description}\n`;
      });
    }

    // Añadir diagnósticos diferenciales si existen
    if (results.differentials && results.differentials.length > 0) {
      conclusionText += `\nDiagnósticos diferenciales a considerar:\n`;
      results.differentials.slice(0, 3).forEach((diff: any) => {
        conclusionText += `- ${diff.name} (probabilidad: ${Math.round(diff.probability * 100)}%)\n`;
      });
    }

    return conclusionText;
  };

  // Generar el reporte completo
  const generateReport = (): string => {
    if (!diagnosticResults) return '';

    const today = new Date().toLocaleDateString();
    const patientName = patient 
      ? `${patient.firstName} ${patient.lastName}` 
      : patientInfo?.name || 'No especificado';
    
    return `# REPORTE DE ELECTRONEUROMIOGRAFÍA

## DATOS DEL PACIENTE
- **Nombre:** ${patientName}
- **Fecha del estudio:** ${today}
- **Diagnóstico presuntivo:** ${diagnosticResults.primary.name}

## RESULTADOS DEL ESTUDIO

${formatStudyResults()}

## CONCLUSIÓN
${conclusion}

${aiAnalysis ? '## ANÁLISIS ESPECIALIZADO POR IA\n' + aiAnalysis : ''}

${observations ? '## OBSERVACIONES\n' + observations : ''}
`;
  };

  // Formatear los resultados del estudio para el reporte
  const formatStudyResults = (): string => {
    if (!studyData) return '';

    let results = '';

    // Neuroconducciones
    const neuroConductionTests = Object.entries(studyData)
      .filter(([key]) => key.includes('Motor') || key.includes('Sensory'));
    
    if (neuroConductionTests.length > 0) {
      results += '### Neuroconducciones\n\n';
      
      neuroConductionTests.forEach(([test, data]: [string, any]) => {
        const isMotor = test.includes('Motor');
        results += `**${test.replace(/Test$/, '')}**\n`;
        results += `- Latencia: ${data.latency} ms\n`;
        results += `- Amplitud: ${data.amplitude} ${isMotor ? 'mV' : 'µV'}\n`;
        if (data.velocity) {
          results += `- Velocidad: ${data.velocity} m/s\n`;
        }
        results += '\n';
      });
    }
    
    // EMG
    if (studyData.emg || studyData.emgAbductor || studyData.emgC6C7) {
      results += '### Electromiografía\n\n';
      
      if (studyData.emg) {
        results += formatEMGData(studyData.emg, 'Abductor Corto del Pulgar');
      }
      
      if (studyData.emgC6C7 && Array.isArray(studyData.emgC6C7)) {
        studyData.emgC6C7.forEach((muscle: any, index: number) => {
          results += formatEMGData(muscle, muscle.name || `Músculo ${index + 1}`);
        });
      }
    }
    
    // Índices calculados
    if (studyData.combinedIndex) {
      results += '### Índices Calculados\n\n';
      results += `**Índice Sensorial Combinado:** ${studyData.combinedIndex.value} ms\n`;
      if (studyData.combinedIndex.components) {
        const components = studyData.combinedIndex.components;
        results += `- PALMDIFF: ${components.palmDiff} ms\n`;
        results += `- RINGDIFF: ${components.ringDiff} ms\n`;
        results += `- THUMBDIFF: ${components.thumbDiff} ms\n`;
      }
      results += '\n';
    }
    
    // Respuestas F
    if (studyData.fResponse) {
      results += '### Respuestas F\n\n';
      results += `- Latencia F Mediano: ${studyData.fResponse.medianF} ms\n`;
      results += `- Latencia F Cubital: ${studyData.fResponse.ulnarF} ms\n`;
      results += `- Diferencia: ${studyData.fResponse.difference} ms\n\n`;
    }
    
    return results;
  };

  // Formatear datos de EMG para el reporte
  const formatEMGData = (emgData: any, muscleName: string): string => {
    let formattedData = `**${muscleName}**\n`;
    
    if (emgData.side) {
      formattedData += `- Lado: ${emgData.side === 'right' ? 'Derecho' : 'Izquierdo'}\n`;
    }
    
    if (emgData.insertionActivity) {
      formattedData += `- Actividad de inserción: ${translateEMGValue(emgData.insertionActivity)}\n`;
    }
    
    if (emgData.restActivity) {
      formattedData += `- Actividad en reposo: ${translateEMGValue(emgData.restActivity)}\n`;
    }
    
    if (emgData.motorUnitPotentials) {
      formattedData += `- Potenciales de unidad motora: ${translateEMGValue(emgData.motorUnitPotentials)}\n`;
    }
    
    if (emgData.recruitmentPattern) {
      formattedData += `- Patrón de reclutamiento: ${translateEMGValue(emgData.recruitmentPattern)}\n`;
    }
    
    if (emgData.patientEffort) {
      formattedData += `- Esfuerzo del paciente: ${translateEMGValue(emgData.patientEffort)}\n`;
    }
    
    return formattedData + '\n';
  };

  // Traducir valores de EMG al español
  const translateEMGValue = (value: string): string => {
    const translations: { [key: string]: string } = {
      // Actividad de inserción
      'normal': 'Normal',
      'increased': 'Aumentada',
      'decreased': 'Disminuida',
      
      // Actividad en reposo
      'fibrillation': 'Fibrilaciones',
      'positive_waves': 'Ondas positivas agudas',
      'fasciculation': 'Fasciculaciones',
      
      // Potenciales de unidad motora
      'increased_amplitude': 'Amplitud aumentada',
      'increased_duration': 'Duración aumentada',
      'polyphasic': 'Polifásicos',
      
      // Patrón de reclutamiento
      'reduced': 'Reducido',
      'early': 'Precoz',
      'discrete': 'Discreto',
      
      // Esfuerzo del paciente
      'good': 'Bueno',
      'moderate': 'Moderado',
      'poor': 'Pobre'
    };
    
    return translations[value] || value;
  };

  // Guardar el análisis de IA cuando se reciba del panel de IA
  const handleAiAnalysisSave = (analysisText: string) => {
    setAiAnalysis(analysisText);
  };

  // Guardar el estudio completo
  const handleSaveStudy = async () => {
    if (!patientId && !patient) {
      setSaveError('No se puede guardar el estudio sin datos del paciente.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const patientToUse = patient || await getPatientById(patientId!);
      
      if (!patientToUse) {
        throw new Error('No se encontró información del paciente.');
      }

      // Crear objeto para el estudio
      const studyToSave: Study = {
        id: existingStudy?.id || crypto.randomUUID(),
        nerve: diagnosticResults.primary.name,
        side: 'bilateral', // Este valor debería determinarse por los datos del estudio
        measurements: studyData,
        interpretation: diagnosticResults.primary.keyFindings.map((f: any) => f.description),
        status: diagnosticResults.primary.probability > 0.5 ? 'abnormal' : 'normal',
        timestamp: new Date().toISOString()
      };

      // Si ya existe un estudio, actualizarlo
      if (existingStudy) {
        await updatePatientStudy(existingStudy.id, {
          studyData: studyToSave,
          observations,
          conclusion,
          aiAnalysis: aiAnalysis ? {
            emgAnalysis: {
              id: existingStudy.aiAnalysis?.emgAnalysis?.id || crypto.randomUUID(),
              studyId: existingStudy.id,
              content: aiAnalysis,
              timestamp: new Date().toISOString(),
              modelVersion: 'ai-model-v1'
            }
          } : undefined
        });
      } else {
        // Si es un nuevo estudio, guardarlo
        await savePatientStudy(
          patientToUse,
          'neuroconduction',
          studyToSave,
          observations,
          conclusion,
          aiAnalysis
        );
      }

      setSaveSuccess(true);

      // Notificar al componente padre
      if (onSaveComplete) {
        setTimeout(() => {
          onSaveComplete();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al guardar el estudio:', error);
      setSaveError(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar la impresión del reporte
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Reporte de Electroneuromiografía</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { text-align: center; }
            h2 { margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            h3 { margin-top: 15px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div id="report">
            ${reportContent.replace(/\n/g, '<br>').replace(/#{1,3}\s(.*?)$/gm, (match, group) => 
              match.startsWith('### ') 
                ? `<h3>${group}</h3>` 
                : match.startsWith('## ') 
                  ? `<h2>${group}</h2>` 
                  : `<h1>${group}</h1>`
            )}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Descargar el reporte como un archivo de texto
  const handleDownloadReport = () => {
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-enmg-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Si no hay resultados, mostrar indicador de carga
  if (!diagnosticResults) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Analizando datos del estudio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Encabezado y botones de navegación */}
      <div className="p-6 border-b">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} className="mr-1" />
            Volver
          </button>
        )}
        
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Análisis de Resultados</h2>
          
          <div className="flex space-x-3">
            <button
              onClick={handlePrintReport}
              className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 flex items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Imprimir
            </button>
            
            <button
              onClick={handleDownloadReport}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </button>
            
            {(patientId || patient) && (
              <button
                onClick={handleSaveStudy}
                disabled={isSaving}
                className={`px-3 py-2 rounded-md flex items-center ${
                  isSaving ? 'bg-gray-400 text-gray-200' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Estudio
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {saveSuccess && (
          <div className="mt-2 p-2 bg-green-50 text-green-800 rounded-md flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Estudio guardado correctamente
          </div>
        )}
        
        {saveError && (
          <div className="mt-2 p-2 bg-red-50 text-red-800 rounded-md flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {saveError}
          </div>
        )}
      </div>
      
      <div className="p-6">
        {/* Sección de diagnóstico principal */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Diagnóstico Principal</h3>
          
          <div className={`p-4 rounded-lg ${
            diagnosticResults.primary.probability > 0.7 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-lg">{diagnosticResults.primary.name}</p>
                <p className="text-gray-600">
                  Probabilidad: {Math.round(diagnosticResults.primary.probability * 100)}%
                </p>
              </div>
              
              <div className="w-16 h-16 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={diagnosticResults.primary.probability > 0.7 ? "#4ade80" : "#facc15"}
                    strokeWidth="3"
                    strokeDasharray={`${diagnosticResults.primary.probability * 100}, 100`}
                  />
                  <text x="18" y="20.5" className="text-3xl" textAnchor="middle" fill="#666">
                    {Math.round(diagnosticResults.primary.probability * 100)}%
                  </text>
                </svg>
              </div>
            </div>
            
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Hallazgos clave:</h4>
              <ul className="list-disc pl-5">
                {diagnosticResults.primary.keyFindings.map((finding: any, index: number) => (
                  <li 
                    key={index} 
                    className={`${finding.abnormal ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                  >
                    {finding.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Diagnósticos diferenciales */}
        {diagnosticResults.differentials && diagnosticResults.differentials.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Diagnósticos Diferenciales</h3>
            
            <div className="space-y-2">
              {diagnosticResults.differentials.map((diagnosis: any, index: number) => (
                <div 
                  key={index} 
                  className="p-3 border rounded-md bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{diagnosis.name}</p>
                    <p>
                      Probabilidad: {Math.round(diagnosis.probability * 100)}%
                    </p>
                  </div>
                  {diagnosis.reason && (
                    <p className="text-sm text-gray-600 mt-1">{diagnosis.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Sección de conclusión */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Conclusión</h3>
          
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="w-full min-h-[150px] p-3 border rounded-md"
            placeholder="Introduzca la conclusión del estudio..."
          />
        </div>
        
        {/* Sección de observaciones */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Observaciones</h3>
          
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full min-h-[100px] p-3 border rounded-md"
            placeholder="Añada observaciones adicionales..."
          />
        </div>
        
        {/* Panel de análisis por IA */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium flex items-center">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              Análisis Especializado por IA
            </h3>
            
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              {showAiPanel ? 'Ocultar panel de IA' : 'Mostrar panel de IA'}
            </button>
          </div>
          
          {showAiPanel ? (
            <EMGAIAnalysisPanel
              emgData={studyData}
              patientData={{
                age: patientInfo?.age || (patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined),
                gender: patientInfo?.gender || patient?.sex,
                medicalHistory: patientInfo?.relevantHistory || 
                  (patient?.medicalHistory?.previousDiseases?.join(', ') || undefined)
              }}
              studyId={existingStudy?.id || 'temp-' + crypto.randomUUID()}
              onSave={handleAiAnalysisSave}
            />
          ) : aiAnalysis ? (
            <div className="border rounded-md p-4">
              <div className="max-h-[200px] overflow-y-auto whitespace-pre-wrap text-sm">
                {aiAnalysis}
              </div>
              <button
                onClick={() => setShowAiPanel(true)}
                className="mt-3 text-sm text-purple-600 hover:text-purple-800"
              >
                Editar análisis de IA
              </button>
            </div>
          ) : (
            <div className="p-4 border rounded-md bg-gray-50 text-center">
              <p className="text-gray-500">Haga clic en "Mostrar panel de IA" para generar un análisis especializado de electromiografía utilizando inteligencia artificial.</p>
            </div>
          )}
        </div>
        
        {/* Previsualización del reporte */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Previsualización del Reporte
          </h3>
          
          <div className="border rounded-md p-4">
            <div className="max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm">{reportContent}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para calcular la edad a partir de la fecha de nacimiento
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export default ResultAnalyzer;