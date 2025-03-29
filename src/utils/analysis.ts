import type { NerveMeasurement, AnalysisResult, NerveReference } from '../types';

const nerveReferences: Record<string, NerveReference> = {
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
  }
};

function analyzeParameter(
  parameter: keyof NerveMeasurement,
  value: number,
  referenceRange: { min: number; max: number }
): { message: string; abnormal: boolean } {
  switch (parameter) {
    case 'latency':
      if (value > referenceRange.max) {
        return { message: `Latencia prolongada (${value} ms): posible neuropatía desmielinizante.`, abnormal: true };
      } else if (value < referenceRange.min) {
        return { message: `Latencia reducida (${value} ms): hallazgo inusual.`, abnormal: true };
      } else {
        return { message: `Latencia normal (${value} ms).`, abnormal: false };
      }
    case 'velocity':
      if (value < referenceRange.min) {
        return { message: `Velocidad reducida (${value} m/s): indicativo de neuropatía desmielinizante.`, abnormal: true };
      } else if (value > referenceRange.max) {
        return { message: `Velocidad aumentada (${value} m/s): hallazgo inusual.`, abnormal: true };
      } else {
        return { message: `Velocidad de conducción normal (${value} m/s).`, abnormal: false };
      }
    case 'amplitude':
      if (value < referenceRange.min) {
        return { message: `Amplitud reducida (${value} mV): posible neuropatía axonal.`, abnormal: true };
      } else if (value > referenceRange.max) {
        return { message: `Amplitud aumentada (${value} mV): hallazgo inusual.`, abnormal: true };
      } else {
        return { message: `Amplitud normal (${value} mV).`, abnormal: false };
      }
    default:
      return { message: 'Parámetro desconocido.', abnormal: false };
  }
}

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

  return {
    nerve: reference.name,
    measurements,
    interpretation,
    status
  };
}
