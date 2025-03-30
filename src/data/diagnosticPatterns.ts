// src/data/diagnosticPatterns.ts

export const diagnosticPatterns = {
  carpaTunnel: {
    id: 'carpaTunnel',
    name: 'Síndrome del túnel del carpo',
    protocolSteps: ['medianSensory', 'medianMotor'],
    keyFindings: [
      {
        parameter: 'medianSensory.latency',
        condition: '>3.5',
        importance: 'high',
      },
      {
        parameter: 'medianSensory.amplitude',
        condition: '<20',
        importance: 'high',
      },
      {
        parameter: 'medianMotor.latency',
        condition: '>4.5',
        importance: 'high',
      }
    ]
  },
  ulnarElbow: {
    id: 'ulnarElbow',
    name: 'Neuropatía cubital en el codo',
    protocolSteps: ['ulnarSensory', 'ulnarMotor'],
    keyFindings: [
      {
        parameter: 'ulnarMotor.velocity',
        condition: '<50',
        importance: 'high',
      },
      {
        parameter: 'ulnarSensory.amplitude',
        condition: '<15',
        importance: 'medium',
      }
    ]
  },
  diabeticPoly: {
    id: 'diabeticPoly',
    name: 'Polineuropatía diabética',
    protocolSteps: ['suralSensory', 'tibialMotor', 'peronealMotor'],
    keyFindings: [
      {
        parameter: 'suralSensory.amplitude',
        condition: '<6',
        importance: 'high',
      },
      {
        parameter: 'tibialMotor.velocity',
        condition: '<40',
        importance: 'high',
      },
      {
        parameter: 'peronealMotor.amplitude',
        condition: '<2',
        importance: 'medium',
      }
    ]
  },
  cidp: {
    id: 'cidp',
    name: 'Polineuropatía inflamatoria desmielinizante crónica',
    protocolSteps: ['medianMotor', 'ulnarMotor', 'tibialMotor', 'peronealMotor'],
    keyFindings: [
      {
        parameter: 'medianMotor.velocity',
        condition: '<38',
        importance: 'high',
      },
      {
        parameter: 'ulnarMotor.velocity',
        condition: '<38',
        importance: 'high',
      },
      {
        parameter: 'tibialMotor.velocity',
        condition: '<38',
        importance: 'high',
      },
      {
        parameter: 'peronealMotor.velocity',
        condition: '<38',
        importance: 'high',
      }
    ]
  }
};