import { diagnosticPatterns } from '../data/diagnosticPatterns';

export function analyzeDiagnostics(studyData, initialDiagnosisId) {
  const results = {
    primary: {
      id: initialDiagnosisId,
      name: diagnosticPatterns[initialDiagnosisId].name,
      probability: 0,
      keyFindings: []
    },
    differentials: []
  };
  
  // Analizar diagnóstico principal
  const primaryDiagnosis = diagnosticPatterns[initialDiagnosisId];
  let matchCount = 0;
  
  primaryDiagnosis.keyFindings.forEach(finding => {
    const [test, param] = finding.parameter.split('.');
    const value = studyData[test] && studyData[test][param];
    
    if (value) {
      const conditionMet = evaluateCondition(value, finding.condition);
      const findingResult = {
        description: `${param}: ${value} (${finding.condition})`,
        abnormal: conditionMet
      };
      
      results.primary.keyFindings.push(findingResult);
      
      if (conditionMet) {
        matchCount += finding.importance === 'high' ? 2 : 1;
      }
    }
  });
  
  // Calcular probabilidad para diagnóstico principal
  const totalPossiblePoints = primaryDiagnosis.keyFindings.reduce(
    (sum, finding) => sum + (finding.importance === 'high' ? 2 : 1), 0
  );
  
  results.primary.probability = Math.min(1, matchCount / totalPossiblePoints);
  
  // Evaluar diagnósticos diferenciales
  Object.entries(diagnosticPatterns)
    .filter(([id]) => id !== initialDiagnosisId)
    .forEach(([id, diagnosis]) => {
      let diffMatchCount = 0;
      const totalDiffPoints = diagnosis.keyFindings.reduce(
        (sum, finding) => sum + (finding.importance === 'high' ? 2 : 1), 0
      );
      
      diagnosis.keyFindings.forEach(finding => {
        const [test, param] = finding.parameter.split('.');
        const value = studyData[test] && studyData[test][param];
        
        if (value && evaluateCondition(value, finding.condition)) {
          diffMatchCount += finding.importance === 'high' ? 2 : 1;
        }
      });
      
      const probability = Math.min(1, diffMatchCount / totalDiffPoints);
      
      // Solo incluir si tiene alguna probabilidad relevante
      if (probability > 0.3) {
        results.differentials.push({
          id,
          name: diagnosis.name,
          probability,
          reason: generateReason(studyData, diagnosis)
        });
      }
    });
  
  // Ordenar diagnósticos diferenciales por probabilidad
  results.differentials.sort((a, b) => b.probability - a.probability);
  
  return results;
}

function evaluateCondition(value, condition) {
  const operator = condition.charAt(0);
  const threshold = parseFloat(condition.substring(1));
  
  switch(operator) {
    case '>': return value > threshold;
    case '<': return value < threshold;
    case '=': return value === threshold;
    default: return false;
  }
}

function generateReason(studyData, diagnosis) {
  // Lógica para generar una explicación de por qué este diagnóstico es posible
  const matchedFindings = diagnosis.keyFindings.filter(finding => {
    const [test, param] = finding.parameter.split('.');
    const value = studyData[test] && studyData[test][param];
    return value && evaluateCondition(value, finding.condition);
  });
  
  if (matchedFindings.length > 0) {
    return `Coincide con ${matchedFindings.length} de los hallazgos clave para este diagnóstico.`;
  }
  
  return 'Algunos hallazgos son compatibles con este diagnóstico.';
}