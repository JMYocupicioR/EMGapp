import React, { useState } from 'react';
import { Printer, Edit2, FileText, Check } from 'lucide-react';
import { analyzeDiagnostics } from '../utils/diagnosticAnalyzer';

const DiagnosticAnalysis = ({ studyData, initialDiagnosis, patientInfo }) => {
  const [showReport, setShowReport] = useState(false);
  const [editingReport, setEditingReport] = useState(false);
  const [reportText, setReportText] = useState('');
  
  const results = analyzeDiagnostics(studyData, initialDiagnosis);
  
  // Generar el texto del reporte automáticamente basado en los datos
  const generateReportText = () => {
    const today = new Date().toLocaleDateString();
    
    // Formato del reporte
    const report = `
# REPORTE DE ELECTROMIOGRAFÍA

## DATOS DEL PACIENTE
- **Nombre:** ${patientInfo?.name || 'No especificado'}
- **Sexo:** ${patientInfo?.gender === 'male' ? 'Masculino' : patientInfo?.gender === 'female' ? 'Femenino' : 'No especificado'}
- **Edad:** ${patientInfo?.age || 'No especificada'} años
- **Fecha de nacimiento:** No especificada
- **Número de expediente:** No especificado
- **Estatura y peso:** No especificados
- **Fecha del estudio:** ${today}
- **Médico solicitante:** No especificado
- **Diagnóstico de referencia:** ${results.primary.name}

## HISTORIA CLÍNICA BREVE
- **Motivo de referencia:** ${patientInfo?.chiefComplaint || 'No especificado'}
- **Antecedentes relevantes:** ${patientInfo?.relevantHistory || 'No especificados'}
- **Medicamentos actuales:** ${patientInfo?.currentMedications || 'No especificados'}

## NEUROCONDUCCIONES

${Object.entries(studyData)
  .filter(([key]) => key.includes('Motor') || key.includes('Sensory'))
  .map(([test, data]) => {
    const isMotor = test.includes('Motor');
    return `### ${test.replace('Test', '')}
- **Tipo:** ${isMotor ? 'Motor' : 'Sensitivo'}
- **Latencia:** ${data.latency} ms${isMotor ? ` (Valor normal: ${getRefValue(test, 'latency')})` : ''}
- **Amplitud:** ${data.amplitude} ${isMotor ? 'mV' : 'µV'} (Valor normal: ${getRefValue(test, 'amplitude')})
- **Velocidad de conducción:** ${data.velocity || 'No medida'} m/s${data.velocity ? ` (Valor normal: ${getRefValue(test, 'velocity')})` : ''}
`;
  }).join('\n')}

${studyData.hasOwnProperty('emgData') ? `
## ELECTROMIOGRAFÍA DE AGUJA

${studyData.emgData.map((muscle) => `
### ${muscle.name} (${muscle.side})
- **Actividad de inserción:** ${muscle.insertionActivity}
- **Actividad en reposo:** ${muscle.restActivity || 'No se observa actividad anormal'}
- **Potenciales de unidad motora:** ${muscle.motorUnitPotentials || 'Normales'}
- **Patrón de reclutamiento:** ${muscle.recruitmentPattern || 'Normal'}
- **Esfuerzo del paciente:** ${muscle.patientEffort || 'Adecuado'}
`).join('\n')}
` : '## ELECTROMIOGRAFÍA DE AGUJA\nNo se realizó estudio de electromiografía de aguja.\n'}

## CONCLUSIÓN Y DIAGNÓSTICO ELECTROFISIOLÓGICO

Estudio de electroneurografía ${results.primary.probability > 0.7 ? 'ANORMAL' : 'con POSIBLES ANORMALIDADES'}, con hallazgos electrofisiológicos ${
    results.primary.probability > 0.7 
      ? `compatibles con ${results.primary.name}.` 
      : `sugestivos de posible ${results.primary.name}, aunque los hallazgos no son concluyentes.`
}

${results.primary.keyFindings.filter(f => f.abnormal).length > 0 
  ? `Se observan los siguientes hallazgos anormales:\n${results.primary.keyFindings.filter(f => f.abnormal).map(f => `- ${f.description}`).join('\n')}`
  : 'No se observan alteraciones significativas en los parámetros evaluados.'}

${results.differentials.length > 0 
  ? `\nDiagnósticos diferenciales a considerar:\n${results.differentials.map(d => `- ${d.name} (${Math.round(d.probability * 100)}% de probabilidad)`).join('\n')}`
  : ''}

## NOTAS TÉCNICAS Y OBSERVACIONES
`;

    return report;
  };
  
  // Función auxiliar para obtener valores de referencia
  const getRefValue = (test, parameter) => {
    // Estos valores deberían venir de una base de datos de referencia
    const refValues = {
      MedianMotor: {
        latency: '2.5-4.5 ms',
        amplitude: '4.0-20.0 mV',
        velocity: '45-65 m/s'
      },
      MedianSensory: {
        latency: '2.5-3.5 ms',
        amplitude: '20-50 µV',
        velocity: '45-65 m/s'
      },
      UlnarMotor: {
        latency: '2.0-4.0 ms',
        amplitude: '4.0-20.0 mV',
        velocity: '45-65 m/s'
      }
      // Añadir más valores de referencia según sea necesario
    };
    
    for (const key in refValues) {
      if (test.includes(key)) {
        return refValues[key][parameter] || 'No disponible';
      }
    }
    return 'No disponible';
  };
  
  const handleGenerateReport = () => {
    const generatedText = generateReportText();
    setReportText(generatedText);
    setShowReport(true);
  };
  
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Reporte de Electromiografía</title>
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
            ${reportText.replace(/\n/g, '<br>').replace(/#{1,3}\s(.*?)$/gm, (match, group) => 
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
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {!showReport ? (
        <>
          <h2 className="text-xl font-bold mb-4">Análisis Diagnóstico</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Diagnóstico Principal</h3>
            <div className={`p-4 rounded-lg ${results.primary.probability > 0.7 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{results.primary.name}</p>
                  <p className="text-sm text-gray-600">
                    Probabilidad: {Math.round(results.primary.probability * 100)}%
                  </p>
                </div>
                <div className="w-20 h-20 relative">
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
                      stroke={results.primary.probability > 0.7 ? "#4ade80" : "#facc15"}
                      strokeWidth="3"
                      strokeDasharray={`${results.primary.probability * 100}, 100`}
                    />
                    <text x="18" y="20.5" className="text-3xl" textAnchor="middle" fill="#666">
                      {Math.round(results.primary.probability * 100)}%
                    </text>
                  </svg>
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1">Hallazgos clave:</h4>
                <ul className="list-disc pl-5">
                  {results.primary.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm">
                      {finding.description}
                      {finding.abnormal && <span className="text-red-600 ml-1">*</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Diagnósticos Diferenciales</h3>
            <div className="space-y-3">
              {results.differentials.length > 0 ? (
                results.differentials.map(diagnosis => (
                  <div key={diagnosis.id} className="p-3 border rounded bg-gray-50">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{diagnosis.name}</p>
                      <p className="text-sm">
                        Probabilidad: {Math.round(diagnosis.probability * 100)}%
                      </p>
                    </div>
                    {diagnosis.reason && (
                      <p className="text-sm text-gray-600 mt-1">{diagnosis.reason}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No se encontraron diagnósticos diferenciales relevantes.</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGenerateReport}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <FileText className="mr-2 h-5 w-5" />
              Generar Reporte
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Reporte de Electromiografía</h2>
            <div className="space-x-2">
              {editingReport ? (
                <button
                  onClick={() => setEditingReport(false)}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Guardar cambios
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditingReport(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={handlePrintReport}
                    className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 flex items-center"
                  >
                    <Printer className="mr-1 h-4 w-4" />
                    Imprimir
                  </button>
                </>
              )}
              <button
                onClick={() => setShowReport(false)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Volver al Análisis
              </button>
            </div>
          </div>
          
          {editingReport ? (
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full h-screen-3/4 p-4 border rounded font-mono text-sm"
              style={{ minHeight: '70vh' }}
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded border overflow-auto" style={{ maxHeight: '70vh' }}>
              <pre className="whitespace-pre-wrap font-sans">{reportText}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DiagnosticAnalysis;