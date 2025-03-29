export type StudyType = 'neuroconduction' | 'myography' | 'special';

export type Side = 'left' | 'right' | 'bilateral';

export interface NerveMeasurement {
  latency: number;
  velocity: number;
  amplitude: number;
}

export interface PendingStudy {
  id: string;
  nerve: string;
  side: Side;
  measurements: NerveMeasurement;
}

export interface Study {
  id: string;
  nerve: string;
  side: Side;
  measurements: NerveMeasurement;
  interpretation: string[];
  status: 'normal' | 'abnormal';
  timestamp: string;
}

export interface NerveReference {
  name: string;
  latency: { min: number; max: number };
  velocity: { min: number; max: number };
  amplitude: { min: number; max: number };
}

export interface AnalysisResult {
  nerve: string;
  measurements: NerveMeasurement;
  interpretation: string[];
  status: 'normal' | 'abnormal';
}