import React, { useState, useEffect } from 'react';
import { Activity, Save, AlertTriangle, FileText, PlusCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { analyzeNerveConduction } from '../utils/analysis';
import DiagnosticPatterns from './DiagnosticPatterns';
import type { NerveMeasurement, AnalysisResult, Study, Side } from '../types';
import { nerveReferences } from '../utils/analysis';

const NeuroConductionForm: React.FC = () => {
  // Estados para el formulario
  const [selectedNerve, setSelectedNerve] = useState<string>('');
  const [selectedSide, setSelectedSide] = useState<Side>('left');
  const [measurements, setMeasurements] = useState<NerveMeasurement>({
    latency: 0,
    velocity: 0,
    amplitude: 0
  });
  
  // Estados para resultados y UI
  const [studies, setStudies] = useState<Study[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Datos de referencia de nervios
  const nerveOptions = [
    { id: 'mediano', name: 'Nervio Mediano', latencyRange: '2.5-4.5 ms', amplitudeRange: '4.0-20.0 mV', velocityRange: '45-65 m/s' },
    { id: 'cubital', name: 'Nervio Cubital', latencyRange: '2.0-4.0 ms', amplitudeRange: '4.0-20.0 mV', velocityRange: '45-65 m/s' },
    { id: 'peroneo', name: 'Nervio Peroneo', latencyRange: '3.0-5.5 ms', amplitudeRange: '2.0-10.0 mV', velocityRange: '40-60 m/s' },
    { id: 'tibial', name: 'Nervio Tibial', latencyRange: '3.5-6.0 ms', amplitudeRange: '3.0-15.0 mV', velocityRange: '40-60 m/s' },
    { id: 'sural', name: 'Nervio Sural', latencyRange: '2.5-4.0 ms', amplitudeRange: '10.0-50.0 µV', velocityRange: '40-60 m/s' },
    { id: 'radial', name: 'Nervio Radial', latencyRange: '2.5-4.5 ms', amplitudeRange: '5.0-25.0 mV', velocityRange: '45-65 m/s' }
  ];
  
  // Manejadores de eventos
  const handleNerveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNerve(e.target.value);
    setAnalysisResult(null);
    // Resetear posibles errores de validación
    if (validationErrors.nerve) {
      const { nerve, ...rest } = validationErrors;
      setValidationErrors(rest);
    }
  };
  
  const handleSideChange = (side: Side) => {
    setSelectedSide(side);
  };
  
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setMeasurements(prev => ({
      ...prev,
      [name]: isNaN(numValue) ? 0 : numValue
    }));
    
    // Resetear posibles errores de validación
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };
  
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedNerve) {
      errors.nerve = 'Debe seleccionar un nervio';
    }
    
    if (measurements.latency <= 0) {
      errors.latency = 'La latencia debe ser mayor a 0';
    }
    
    if (measurements.amplitude <= 0) {
      errors.amplitude = 'La amplitud debe ser mayor a 0';
    }
    
    if (measurements.velocity <= 0) {
      errors.velocity = 'La velocidad debe ser mayor a 0';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = analyzeNerveConduction(selectedNerve, measurements);
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Error en el análisis:', error);
      setValidationErrors({
        form: 'Ocurrió un error durante el análisis. Verifique los datos ingresados.'
      });
    }
  };
  
  const handleSaveStudy = () => {
    if (!analysisResult) return;
    
    setIsSaving(true);
    
    // Simular retraso para dar feedback visual
    setTimeout(() => {
      const newStudy: Study = {
        id: crypto.randomUUID(),
        nerve: selectedNerve,
        side: selectedSide,
        measurements: { ...measurements },
        interpretation: analysisResult.interpretation,
        status: analysisResult.status,
        timestamp: new Date().toISOString()
      };
      
      setStudies(prev => [newStudy, ...prev]);
      setIsSaving(false);
      setShowAnalysis(false);
      setAnalysisResult(null);
      setSelectedNerve('');
      setMeasurements({
        latency: 0,
        velocity: 0,
        amplitude: 0
      });
    }, 500);
  };
  
  const handleDeleteStudy = (id: string) => {
    setStudies(prev => prev.filter(study => study.id !== id));
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };
  
  const getSelectedNerveInfo = () => {
    return nerveOptions.find(nerve => nerve.id === selectedNerve);
  };
  
  // Determinar si un valor está fuera del rango de referencia
  const isOutOfRange = (parameter: 'latency' | 'amplitude' | 'velocity', value: number): boolean => {
    if (!selectedNerve) return false;
    
    const nerveInfo = getSelectedNerveInfo();
    if (!nerveInfo) return false;
    
    let rangeStr = '';
    switch (parameter) {
      case 'latency': rangeStr = nerveInfo.latencyRange; break;
      case 'amplitude': rangeStr = nerveInfo.amplitudeRange; break;
      case 'velocity': rangeStr = nerveInfo.velocityRange; break;
    }
    
    const [min, max] = rangeStr.split('-')[0].split(' ')[0].split('-').map(parseFloat);
    return value < min || value > max;
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Análisis de Neuroconducciones</h2>
      
      {!showAnalysis ? (
        <form onSubmit={handleAnalyze} className="space-y-6">
          {validationErrors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{validationErrors.form}</span>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Datos del Nervio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nervio a evaluar <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedNerve}
                  onChange={handleNerveChange}
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.nerve ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar nervio</option>
                  {nerveOptions.map(nerve => (
                    <option key={nerve.id} value={nerve.id}>
                      {nerve.name}
                    </option>
                  ))}
                </select>
                {validationErrors.nerve && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nerve}</p>
                )}
                
                {selectedNerve && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Rangos de referencia:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Latencia: {getSelectedNerveInfo()?.latencyRange}</li>
                      <li>Amplitud: {getSelectedNerveInfo()?.amplitudeRange}</li>
                      <li>Velocidad: {getSelectedNerveInfo()?.velocityRange}</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lado <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleSideChange('left')}
                    className={`px-4 py-2 rounded-md ${
                      selectedSide === 'left'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    Izquierdo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSideChange('right')}
                    className={`px-4 py-2 rounded-md ${
                      selectedSide === 'right'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    Derecho
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSideChange('bilateral')}
                    className={`px-4 py-2 rounded-md ${
                      selectedSide === 'bilateral'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    Bilateral
                  </button>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Mediciones</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latencia (ms) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="latency"
                  step="0.1"
                  value={measurements.latency || ''}
                  onChange={handleMeasurementChange}
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.latency 
                      ? 'border-red-500 bg-red-50' 
                      : isOutOfRange('latency', measurements.latency) && measurements.latency > 0
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300'
                  }`}
                />
                {validationErrors.latency ? (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.latency}</p>
                ) : (
                  isOutOfRange('latency', measurements.latency) && measurements.latency > 0 && (
                    <p className="mt-1 text-sm text-yellow-600">Valor fuera del rango de referencia</p>
                  )
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amplitud (mV) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amplitude"
                  step="0.1"
                  value={measurements.amplitude || ''}
                  onChange={handleMeasurementChange}
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.amplitude 
                      ? 'border-red-500 bg-red-50' 
                      : isOutOfRange('amplitude', measurements.amplitude) && measurements.amplitude > 0
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300'
                  }`}
                />
                {validationErrors.amplitude ? (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.amplitude}</p>
                ) : (
                  isOutOfRange('amplitude', measurements.amplitude) && measurements.amplitude > 0 && (
                    <p className="mt-1 text-sm text-yellow-600">Valor fuera del rango de referencia</p>
                  )
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Velocidad de Conducción (m/s) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="velocity"
                  step="0.1"
                  value={measurements.velocity || ''}
                  onChange={handleMeasurementChange}
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.velocity 
                      ? 'border-red-500 bg-red-50' 
                      : isOutOfRange('velocity', measurements.velocity) && measurements.velocity > 0
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300'
                  }`}
                />
                {validationErrors.velocity ? (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.velocity}</p>
                ) : (
                  isOutOfRange('velocity', measurements.velocity) && measurements.velocity > 0 && (
                    <p className="mt-1 text-sm text-yellow-600">Valor fuera del rango de referencia</p>
                  )
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Activity className="mr-2 h-5 w-5" />
                Analizar Resultados
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Análisis de {nerveOptions.find(n => n.id === selectedNerve)?.name} ({
                selectedSide === 'left' ? 'Izquierdo' : 
                selectedSide === 'right' ? 'Derecho' : 'Bilateral'
              })
            </h3>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAnalysis(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Volver
              </button>
              
              <button
                onClick={handleSaveStudy}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
              >
                {isSaving ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Estudio
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">Latencia</span>
                <span className={`text-lg font-medium ${
                  isOutOfRange('latency', measurements.latency) ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {measurements.latency} ms
                </span>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-500">Amplitud</span>
                <span className={`text-lg font-medium ${
                  isOutOfRange('amplitude', measurements.amplitude) ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {measurements.amplitude} mV
                </span>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-500">Velocidad</span>
                <span className={`text-lg font-medium ${
                  isOutOfRange('velocity', measurements.velocity) ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {measurements.velocity} m/s
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Interpretación</h4>
              <div className={`p-4 rounded-lg ${
                analysisResult?.status === 'normal' ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <ul className="space-y-1">
                  {analysisResult?.interpretation.map((item, index) => (
                    <li key={index} className="text-gray-800">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Conclusión</h4>
                <p className="text-gray-800">
                  {analysisResult?.status === 'normal' ? (
                    <span>Los parámetros de conducción del {nerveOptions.find(n => n.id === selectedNerve)?.name} se encuentran dentro de los rangos de normalidad.</span>
                  ) : (
                    <span>Se observan alteraciones en los parámetros de conducción del {nerveOptions.find(n => n.id === selectedNerve)?.name} que sugieren un posible cuadro patológico.</span>
                  )}
                </p>
              </div>
            </div>
            
            <div>
              {/* Comentarios del médico */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Observaciones médicas</h4>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Ingrese sus observaciones clínicas o notas adicionales aquí..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Estudios anteriores */}
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
                      {nerveOptions.find(n => n.id === study.nerve)?.name} - Lado {
                        study.side === 'left' ? 'Izquierdo' : 
                        study.side === 'right' ? 'Derecho' : 'Bilateral'
                      }
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(study.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteStudy(study.id)}
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
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">Mediciones: </span>
                  <span className="text-gray-700">
                    Latencia: {study.measurements.latency}ms, 
                    Amplitud: {study.measurements.amplitude}mV, 
                    Velocidad: {study.measurements.velocity}m/s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Sección educativa */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium">Recursos para interpretación</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información general */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-blue-800 mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Información sobre las Neuroconducciones
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Las pruebas de neuroconducción son procedimientos utilizados para evaluar el funcionamiento de los nervios periféricos. Miden la velocidad y fuerza con la que las señales eléctricas viajan a través de los nervios.
            </p>
            <p className="text-sm text-blue-700">
              <strong>Latencia:</strong> Tiempo que tarda un impulso nervioso en viajar desde el punto de estimulación hasta el punto de registro (ms).<br />
              <strong>Amplitud:</strong> Tamaño de la respuesta eléctrica, indica la cantidad de fibras nerviosas funcionantes (mV o μV).<br />
              <strong>Velocidad de conducción:</strong> Rapidez con la que se transmite el impulso nervioso (m/s).
            </p>
            
            <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
              <p className="font-medium">Valores de referencia importantes:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>La velocidad de conducción normal en extremidades superiores es generalmente &gt;50 m/s</li>
                <li>La velocidad de conducción normal en extremidades inferiores es generalmente &gt;40 m/s</li>
                <li>Una diferencia lado-lado &gt;10% debe considerarse significativa</li>
                <li>La temperatura del miembro afecta significativamente los valores (debe mantenerse &gt;32°C)</li>
              </ul>
            </div>
          </div>
          
          {/* Patrones diagnósticos */}
          <DiagnosticPatterns />
        </div>
      </div>
    </div>
  );
};

export default NeuroConductionForm;