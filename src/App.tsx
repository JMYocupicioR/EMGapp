import React from 'react';
import { FileText, Activity, Brain, Plus, History, ArrowLeft, Users } from 'lucide-react';
import NeuroConductionForm from './components/NeuroConductionForm';
import MyographyForm from './components/MyographyForm';
import SpecialStudiesForm from './components/SpecialStudiesForm';
import DiagnosticSelector from './components/DiagnosticSelector';
import PatientInfoForm from './components/PatientInfoForm';
import StudyProtocol from './components/StudyProtocol';
import DiagnosticAnalysis from './components/DiagnosticAnalysis';
import PatientModule from './components/patients/PatientModule';
import { StudyType } from './types';
import { useAppStore } from './store/appStore';

function App() {
  // Usar la tienda global en lugar de estados locales
  const {
    currentView, 
    setCurrentView,
    selectedStudy,
    setSelectedStudy,
    studyStep,
    setStudyStep,
    patientInfo,
    setPatientInfo,
    selectedDiagnosis,
    setSelectedDiagnosis,
    studyData,
    setStudyData,
    startNewStudy,
    navigateBack
  } = useAppStore();

  // Opciones de estudio tradicionales
  const studyOptions = [
    {
      id: 'neuroconduction' as StudyType,
      title: 'Neuroconducciones',
      icon: Activity,
      component: NeuroConductionForm
    },
    {
      id: 'myography' as StudyType,
      title: 'Miografía de Aguja',
      icon: Brain,
      component: MyographyForm
    },
    {
      id: 'special' as StudyType,
      title: 'Estudios Especiales',
      icon: FileText,
      component: SpecialStudiesForm
    }
  ];

  const SelectedComponent = selectedStudy 
    ? studyOptions.find(opt => opt.id === selectedStudy)?.component 
    : null;

  // Manejadores de eventos simplificados
  const handlePatientInfoSubmit = (info: any) => {
    setPatientInfo(info);
    setStudyStep('diagnosis');
  };
  
  const handleDiagnosisSelect = (diagnosisId: string) => {
    setSelectedDiagnosis(diagnosisId);
    setStudyStep('protocol');
  };
  
  const handleProtocolComplete = (data: any) => {
    setStudyData(data);
    setStudyStep('analysis');
  };

  const handleStartStudyWithPatient = (patient: any) => {
    setPatientInfo(patient);
    setCurrentView('new-study');
    setStudyStep('diagnosis');
  };

  // Renderizar el contenido del estudio guiado
  const renderNewStudyContent = () => {
    switch (studyStep) {
      case 'patient':
        return <PatientInfoForm onSubmit={handlePatientInfoSubmit} />;
      case 'diagnosis':
        return <DiagnosticSelector onSelect={handleDiagnosisSelect} />;
      case 'protocol':
        return selectedDiagnosis ? (
          <StudyProtocol 
            diagnosisId={selectedDiagnosis} 
            onDataCollected={handleProtocolComplete}
          />
        ) : null;
      case 'analysis':
        return (
          <DiagnosticAnalysis 
            studyData={studyData}
            initialDiagnosis={selectedDiagnosis || ''}
            patientInfo={patientInfo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Análisis de Electromiografía
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {currentView === 'home' && !selectedStudy && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={startNewStudy}
                className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-6 w-6 text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Nuevo Estudio
                  </h2>
                </div>
                <p className="mt-2 text-gray-600">
                  Iniciar un nuevo estudio siguiendo un protocolo basado en diagnóstico
                </p>
              </button>
              
              <button
                onClick={() => setCurrentView('patients')}
                className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-purple-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pacientes
                  </h2>
                </div>
                <p className="mt-2 text-gray-600">
                  Gestionar registros de pacientes y ver su historial
                </p>
              </button>
              
              <button
                onClick={() => setCurrentView('history')}
                className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <History className="h-6 w-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Historial de Estudios
                  </h2>
                </div>
                <p className="mt-2 text-gray-600">
                  Ver estudios previos y resultados
                </p>
              </button>
            </div>
            
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4">Estudios Individuales</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {studyOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSelectedStudy(option.id);
                        setCurrentView('individual-study');
                      }}
                      className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-blue-500" />
                        <h2 className="text-xl font-semibold text-gray-900">
                          {option.title}
                        </h2>
                      </div>
                      <p className="mt-2 text-gray-600">
                        Realizar análisis de {option.title.toLowerCase()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentView === 'new-study' && (
          <div className="bg-white shadow rounded-lg p-6">
            <button
              onClick={navigateBack}
              className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </button>

            {/* Barra de progreso */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full ${studyStep === 'patient' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>1</span>
                  <span className={`px-3 py-1 rounded-full ${studyStep === 'diagnosis' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>2</span>
                  <span className={`px-3 py-1 rounded-full ${studyStep === 'protocol' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>3</span>
                  <span className={`px-3 py-1 rounded-full ${studyStep === 'analysis' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>4</span>
                </div>
                <div className="text-sm text-gray-500">
                  {studyStep === 'patient' && 'Información del Paciente'}
                  {studyStep === 'diagnosis' && 'Selección de Diagnóstico'}
                  {studyStep === 'protocol' && 'Protocolo de Estudio'}
                  {studyStep === 'analysis' && 'Análisis de Resultados'}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ 
                    width: studyStep === 'patient' ? '25%' : 
                           studyStep === 'diagnosis' ? '50%' : 
                           studyStep === 'protocol' ? '75%' : '100%' 
                  }}
                ></div>
              </div>
            </div>

            {renderNewStudyContent()}
          </div>
        )}

        {currentView === 'individual-study' && selectedStudy && (
          <div className="bg-white shadow rounded-lg p-6">
            <button
              onClick={navigateBack}
              className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </button>
            {SelectedComponent && <SelectedComponent />}
          </div>
        )}

        {currentView === 'history' && (
          <div className="bg-white shadow rounded-lg p-6">
            <button
              onClick={navigateBack}
              className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </button>
            <h2 className="text-xl font-semibold mb-4">Historial de Estudios</h2>
            <p className="text-gray-600">Esta funcionalidad estará disponible próximamente.</p>
          </div>
        )}

        {currentView === 'patients' && (
          <div className="bg-white shadow rounded-lg p-6">
            <button
              onClick={navigateBack}
              className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </button>
            <PatientModule onStartStudyWithPatient={handleStartStudyWithPatient} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;