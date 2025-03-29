import React, { useState } from 'react';
import { Plus, Trash2, Activity } from 'lucide-react';
import { analyzeNerveConduction } from '../utils/analysis';
import type { NerveMeasurement, AnalysisResult, Study, Side, PendingStudy } from '../types';

const NeuroConductionForm: React.FC = () => {
  const [nerve, setNerve] = useState('');
  const [side, setSide] = useState<Side>('left');
  const [measurements, setMeasurements] = useState<NerveMeasurement>({
    latency: 0,
    velocity: 0,
    amplitude: 0
  });
  const [pendingStudies, setPendingStudies] = useState<PendingStudy[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateMeasurements = () => {
    const { latency, velocity, amplitude } = measurements;
    if (latency <= 0 || velocity <= 0 || amplitude <= 0) {
      return false;
    }
    return true;
  };

  const handleAddNerve = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nerve) {
      setError('Por favor, seleccione un nervio.');
      return;
    }

    if (!validateMeasurements()) {
      setError('Por favor, ingrese valores mayores a cero para las mediciones.');
      return;
    }

    const newPendingStudy: PendingStudy = {
      id: crypto.randomUUID(),
      nerve,
      side,
      measurements: { ...measurements }
    };

    setPendingStudies(prev => [...prev, newPendingStudy]);
    
    // Reset form for next nerve
    setMeasurements({ latency: 0, velocity: 0, amplitude: 0 });
    setNerve('');
  };

  const handleRemovePending = (id: string) => {
    setPendingStudies(prev => prev.filter(study => study.id !== id));
  };

  const handleAnalyzeAll = async () => {
    if (pendingStudies.length === 0) {
      setError('No hay nervios para analizar.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newStudies = await Promise.all(
        pendingStudies.map(async (pending) => {
          const analysisResult = await analyzeNerveConduction(pending.nerve, pending.measurements);
          return {
            id: pending.id,
            nerve: analysisResult.nerve,
            side: pending.side,
            measurements: analysisResult.measurements,
            interpretation: analysisResult.interpretation,
            status: analysisResult.status,
            timestamp: new Date().toISOString()
          };
        })
      );

      setStudies(prev => [...newStudies, ...prev]);
      setPendingStudies([]);
    } catch (err) {
      setError('Ocurrió un error durante el análisis. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setStudies(prev => prev.filter(study => study.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Estudio de Neuroconducciones</h2>
      <form onSubmit={handleAddNerve} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nervio
            </label>
            <select
              value={nerve}
              onChange={(e) => setNerve(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Seleccione un nervio...</option>
              <option value="mediano">Nervio Mediano</option>
              <option value="cubital">Nervio Cubital</option>
              <option value="radial">Nervio Radial</option>
              <option value="peroneo">Nervio Peroneo</option>
              <option value="tibial">Nervio Tibial</option>
              <option value="sural">Nervio Sural</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lado
            </label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as Side)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="left">Izquierdo</option>
              <option value="right">Derecho</option>
              <option value="bilateral">Bilateral</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Latencia (ms)
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.latency}
              onChange={(e) =>
                setMeasurements({
                  ...measurements,
                  latency: parseFloat(e.target.value)
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Velocidad de Conducción (m/s)
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.velocity}
              onChange={(e) =>
                setMeasurements({
                  ...measurements,
                  velocity: parseFloat(e.target.value)
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amplitud (mV)
            </label>
            <input
              type="number"
              step="0.1"
              value={measurements.amplitude}
              onChange={(e) =>
                setMeasurements({
                  ...measurements,
                  amplitude: parseFloat(e.target.value)
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 gap-2"
        >
          <Plus className="h-5 w-5" />
          Agregar Nervio
        </button>
      </form>

      {pendingStudies.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Nervios Pendientes de Análisis</h3>
          <div className="space-y-3">
            {pendingStudies.map((pending) => (
              <div
                key={pending.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <h4 className="font-medium text-gray-900">
                    {pending.nerve} - Lado {pending.side === 'left' ? 'Izquierdo' : pending.side === 'right' ? 'Derecho' : 'Bilateral'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Latencia: {pending.measurements.latency}ms, 
                    Velocidad: {pending.measurements.velocity}m/s, 
                    Amplitud: {pending.measurements.amplitude}mV
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePending(pending.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleAnalyzeAll}
            disabled={isLoading}
            className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 gap-2"
          >
            <Activity className="h-5 w-5" />
            {isLoading ? 'Analizando...' : 'Analizar Todos los Nervios'}
          </button>
        </div>
      )}

      {studies.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Estudios Realizados</h3>
          <div className="space-y-4">
            {studies.map((study) => (
              <div
                key={study.id}
                className={`p-4 rounded-lg border ${
                  study.status === 'normal' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {study.nerve} - Lado {study.side === 'left' ? 'Izquierdo' : study.side === 'right' ? 'Derecho' : 'Bilateral'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(study.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(study.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {study.interpretation.map((line, index) => (
                    <p key={index} className="text-sm text-gray-700">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuroConductionForm;