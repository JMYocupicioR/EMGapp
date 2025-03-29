import React, { useState } from 'react';
import { FileText, Activity, Brain } from 'lucide-react';
import NeuroConductionForm from './components/NeuroConductionForm';
import MyographyForm from './components/MyographyForm';
import SpecialStudiesForm from './components/SpecialStudiesForm';
import { StudyType } from './types';

function App() {
  const [selectedStudy, setSelectedStudy] = useState<StudyType | null>(null);

  const studyOptions = [
    {
      id: 'neuroconduction',
      title: 'Neuroconducciones',
      icon: Activity,
      component: NeuroConductionForm
    },
    {
      id: 'myography',
      title: 'Miografía de Aguja',
      icon: Brain,
      component: MyographyForm
    },
    {
      id: 'special',
      title: 'Estudios Especiales',
      icon: FileText,
      component: SpecialStudiesForm
    }
  ];

  const SelectedComponent = selectedStudy 
    ? studyOptions.find(opt => opt.id === selectedStudy)?.component 
    : null;

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
        {!selectedStudy ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedStudy(option.id as StudyType)}
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
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <button
              onClick={() => setSelectedStudy(null)}
              className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
            >
              ← Volver
            </button>
            {SelectedComponent && <SelectedComponent />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;