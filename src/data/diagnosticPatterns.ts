export const diagnosticPatterns = {
  carpaTunnel: {
    name: 'Síndrome del túnel del carpo',
    description: 'Neuropatía por compresión del nervio mediano a nivel de la muñeca',
    keyFindings: [
      { parameter: 'medianSensoryIndex.latency', condition: '>3.5', importance: 'high' },
      { parameter: 'medianSensoryIndex.amplitude', condition: '<20', importance: 'medium' },
      { parameter: 'medianMotor.latency', condition: '>4.5', importance: 'high' },
      { parameter: 'combinedSensoryIndex', condition: '>0.9', importance: 'high' },
      { parameter: 'fResponseDiff', condition: '>2', importance: 'medium' },
      { parameter: 'palmDiff', condition: '>0.3', importance: 'medium' }
    ],
    protocolSteps: [
      'medianMotor', 
      'ulnarMotor', 
      'medianSensory', 
      'ulnarSensory', 
      'radialSensory', 
      'combinedIndex',
      'fResponses'
    ]
  },
  ulnarElbow: {
    name: 'Neuropatía cubital en el codo',
    description: 'Compresión del nervio cubital a nivel del canal epitrócleo-olecraneano',
    keyFindings: [
      { parameter: 'Velocidad de conducción a través del codo', condition: '<50m/s', importance: 'high' },
      { parameter: 'Caída de amplitud a través del codo', condition: '>20%', importance: 'high' },
      { parameter: 'Conducción motora del nervio cubital', condition: 'Bloqueo de conducción', importance: 'medium' },
      { parameter: 'Latencia sensitiva del nervio cubital', condition: 'Prolongada', importance: 'medium' }
    ],
    protocolSteps: []
  },
  diabeticPoly: {
    name: 'Polineuropatía diabética',
    description: 'Afectación simétrica, distal, sensitivo-motora de los nervios periféricos',
    keyFindings: [
      { parameter: 'Amplitud del potencial sensitivo del nervio sural', condition: '<6µV', importance: 'high' },
      { parameter: 'Velocidad de conducción del nervio tibial', condition: '<40m/s', importance: 'high' },
      { parameter: 'Amplitud del potencial motor del nervio peroneo', condition: '<2mV', importance: 'medium' },
      { parameter: 'Patrón de afectación', condition: 'Simétrico y distal', importance: 'high' }
    ],
    protocolSteps: []
  },
  cidp: {
    name: 'Polineuropatía inflamatoria desmielinizante crónica',
    description: 'Proceso autoinmune que afecta a la mielina de los nervios periféricos',
    keyFindings: [
      { parameter: 'Velocidad de conducción del nervio mediano', condition: '<38m/s', importance: 'high' },
      { parameter: 'Latencia distal motora', condition: 'Muy prolongada', importance: 'high' },
      { parameter: 'Bloqueos de conducción', condition: 'Presentes', importance: 'high' },
      { parameter: 'Dispersión temporal', condition: 'Presente', importance: 'medium' },
      { parameter: 'Ondas F', condition: 'Ausentes o muy prolongadas', importance: 'medium' }
    ],
    protocolSteps: []
  },
  als: {
    name: 'Esclerosis lateral amiotrófica',
    description: 'Enfermedad neurodegenerativa que afecta a las motoneuronas',
    keyFindings: [
      { parameter: 'Potenciales de fasciculación', condition: 'Presentes en múltiples territorios', importance: 'high' },
      { parameter: 'Potenciales de fibrilación', condition: 'Presentes', importance: 'high' },
      { parameter: 'Ondas positivas agudas', condition: 'Presentes', importance: 'medium' },
      { parameter: 'Potenciales de unidad motora', condition: 'Grandes, polifásicos', importance: 'high' },
      { parameter: 'Patrón de reclutamiento', condition: 'Reducido', importance: 'high' }
    ],
    protocolSteps: []
  }
};