// src/utils/analysis.ts

import type { NerveMeasurement, AnalysisResult, NerveReference } from '../types';

// Valores de referencia para cada nervio
export const nerveReferences: Record<string, NerveReference> = {
  mediano: {
    name: 'Nervio Mediano',
    latency: { min: 2.5, max: 4.5 },
    velocity: { min: 45, max: 65 },
    amplitude: { min: 4.0, max: 20.0 }
  },
  cubital: {
    name: 'Nervio Cubital',
    latency: { min: 2.0, max: 4.0 },
    velocity: { min: 45, max: 65 },
    amplitude: { min: 4.0, max: 20.0 }
  },
  peroneo: {
    name: 'Nervio Peroneo',
    latency: { min: 3.0, max: 5.5 },
    velocity: { min: 40, max: 60 },
    amplitude: { min: 2.0, max: 10.0 }
  },
  tibial: {
    name: 'Nervio Tibial',
    latency: { min: 3.5, max: 6.0 },
    velocity: { min: 40, max: 60 },
    amplitude: { min: 3.0, max: 15.0 }
  },
  sural: {
    name: 'Nervio Sural',
    latency: { min: 2.5, max: 4.0 },
    velocity: { min: 40, max: 60 },
    amplitude: { min: 10.0, max: 50.0 }
  },
  radial: {
    name: 'Nervio Radial',
    latency: { min: 2.5, max: 4.5 },
    velocity: { min: 45, max: 65 },
    amplitude: { min: 5.0, max: 25.0 }
  }
};

/**
 * Analiza un parámetro específico de la neuroconducción y genera un mensaje interpretativo
 */
function analyzeParameter(
  parameter: keyof NerveMeasurement,
  value: number,
  referenceRange: { min: number; max: number }
): { message: string; abnormal: boolean } {
  switch (parameter) {
    case 'latency':
      if (value > referenceRange.max) {
        return { 
          message: `Latencia prolongada (${value} ms): posible neuropatía desmielinizante.`, 
          abnormal: true 
        };
      } else if (value < referenceRange.min) {
        return { 
          message: `Latencia reducida (${value} ms): hallazgo inusual, posible hiperexcitabilidad.`, 
          abnormal: true 
        };
      } else {
        return { 
          message: `Latencia normal (${value} ms).`, 
          abnormal: false 
        };
      }
    case 'velocity':
      if (value < referenceRange.min) {
        return { 
          message: `Velocidad reducida (${value} m/s): indicativo de neuropatía desmielinizante.`, 
          abnormal: true 
        };
      } else if (value > referenceRange.max) {
        return { 
          message: `Velocidad aumentada (${value} m/s): hallazgo inusual.`, 
          abnormal: true 
        };
      } else {
        return { 
          message: `Velocidad de conducción normal (${value} m/s).`, 
          abnormal: false 
        };
      }
    case 'amplitude':
      if (value < referenceRange.min) {
        return { 
          message: `Amplitud reducida (${value} mV): posible neuropatía axonal o bloqueo de conducción.`, 
          abnormal: true 
        };
      } else if (value > referenceRange.max) {
        return { 
          message: `Amplitud aumentada (${value} mV): posible síndrome de hiperexcitabilidad.`, 
          abnormal: true 
        };
      } else {
        return { 
          message: `Amplitud normal (${value} mV).`, 
          abnormal: false 
        };
      }
    default:
      return { message: 'Parámetro desconocido.', abnormal: false };
  }
}

/**
 * Analiza las mediciones de neuroconducción para un nervio específico
 * y genera una interpretación clínica
 */
export function analyzeNerveConduction(
  nerve: string,
  measurements: NerveMeasurement
): AnalysisResult {
  const reference = nerveReferences[nerve];
  if (!reference) {
    throw new Error(`Nervio no encontrado: ${nerve}`);
  }

  const interpretation: string[] = [];
  let status: 'normal' | 'abnormal' = 'normal';

  // Análisis de latencia
  const latencyResult = analyzeParameter('latency', measurements.latency, reference.latency);
  interpretation.push(latencyResult.message);
  if (latencyResult.abnormal) status = 'abnormal';

  // Análisis de velocidad
  const velocityResult = analyzeParameter('velocity', measurements.velocity, reference.velocity);
  interpretation.push(velocityResult.message);
  if (velocityResult.abnormal) status = 'abnormal';

  // Análisis de amplitud
  const amplitudeResult = analyzeParameter('amplitude', measurements.amplitude, reference.amplitude);
  interpretation.push(amplitudeResult.message);
  if (amplitudeResult.abnormal) status = 'abnormal';

  // Análisis combinado
  if (status === 'abnormal') {
    // Patrones específicos de enfermedades
    if (latencyResult.abnormal && velocityResult.abnormal && !amplitudeResult.abnormal) {
      interpretation.push(`El patrón de latencia prolongada y velocidad reducida con amplitud conservada sugiere una neuropatía predominantemente desmielinizante del ${reference.name}.`);
    } else if (amplitudeResult.abnormal && !latencyResult.abnormal && !velocityResult.abnormal) {
      interpretation.push(`El patrón de amplitud reducida con preservación de latencia y velocidad sugiere una neuropatía predominantemente axonal del ${reference.name}.`);
    } else if (latencyResult.abnormal && amplitudeResult.abnormal && velocityResult.abnormal) {
      interpretation.push(`Hallazgos compatibles con neuropatía mixta (axonal y desmielinizante) del ${reference.name}.`);
    }
    
    // Recomendaciones específicas según el nervio
    if (nerve === 'mediano' && latencyResult.abnormal) {
      interpretation.push('Se recomienda considerar electromiografía complementaria para evaluar posible Síndrome del Túnel Carpiano.');
    } else if (nerve === 'cubital' && latencyResult.abnormal) {
      interpretation.push('Se recomienda evaluar región del codo para descartar compresión del nervio a este nivel.');
    } else if ((nerve === 'peroneo' || nerve === 'tibial') && amplitudeResult.abnormal) {
      interpretation.push('Se recomienda estudio complementario para descartar polineuropatía o radiculopatía lumbar.');
    }
  } else {
    interpretation.push(`Todos los parámetros de conducción del ${reference.name} se encuentran dentro de los rangos normales.`);
  }

  return {
    nerve: reference.name,
    measurements,
    interpretation,
    status
  };
}