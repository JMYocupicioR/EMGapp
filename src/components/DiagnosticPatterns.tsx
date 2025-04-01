import React, { useState } from 'react';
import { diagnosticPatterns } from '../data/diagnosticPatterns';
import { Activity, Brain, AlertTriangle, ZoomIn, ZoomOut, ChevronDown, ChevronUp, Info } from 'lucide-react';

/**
 * DiagnosticPatterns component visualizes the diagnostic patterns used in the application
 * for interpreting electroneurography and electromyography studies.
 */
const DiagnosticPatterns: React.FC = () => {
  const [expandedDiagnosis, setExpandedDiagnosis] = useState<string | null>(null);
  const [showImportanceFilter, setShowImportanceFilter] = useState<boolean>(false);
  const [importanceFilter, setImportanceFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const toggleDiagnosis = (id: string) => {
    setExpandedDiagnosis(expandedDiagnosis === id ? null : id);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getDiagnosisIcon = (id: string) => {
    if (id.includes('Poly')) {
      return <Activity className="h-5 w-5 text-blue-500" />;
    } else if (id.includes('Tunnel') || id.includes('Elbow')) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const formatParameter = (parameter: string) => {
    const [test, param] = parameter.split('.');
    return (
      <span>
        <span className="font-semibold">{test}</span>.{param}
      </span>
    );
  };

  const formatCondition = (condition: string) => {
    const operator = condition.charAt(0);
    const value = condition.substring(1);
    
    let operatorSymbol;
    switch(operator) {
      case '>': operatorSymbol = '>'; break;
      case '<': operatorSymbol = '<'; break;
      case '=': operatorSymbol = '='; break;
      default: operatorSymbol = condition;
    }
    
    return (
      <span>
        {operatorSymbol}<span className="font-semibold">{value}</span>
      </span>
    );
  };

  const filteredPatterns = Object.entries(diagnosticPatterns)
    .filter(([id, pattern]) => {
      const matchesSearch = searchTerm === '' || 
        pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!importanceFilter) return matchesSearch;
      
      return matchesSearch && pattern.keyFindings.some(finding => finding.importance === importanceFilter);
    });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Patrones Diagnósticos</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowImportanceFilter(!showImportanceFilter)}
            className="flex items-center px-3 py-1 bg-gray-100 rounded-md text-gray-700 text-sm hover:bg-gray-200"
          >
            <Info className="h-4 w-4 mr-1" />
            Filtrar por importancia
            {showImportanceFilter ? 
              <ChevronUp className="h-4 w-4 ml-1" /> : 
              <ChevronDown className="h-4 w-4 ml-1" />
            }
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre de diagnóstico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showImportanceFilter && (
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setImportanceFilter(null)}
            className={`px-3 py-1 rounded-md text-sm ${importanceFilter === null ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setImportanceFilter('high')}
            className={`px-3 py-1 rounded-md text-sm ${importanceFilter === 'high' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'}`}
          >
            Alta importancia
          </button>
          <button
            onClick={() => setImportanceFilter('medium')}
            className={`px-3 py-1 rounded-md text-sm ${importanceFilter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'}`}
          >
            Media importancia
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredPatterns.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No se encontraron patrones diagnósticos</p>
          </div>
        ) : (
          filteredPatterns.map(([id, pattern]) => (
            <div key={id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleDiagnosis(id)}
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left"
              >
                <div className="flex items-center">
                  {getDiagnosisIcon(id)}
                  <span className="ml-2 font-medium">{pattern.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {pattern.keyFindings.length} hallazgos clave
                  </span>
                  {expandedDiagnosis === id ? (
                    <ZoomOut className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ZoomIn className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </button>

              {expandedDiagnosis === id && (
                <div className="p-4 border-t border-gray-200">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Pasos del protocolo:</h4>
                    <div className="flex flex-wrap gap-2">
                      {pattern.protocolSteps.map((step) => (
                        <span key={step} className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-md">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-gray-500 mb-2">Hallazgos clave:</h4>
                  <div className="space-y-2">
                    {pattern.keyFindings.map((finding, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-md ${getImportanceColor(finding.importance)}`}
                      >
                        <div className="flex justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {formatParameter(finding.parameter)} {formatCondition(finding.condition)}
                            </span>
                            <span className="text-xs mt-1">
                              Importancia: {finding.importance === 'high' ? 'Alta' : 'Media'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {finding.importance === 'high' && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                                Crítico
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiagnosticPatterns;