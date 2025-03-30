import React, { useState } from 'react';
import DiagnosticSelector from '../components/DiagnosticSelector';
import StudyProtocol from '../components/StudyProtocol';
import DiagnosticAnalysis from '../components/DiagnosticAnalysis';
import PatientInfoForm from '../components/PatientInfoForm';

const NewStudyPage = () => {
  const [step, setStep] = useState('patient'); // patient, diagnosis, protocol, analysis
  const [patientInfo, setPatientInfo] = useState(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [studyData, setStudyData] = useState({});
  
  const handlePatientInfoSubmit = (info) => {
    setPatientInfo(info);
    setStep('diagnosis');
  };
  
  const handleDiagnosisSelect = (diagnosisId) => {
    setSelectedDiagnosis(diagnosisId);
    setStep('protocol');
  };
  
  const handleProtocolComplete = (data) => {
    setStudyData(data);
    setStep('analysis');
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {step === 'patient' && (
        <PatientInfoForm onSubmit={handlePatientInfoSubmit} />
      )}
      
      {step === 'diagnosis' && (
        <DiagnosticSelector onSelect={handleDiagnosisSelect} />
      )}
      
      {step === 'protocol' && selectedDiagnosis && (
        <StudyProtocol 
          diagnosisId={selectedDiagnosis} 
          onDataCollected={handleProtocolComplete}
        />
      )}
      
      {step === 'analysis' && (
        <DiagnosticAnalysis 
          studyData={studyData}
          initialDiagnosis={selectedDiagnosis}
        />
      )}
      
      {/* Barra de navegación de pasos */}
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between">
          <button 
            onClick={() => {
              if (step === 'diagnosis') setStep('patient');
              if (step === 'protocol') setStep('diagnosis');
              if (step === 'analysis') setStep('protocol');
            }}
            disabled={step === 'patient'}
            className={`px-4 py-2 rounded ${step === 'patient' ? 'bg-gray-200 text-gray-500' : 'bg-gray-500 text-white hover:bg-gray-600'}`}
          >
            Atrás
          </button>
          
          <div className="flex space-x-1">
            <div className={`w-3 h-3 rounded-full ${step === 'patient' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'diagnosis' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'protocol' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'analysis' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewStudyPage;