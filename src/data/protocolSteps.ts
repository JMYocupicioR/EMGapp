import MedainSensoryTest from '../components/testSteps/MedianSensoryTest';
import MedianMotorTest from '../components/testSteps/MedianMotorTest';
// Importar otros componentes de prueba...

export const protocolSteps = {
  medianSensory: {
    id: 'medianSensory',
    name: 'Neuroconducción Sensitiva del Nervio Mediano',
    description: 'Evalúa la latencia y amplitud del potencial sensitivo del nervio mediano',
    component: MedainSensoryTest,
    referenceValues: {
      latency: { min: 2.5, max: 3.5 },
      amplitude: { min: 20, max: 50 }
    }
  },
  medianMotor: {
    id: 'medianMotor',
    name: 'Neuroconducción Motora del Nervio Mediano',
    description: 'Evalúa la latencia distal, amplitud y velocidad de conducción motora',
    component: MedianMotorTest,
    referenceValues: {
      latency: { min: 2.8, max: 4.2 },
      amplitude: { min: 4.0, max: 20.0 },
      velocity: { min: 49, max: 65 }
    }
  },
  // Otros pasos de protocolo...
};