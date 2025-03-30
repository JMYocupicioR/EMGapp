import React, { useState } from 'react';
import { diagnosticPatterns } from '../data/diagnosticPatterns';
import { protocolSteps } from '../data/protocolSteps';

const StudyProtocol = ({ diagnosisId, onDataCollected }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [collectedData, setCollectedData] = useState({});
  
  const diagnosis = diagnosticPatterns[diagnosisId];
  const protocol = diagnosis.protocolSteps.map(stepId => protocolSteps[stepId]);
  
  const handleStepCompletion = (stepData) => {
    const updatedData = {...collectedData, ...stepData};
    setCollectedData(updatedData);
    
    if (currentStep < protocol.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onDataCollected(updatedData);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Protocolo para: {diagnosis.name}</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" 
                 style={{ width: `${((currentStep + 1) / protocol.length) * 100}%` }}>
            </div>
          </div>
          <span className="ml-2 text-sm font-medium">
            {currentStep + 1} de {protocol.length}
          </span>
        </div>
      </div>
      
      {protocol[currentStep] && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-2">{protocol[currentStep].name}</h3>
          <p className="text-gray-600 mb-4">{protocol[currentStep].description}</p>
          
          {/* Renderizar el componente específico para este paso */}
          {protocol[currentStep].component && React.createElement(
            protocol[currentStep].component, 
            { 
              onComplete: handleStepCompletion,
              referenceValues: protocol[currentStep].referenceValues
            }
          )}
        </div>
      )}
    </div>
  );
};

export default StudyProtocol;